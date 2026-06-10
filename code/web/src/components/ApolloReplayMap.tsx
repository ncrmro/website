// SSR-safe boundary for the deck.gl trajectory island. MDX evaluates
// module-level imports on the server even for client:only components,
// and deck.gl's dependency tree pulls Node builtins (worker_threads)
// that the Cloudflare SSR environment refuses — so the heavy module is
// only ever loaded via dynamic import in the browser.

import { lazy, Suspense } from 'react';

const Inner = lazy(() => import('./ApolloReplayMapInner'));

export default function ApolloReplayMap() {
	return (
		<Suspense
			fallback={
				<div className="not-prose my-6 flex h-105 w-full items-center justify-center rounded-lg border border-gray-700 bg-[#0b1220] text-sm text-gray-400">
					Loading trajectory view…
				</div>
			}
		>
			<Inner />
		</Suspense>
	);
}
