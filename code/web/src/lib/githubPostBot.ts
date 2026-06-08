const DEFAULT_REPO = 'ncrmro/website';
const DEFAULT_BASE_BRANCH = 'main';
const POST_DIR = 'code/web/src/content/blog';
const PREVIEW_MARKER = '<!-- gha-preview-deploy -->';

type Json = Record<string, unknown>;

export type BotEnv = {
	GITHUB_CONTENT_PAT?: string;
	GITHUB_TOKEN?: string;
	GITHUB_REPO?: string;
	GITHUB_BASE_BRANCH?: string;
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

export type PostBotRequest =
	| {
			action: 'new';
			slug: string;
			title: string;
			description?: string;
			body?: string;
			tags?: string[];
			published?: boolean;
			branch?: string;
		}
	| { action: 'get'; slug: string; branch?: string }
	| { action: 'edit'; slug: string; content: string; branch?: string }
	| { action: 'publish'; slug: string; direct?: boolean; branch?: string }
	| { action: 'status'; prNumber: number | string };

function config(env: BotEnv) {
	return {
		token: env.GITHUB_CONTENT_PAT ?? env.GITHUB_TOKEN,
		repo: env.GITHUB_REPO ?? DEFAULT_REPO,
		baseBranch: env.GITHUB_BASE_BRANCH ?? DEFAULT_BASE_BRANCH,
	};
}

function requireToken(env: BotEnv): string {
	const token = config(env).token;
	if (!token) throw new Error('Missing GITHUB_CONTENT_PAT Worker secret.');
	return token;
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

function branchFor(slug: string, explicit?: string): string {
	return explicit && explicit.length > 0 ? explicit : `post/${slug}`;
}

function encodeBase64(value: string): string {
	const bytes = new TextEncoder().encode(value);
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

function decodeBase64(value: string): string {
	const binary = atob(value.replaceAll('\n', ''));
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

async function gh<T>(env: BotEnv, method: string, path: string, body?: Json): Promise<T> {
	const { repo } = config(env);
	const response = await fetch(`https://api.github.com${path}`, {
		method,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${requireToken(env)}`,
			'Content-Type': 'application/json',
			'User-Agent': `${repo}-post-bot`,
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

async function ghMaybe<T>(env: BotEnv, method: string, path: string, body?: Json): Promise<T | undefined> {
	try {
		return await gh<T>(env, method, path, body);
	} catch (error) {
		if (error instanceof Error && error.message.includes('(404)')) return undefined;
		throw error;
	}
}

async function ensureBranch(env: BotEnv, branch: string): Promise<void> {
	const { repo, baseBranch } = config(env);
	const existing = await ghMaybe<Json>(env, 'GET', `/repos/${repo}/git/ref/heads/${branch}`);
	if (existing) return;

	const base = await gh<{ object: { sha: string } }>(env, 'GET', `/repos/${repo}/git/ref/heads/${baseBranch}`);
	await gh(env, 'POST', `/repos/${repo}/git/refs`, {
		ref: `refs/heads/${branch}`,
		sha: base.object.sha,
	});
}

async function getFile(env: BotEnv, path: string, ref: string): Promise<GithubContent | undefined> {
	const { repo } = config(env);
	return ghMaybe<GithubContent>(env, 'GET', `/repos/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`);
}

function decodeContent(file: GithubContent): string {
	if (file.encoding !== 'base64' || !file.content) throw new Error('GitHub returned unsupported file encoding.');
	return decodeBase64(file.content);
}

async function putFile(env: BotEnv, path: string, branch: string, content: string, message: string): Promise<void> {
	const { repo } = config(env);
	const existing = await getFile(env, path, branch);
	await gh(env, 'PUT', `/repos/${repo}/contents/${path}`, {
		message,
		content: encodeBase64(content),
		branch,
		sha: existing?.sha,
	});
}

function yamlString(value: string): string {
	return JSON.stringify(value);
}

function makePost(request: Extract<PostBotRequest, { action: 'new' }>): string {
	if (!request.title) throw new Error('New posts require a title.');
	return `---\ntitle: ${yamlString(request.title)}\ndescription: ${yamlString(request.description ?? '')}\npublish_date: ${new Date().toISOString().slice(0, 10)}\npublished: ${request.published === true}\ntags: ${JSON.stringify(request.tags ?? [])}\n---\n\n${(request.body ?? `Start writing ${request.slug} here.`).trim()}\n`;
}

function setPublished(content: string): string {
	const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) throw new Error('Post is missing YAML frontmatter.');

	let frontmatter = match[1];
	frontmatter = /^published:/m.test(frontmatter)
		? frontmatter.replace(/^published:.*$/m, 'published: true')
		: `${frontmatter}\npublished: true`;
	if (!/^publish_date:/m.test(frontmatter)) frontmatter = `${frontmatter}\npublish_date: ${new Date().toISOString().slice(0, 10)}`;
	return `---\n${frontmatter}\n---\n${content.slice(match[0].length)}`;
}

async function findOrCreatePr(env: BotEnv, branch: string, title: string): Promise<GithubPull> {
	const { repo, baseBranch } = config(env);
	const [owner] = repo.split('/');
	const query = new URLSearchParams({ state: 'open', head: `${owner}:${branch}`, base: baseBranch });
	const existing = await gh<GithubPull[]>(env, 'GET', `/repos/${repo}/pulls?${query.toString()}`);
	if (existing[0]) return existing[0];
	return gh<GithubPull>(env, 'POST', `/repos/${repo}/pulls`, {
		title,
		head: branch,
		base: baseBranch,
		body: 'Automated post change. The Preview workflow will comment a Cloudflare preview URL when ready.',
	});
}

async function status(env: BotEnv, prNumber: number | string) {
	const { repo } = config(env);
	const pr = await gh<GithubPull>(env, 'GET', `/repos/${repo}/pulls/${prNumber}`);
	const comments = await gh<Array<{ body?: string }>>(env, 'GET', `/repos/${repo}/issues/${prNumber}/comments`);
	const previewComment = comments.find((comment) => comment.body?.startsWith(PREVIEW_MARKER));
	const previewUrl = previewComment?.body?.match(/https?:\/\/\S+/)?.[0] ?? null;
	const runs = await gh<{ workflow_runs: Array<{ name: string; status: string; conclusion: string | null; html_url: string }> }>(
		env,
		'GET',
		`/repos/${repo}/actions/runs?branch=${encodeURIComponent(pr.head.ref)}&per_page=10`,
	);

	return {
		pr: pr.number,
		state: pr.state,
		branch: pr.head.ref,
		previewUrl,
		workflowRuns: runs.workflow_runs.map((run) => ({
			name: run.name,
			status: run.status,
			conclusion: run.conclusion,
			url: run.html_url,
		})),
	};
}

export async function runPostBot(env: BotEnv, request: PostBotRequest) {
	if (request.action === 'status') return status(env, request.prNumber);

	const { baseBranch } = config(env);
	const path = postPath(request.slug);
	const branch = request.action === 'publish' && request.direct ? baseBranch : branchFor(request.slug, request.branch);

	if (request.action === 'get') {
		const ref = request.branch && request.branch.length > 0 ? request.branch : baseBranch;
		const existing = await getFile(env, path, ref);
		if (!existing) throw new Error(`${path} does not exist on ${ref}.`);
		return { branch: ref, path, content: decodeContent(existing) };
	}

	if (!(request.action === 'publish' && request.direct)) await ensureBranch(env, branch);

	if (request.action === 'new') {
		if (await getFile(env, path, branch)) throw new Error(`${path} already exists on ${branch}.`);
		await putFile(env, path, branch, makePost(request), `docs(blog): add ${request.slug}`);
		const pr = await findOrCreatePr(env, branch, `docs(blog): add ${request.slug}`);
		return { branch, path, prNumber: pr.number, prUrl: pr.html_url };
	}

	if (request.action === 'edit') {
		if (!request.content) throw new Error('Edit requires full MDX content.');
		if (!await getFile(env, path, branch)) throw new Error(`${path} does not exist on ${branch}.`);
		await putFile(env, path, branch, request.content, `docs(blog): edit ${request.slug}`);
		const pr = await findOrCreatePr(env, branch, `docs(blog): edit ${request.slug}`);
		return { branch, path, prNumber: pr.number, prUrl: pr.html_url };
	}

	const existing = await getFile(env, path, branch) ?? await getFile(env, path, baseBranch);
	if (!existing) throw new Error(`${path} does not exist.`);
	await putFile(env, path, branch, setPublished(decodeContent(existing)), `docs(blog): publish ${request.slug}`);
	if (request.direct) return { branch, path, direct: true };
	const pr = await findOrCreatePr(env, branch, `docs(blog): publish ${request.slug}`);
	return { branch, path, prNumber: pr.number, prUrl: pr.html_url };
}
