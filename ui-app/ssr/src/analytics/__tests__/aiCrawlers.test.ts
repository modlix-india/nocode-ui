import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import {
	crawlerVisitStats,
	flushCrawlerVisits,
	isAiBot,
	observeCrawlerVisit,
	pagePathOf,
	resetCrawlerVisitsForTests,
	siteKey,
} from '../aiCrawlers.js';
import { botFor } from '../../render/bots.js';

const GPTBOT = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)';
const PERPLEXITY = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)';
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

function listen(server: Server): Promise<string> {
	return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`)));
}

function body(req: IncomingMessage): Promise<string> {
	return new Promise(resolve => {
		let d = '';
		req.on('data', c => (d += c));
		req.on('end', () => resolve(d));
	});
}

const until = async (ok: () => boolean) => {
	for (let i = 0; i < 100 && !ok(); i++) await new Promise(r => setTimeout(r, 10));
};

test('which bots are AI bots', () => {
	assert.equal(isAiBot(botFor(GPTBOT)!), true);
	assert.equal(isAiBot(botFor(PERPLEXITY)!), true);
	assert.equal(isAiBot(botFor(GOOGLEBOT)!), false);
	assert.equal(botFor(CHROME), undefined);
});

test('only page paths are reported, without the query string', () => {
	assert.equal(pagePathOf('/page/home?utm_source=x#top'), '/page/home');
	assert.equal(pagePathOf('/'), '/');
	assert.equal(pagePathOf('/js/dist/index.js'), undefined);
	assert.equal(pagePathOf('/api/ui/page/home'), undefined);
	assert.equal(pagePathOf('/favicon.ico'), undefined);
	assert.equal(pagePathOf('/health'), undefined);
	assert.equal(siteKey('MonkBars', 'system'), 'monkbars_SYSTEM');
});

test('bot page fetches reach the engine after the response, people never do', async () => {
	const received: { auth?: string; batch: unknown[] }[] = [];
	const engine = createServer(async (req, res) => {
		const parsed = JSON.parse(await body(req));
		received.push({ auth: req.headers.authorization, batch: parsed.b });
		res.writeHead(204).end();
	});
	const engineUrl = await listen(engine);

	// The page server: the hook, then a response, exactly as server.ts does.
	const pages = createServer((req, res) => {
		observeCrawlerVisit(req, res);
		res.writeHead(req.url?.includes('missing') ? 404 : 200, { 'Content-Type': 'text/html' }).end('<html></html>');
	});
	const pagesUrl = await listen(pages);

	try {
		resetCrawlerVisitsForTests({ url: engineUrl, secret: 'test-secret', flushEveryMs: 60_000 });
		const get = (path: string, ua: string) => fetch(`${pagesUrl}${path}`, { headers: { 'user-agent': ua } }).then(r => r.text());

		await get('/monkbars/SYSTEM/page/home?x=1', GPTBOT);
		await get('/monkbars/SYSTEM/page/missing', PERPLEXITY);
		await get('/monkbars/SYSTEM/page/home', GOOGLEBOT);
		await get('/monkbars/SYSTEM/page/home', CHROME);
		await get('/monkbars/SYSTEM/page/index.js', GPTBOT);

		await until(() => crawlerVisitStats().queue >= 3);
		await flushCrawlerVisits();

		assert.equal(received.length, 1);
		assert.equal(received[0].auth, 'Bearer test-secret');
		assert.deepEqual(received[0].batch, [
			{ s: 'monkbars_SYSTEM', u: '/monkbars/SYSTEM/page/home', bot: 'GPTBot', ai: true, st: 200 },
			{ s: 'monkbars_SYSTEM', u: '/monkbars/SYSTEM/page/missing', bot: 'PerplexityBot', ai: true, st: 404 },
			{ s: 'monkbars_SYSTEM', u: '/monkbars/SYSTEM/page/home', bot: 'Googlebot', ai: false, st: 200 },
		]);
		assert.equal(crawlerVisitStats().sent, 3);
	} finally {
		resetCrawlerVisitsForTests();
		pages.close();
		engine.close();
	}
});

test('an engine that is down costs the visits, never the page', async () => {
	const pages = createServer((req, res) => {
		observeCrawlerVisit(req, res);
		res.writeHead(200).end('ok');
	});
	const pagesUrl = await listen(pages);
	try {
		// Nothing listens on port 9: the send fails fast.
		resetCrawlerVisitsForTests({ url: 'http://127.0.0.1:9', secret: 's', flushEveryMs: 60_000, sendTimeoutMs: 500 });
		const r = await fetch(`${pagesUrl}/monkbars/SYSTEM/page/home`, { headers: { 'user-agent': GPTBOT } });
		assert.equal(r.status, 200);
		await until(() => crawlerVisitStats().queue >= 1);
		await flushCrawlerVisits();
		assert.equal(crawlerVisitStats().dropped, 1);
		assert.equal(crawlerVisitStats().queue, 0);
	} finally {
		resetCrawlerVisitsForTests();
		pages.close();
	}
});

test('the queue is bounded', async () => {
	resetCrawlerVisitsForTests({ url: 'http://127.0.0.1:9', secret: 's', maxQueue: 2, maxBatch: 100, flushEveryMs: 60_000 });
	const pages = createServer((req, res) => {
		observeCrawlerVisit(req, res);
		res.writeHead(200).end('ok');
	});
	const pagesUrl = await listen(pages);
	try {
		for (let i = 0; i < 5; i++) await fetch(`${pagesUrl}/monkbars/SYSTEM/page/p${i}`, { headers: { 'user-agent': GPTBOT } }).then(r => r.text());
		await until(() => crawlerVisitStats().queue + crawlerVisitStats().dropped >= 5);
		assert.equal(crawlerVisitStats().queue, 2);
		assert.equal(crawlerVisitStats().dropped, 3);
	} finally {
		resetCrawlerVisitsForTests();
		pages.close();
	}
});

test('off without an engine address or a secret', async () => {
	resetCrawlerVisitsForTests({ url: '', secret: '' });
	const pages = createServer((req, res) => {
		observeCrawlerVisit(req, res);
		res.writeHead(200).end('ok');
	});
	const pagesUrl = await listen(pages);
	try {
		await fetch(`${pagesUrl}/monkbars/SYSTEM/page/home`, { headers: { 'user-agent': GPTBOT } }).then(r => r.text());
		assert.equal(crawlerVisitStats().observed, 0);
	} finally {
		resetCrawlerVisitsForTests();
		pages.close();
	}
});
