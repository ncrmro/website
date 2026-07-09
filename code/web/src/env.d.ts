type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {
		/** Set by middleware on /admin and /api/quiescent routes. */
		qsSession?: import("@quiescent/server").Session;
		qsSessionId?: string;
	}
}
