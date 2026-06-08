#!/usr/bin/env bun
import { readFile } from 'node:fs/promises';

const DEFAULT_REPO = 'ncrmro/website';
const DEFAULT_BASE_BRANCH = 'main';
const POST_DIR = 'code/web/src/content/blog';
const PREVIEW_MARKER = '<!-- gha-preview-deploy -->';

type Json = Record<string, unknown>;

type CliOptions = {
	flags: Record<string, string | boolean>;
	positionals: string[];
};

type GithubContent = {
	sha: string;
	content?: string;
	encoding?: string;
};

type GithubPull = {
	number: number;
	html_url: string;
	state: string;
	head: { ref: string; sha: string };
};

const env = {
	token: process.env.GITHUB_CONTENT_PAT ?? process.env.GITHUB_TOKEN,
	repo: process.env.GITHUB_REPO ?? DEFAULT_REPO,
	baseBranch: process.env.GITHUB_BASE_BRANCH ?? DEFAULT_BASE_BRANCH,
};

function usage(): never {
	console.error(`Usage:
  bun run post:bot new <slug> --title "Title" [--description "..."] [--body-file ./post.mdx] [--tag foo] [--published]
  bun run post:bot edit <slug> --body-file ./post.mdx [--branch post/my-post]
  bun run post:bot publish <slug> [--direct] [--branch post/my-post]
  bun run post:bot status <pr-number>

Environment:
  GITHUB_CONTENT_PAT  Fine-grained repo PAT with Contents RW, Pull requests RW, Actions read
  GITHUB_REPO         Defaults to ${DEFAULT_REPO}
  GITHUB_BASE_BRANCH  Defaults to ${DEFAULT_BASE_BRANCH}`);
	process.exit(1);
}

function parseArgs(argv: string[]): CliOptions {
	const flags: Record<string, string | boolean> = {};
	const positionals: string[] = [];

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (!arg.startsWith('--')) {
			positionals.push(arg);
			continue;
		}

		const key = arg.slice(2);
		const next = argv[index + 1];
		if (!next || next.startsWith('--')) {
			flags[key] = true;
			continue;
		}

		if (key === 'tag') {
			const existing = flags[key];
			flags[key] = existing ? `${existing},${next}` : next;
		} else {
			flags[key] = next;
		}
		index += 1;
	}

	return { flags, positionals };
}

function requireToken(): string {
	if (!env.token) {
		throw new Error('Missing GITHUB_CONTENT_PAT or GITHUB_TOKEN. Do not put PATs in files; export it in your shell or store it as a Worker/GitHub secret.');
	}
	return env.token;
}

function assertSlug(slug: string): void {
	if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(slug)) {
		throw new Error(`Invalid slug "${slug}". Use kebab-case lowercase letters, numbers, and dashes.`);
	}
}

function postPath(slug: string): string {
	assertSlug(slug);
	return `${POST_DIR}/${slug}.mdx`;
}

function branchFor(slug: string, explicit?: string | boolean): string {
	if (typeof explicit === 'string') return explicit;
	return `post/${slug}`;
}

