import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function getRouter() {
	const router = createRouter({
		routeTree,
		defaultPreload: 'intent',
		scrollRestoration: true,
		// Preserve trailing slashes - important for URL patterns like /app/client/page/
		trailingSlash: 'preserve',
	});

	return router;
}

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
