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
		const method = request.method;

		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,DELETE,OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type,Authorization',
			'Access-Control-Max-Age': '86400',
		};

		// Handle OPTIONS request for CORS preflight
		if (method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders,
			});
		}

		// Helper function to add CORS headers to responses
		const corsResponse = (response) => {
			const headers = new Headers(response.headers);
			Object.entries(corsHeaders).forEach(([key, value]) => {
				headers.set(key, value);
			});
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers,
			});
		};

		// Verify auth token for protected endpoints
		const verifyAuth = (request) => {
			const authHeader = request.headers.get('Authorization');
			return authHeader === env.AUTH_TOKEN;
		};

		// Get all scenarios
		if (pathname === '/api/scenarios' && method === 'GET') {
			const { results } = await env.DB.prepare('SELECT * FROM scenarios').all();
			return corsResponse(Response.json(results));
		}

		// Create new scenario
		if (pathname === '/api/scenarios' && method === 'POST') {
			if (!verifyAuth(request)) {
				return corsResponse(new Response('Unauthorized', { status: 401 }));
			}
			try {
				const data = await request.json();
				const { success } = await env.DB.prepare('INSERT INTO scenarios (title, description, system, start) VALUES (?, ?, ?, ?)')
					.bind(data.title, data.description, data.system, data.start)
					.run();

				if (success) {
					return corsResponse(new Response('Scenario created successfully', { status: 201 }));
				}
				return corsResponse(new Response('Failed to create scenario', { status: 500 }));
			} catch (error) {
				return corsResponse(new Response('Invalid request data', { status: 400 }));
			}
		}

		// match scenario by ID
		const matchScenario = pathname.match(/^\/api\/scenarios\/(\d+)$/);
		if (matchScenario) {
			const id = matchScenario[1];

			// Get scenario by ID
			if (method === 'GET') {
				const { results } = await env.DB.prepare('SELECT * FROM scenarios WHERE id = ?').bind(id).all();
				if (results && results.length > 0) {
					return corsResponse(Response.json(results[0]));
				}
				return corsResponse(new Response('Scenario not found', { status: 404 }));
			}

			// update scenario by ID
			if (method === 'PUT') {
				if (!verifyAuth(request)) {
					return corsResponse(new Response('Unauthorized', { status: 401 }));
				}
				try {
					const data = await request.json();
					const { success } = await env.DB.prepare('UPDATE scenarios SET title = ?, description = ?, system = ?, start = ? WHERE id = ?')
						.bind(data.title, data.description, data.system, data.start, id)
						.run();

					if (success) {
						return corsResponse(new Response('Scenario updated successfully', { status: 200 }));
					}
					return corsResponse(new Response('Failed to update scenario', { status: 500 }));
				} catch (error) {
					return corsResponse(new Response('Invalid request data', { status: 400 }));
				}
			}

			// delete scenario by ID
			if (method === 'DELETE') {
				if (!verifyAuth(request)) {
					return corsResponse(new Response('Unauthorized', { status: 401 }));
				}
				const { success } = await env.DB.prepare('DELETE FROM scenarios WHERE id = ?').bind(id).run();

				if (success) {
					return corsResponse(new Response('Scenario deleted successfully', { status: 200 }));
				}
				return corsResponse(new Response('Failed to delete scenario', { status: 500 }));
			}
		}

		return corsResponse(new Response('Not found', { status: 404 }));
	},
};