async function gh<T>(method: string, path: string, body?: Json): Promise<T> {
	const response = await fetch(`https://api.github.com${path}`, {
		method,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${requireToken()}`,
			'Content-Type': 'application/json',
			'X-GitHub-Api-Version': '2022-11-28',
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	const text = await response.text();
	const data = text ? JSON.parse(text) : undefined;
	if (!response.ok) {
		const message = typeof data?.message === 'string' ? data.message : text;
		throw new Error(`${method} ${path} failed (${response.status}): ${message}`);
	}
	return data as T;
}

async function ghMaybe<T>(method: string, path: string, body?: Json): Promise<T | undefined> {
	try {
		return await gh<T>(method, path, body);
	} catch (error) {
		if (error instanceof Error && error.message.includes('(404)')) return undefined;
		throw error;
	}
}

async function ensureBranch(branch: string): Promise<void> {
	const existing = await ghMaybe<Json>('GET', `/repos/${env.repo}/git/ref/heads/${branch}`);
	if (existing) return;

	const base = await gh<{ object: { sha: string } }>('GET', `/repos/${env.repo}/git/ref/heads/${env.baseBranch}`);
	await gh('POST', `/repos/${env.repo}/git/refs`, {
		ref: `refs/heads/${branch}`,
		sha: base.object.sha,
	});
}

async function getFile(path: string, ref: string): Promise<GithubContent | undefined> {
	return ghMaybe<GithubContent>('GET', `/repos/${env.repo}/contents/${path}?ref=${encodeURIComponent(ref)}`);
}

function decodeContent(file: GithubContent): string {
	if (file.encoding !== 'base64' || !file.content) {
		throw new Error('GitHub returned unsupported file content encoding.');
	}
	return Buffer.from(file.content.replaceAll('\n', ''), 'base64').toString('utf8');
}

async function putFile(path: string, branch: string, content: string, message: string): Promise<void> {
	const existing = await getFile(path, branch);
	await gh('PUT', `/repos/${env.repo}/contents/${path}`, {
		message,
		content: Buffer.from(content, 'utf8').toString('base64'),
		branch,
		sha: existing?.sha,
	});
}

function yamlString(value: string): string {
	return JSON.stringify(value);
}

function yamlArray(csv: string | boolean | undefined): string {
	if (typeof csv !== 'string' || csv.length === 0) return '[]';
	return JSON.stringify(csv.split(',').map((tag) => tag.trim()).filter(Boolean));
}

async function readBody(flags: Record<string, string | boolean>, fallback: string): Promise<string> {
	const bodyFile = flags['body-file'];
	if (typeof bodyFile === 'string') return readFile(bodyFile, 'utf8');
	return fallback;
}

function makePost(slug: string, flags: Record<string, string | boolean>, body: string): string {
	const title = flags.title;
	if (typeof title !== 'string' || title.length === 0) throw new Error('new requires --title "..."');
	const description = typeof flags.description === 'string' ? flags.description : '';
	const published = flags.published === true;
	const date = new Date().toISOString().slice(0, 10);
	return `---\ntitle: ${yamlString(title)}\ndescription: ${yamlString(description)}\npublish_date: ${date}\npublished: ${published}\ntags: ${yamlArray(flags.tag)}\n---\n\n${body.trim()}\n`;
}

function setPublished(content: string): string {
	const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) throw new Error('Post is missing YAML frontmatter.');

	let frontmatter = match[1];
	if (/^published:/m.test(frontmatter)) {
		frontmatter = frontmatter.replace(/^published:.*$/m, 'published: true');
	} else {
		frontmatter = `${frontmatter}\npublished: true`;
	}
	if (!/^publish_date:/m.test(frontmatter)) {
		frontmatter = `${frontmatter}\npublish_date: ${new Date().toISOString().slice(0, 10)}`;
	}

	return `---\n${frontmatter}\n---\n${content.slice(match[0].length)}`;
}

async function findOrCreatePr(branch: string, title: string, body: string): Promise<GithubPull> {
	const [owner] = env.repo.split('/');
	const existing = await gh<GithubPull[]>('GET', `/repos/${env.repo}/pulls?state=open&head=${owner}:${encodeURIComponent(branch)}&base=${env.baseBranch}`);
	if (existing[0]) return existing[0];
	return gh<GithubPull>('POST', `/repos/${env.repo}/pulls`, {
		title,
		head: branch,
		base: env.baseBranch,
		body,
	});
}

async function openPostPr(slug: string, branch: string, title: string): Promise<void> {
	const pr = await findOrCreatePr(
		branch,
		title,
		'Automated post change. The Preview workflow will comment a Cloudflare preview URL when ready.',
	);
	console.log(`PR #${pr.number}: ${pr.html_url}`);
	console.log(`Preview: run \`bun run post:bot status ${pr.number}\` after GitHub Actions starts.`);
}

async function status(prNumber: string): Promise<void> {
	const pr = await gh<GithubPull>('GET', `/repos/${env.repo}/pulls/${prNumber}`);
	const comments = await gh<Array<{ body?: string }>>('GET', `/repos/${env.repo}/issues/${prNumber}/comments`);
	const previewComment = comments.find((comment) => comment.body?.startsWith(PREVIEW_MARKER));
	const previewUrl = previewComment?.body?.match(/https?:\/\/\S+/)?.[0];
	const runs = await gh<{ workflow_runs: Array<{ name: string; status: string; conclusion: string | null; html_url: string }> }>(
		'GET',
		`/repos/${env.repo}/actions/runs?branch=${encodeURIComponent(pr.head.ref)}&per_page=10`,
	);

	console.log(JSON.stringify({
		pr: pr.number,
		state: pr.state,
		branch: pr.head.ref,
		previewUrl: previewUrl ?? null,
		workflowRuns: runs.workflow_runs.map((run) => ({
			name: run.name,
			status: run.status,
			conclusion: run.conclusion,
			url: run.html_url,
		})),
	}, null, 2));
}

async function main(): Promise<void> {
	const { flags, positionals } = parseArgs(process.argv.slice(2));
	const [command, slugOrPr] = positionals;
	if (!command || !slugOrPr) usage();

	if (command === 'status') {
		await status(slugOrPr);
		return;
	}

	const slug = slugOrPr;
	const path = postPath(slug);
	const branch = flags.direct === true ? env.baseBranch : branchFor(slug, flags.branch);
	if (flags.direct !== true) await ensureBranch(branch);

	if (command === 'new') {
		if (await getFile(path, branch)) throw new Error(`${path} already exists on ${branch}. Use edit instead.`);
		const body = await readBody(flags, `Start writing ${slug} here.`);
		await putFile(path, branch, makePost(slug, flags, body), `docs(blog): add ${slug}`);
		await openPostPr(slug, branch, `docs(blog): add ${slug}`);
		return;
	}

	if (command === 'edit') {
		const body = await readBody(flags, '');
		if (!body) throw new Error('edit requires --body-file ./post.mdx with full MDX content including frontmatter.');
		if (!await getFile(path, branch)) throw new Error(`${path} does not exist on ${branch}. Use new instead.`);
		await putFile(path, branch, body, `docs(blog): edit ${slug}`);
		await openPostPr(slug, branch, `docs(blog): edit ${slug}`);
		return;
	}

	if (command === 'publish') {
		const existing = await getFile(path, branch) ?? await getFile(path, env.baseBranch);
		if (!existing) throw new Error(`${path} does not exist on ${branch} or ${env.baseBranch}.`);
		await putFile(path, branch, setPublished(decodeContent(existing)), `docs(blog): publish ${slug}`);
		if (flags.direct === true) {
			console.log(`Committed publish change directly to ${env.baseBranch}. Production deploy should start shortly.`);
		} else {
			await openPostPr(slug, branch, `docs(blog): publish ${slug}`);
		}
		return;
	}

	usage();
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
