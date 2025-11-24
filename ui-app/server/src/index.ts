import compression from 'compression';
import express from 'express';
import { loadBootstrapData } from './bootstrap/loadBootstrapData';
import { renderApplication } from './render/renderApp';

const app = express();
app.use(express.json({ limit: '512kb' }));
app.use(compression());

const PORT = Number(process.env.SSR_PORT || 4100);

let renderQueue: Promise<void> = Promise.resolve();

function enqueueRender<T>(task: () => Promise<T>): Promise<T> {
	const next = renderQueue.then(task, task);
	renderQueue = next.then(
		() => undefined,
		() => undefined,
	);
	return next;
}

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.post('/ssr/page/:pageName?', async (req, res) => {
	try {
		const urlFromRequest =
			(typeof req.body?.url === 'string' && req.body.url) ||
			(typeof req.query?.url === 'string' && (req.query.url as string)) ||
			req.headers.referer ||
			req.originalUrl;

		const pageNameParam = (req.params.pageName as string | undefined) || req.body?.pageName;

		const bootstrap = await loadBootstrapData({
			headers: req.headers,
			url: urlFromRequest,
			pageName: pageNameParam,
		});

		const result = await enqueueRender(() => renderApplication({ bootstrap }));
		res.json(result);
	} catch (error) {
		console.error('SSR render failed', error);
		res.status(500).json({ error: 'SSR_RENDER_FAILED' });
	}
});

app.listen(PORT, () => {
	console.log(`SSR server listening on port ${PORT}`);
});

