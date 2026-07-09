import { handle } from '@astrojs/cloudflare/handler';
import { flushStaleDrafts } from '@quiescent/server';
import { quiescentEnv } from './lib/quiescent';

// Custom worker entry so the deployment gets a `scheduled` handler: the cron
// trigger flushes drafts abandoned mid-edit (tab closed) into commits.
export default {
	fetch: handle,
	async scheduled(_controller: unknown, env: unknown, ctx: ExecutionContext) {
		ctx.waitUntil(flushStaleDrafts(quiescentEnv(env)));
	},
};
