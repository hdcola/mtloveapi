/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		const { pathname } = new URL(request.url);

		// Get all scenarios
		if (pathname === '/api/scenarios') {
			const { results } = await env.DB.prepare('SELECT * FROM scenarios').all();
			return Response.json(results);
		}

		// Get single scenario by ID
		const matchScenario = pathname.match(/^\/api\/scenarios\/(\d+)$/);
		if (matchScenario) {
			const id = matchScenario[1];
			const { results } = await env.DB.prepare('SELECT * FROM scenarios WHERE id = ?').bind(id).all();

			if (results && results.length > 0) {
				return Response.json(results[0]);
			}
			return new Response('Scenario not found', { status: 404 });
		}

		return new Response('Call /api/scenarios to get the list of scenarios');
	},
};
