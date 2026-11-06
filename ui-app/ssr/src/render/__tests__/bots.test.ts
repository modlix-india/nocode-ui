import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { BOT_USER_AGENT_TOKENS, botFor, isBot } from '../bots.js';
import { documentForBot } from '../botDocument.js';
import { SIGNED_IN_DROP_SCRIPT } from '../signedInGuard.js';

/**
 * PLAT-1545: crawlers get the page drawn (on dev and prod only they do), and a copy where the
 * text comes first. One list of User-Agents decides who is a crawler.
 */

const UA = {
	gptbot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot',
	claude: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
	claudeSearch: 'Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +https://www.anthropic.com)',
	perplexityUser: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)',
	googlebotPhone:
		'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
	bing: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36',
	applebotExtended: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15 (Applebot-Extended/0.1)',
	meta: 'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
	chrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
	iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
};

describe('bots: who is a crawler', () => {
	it('knows the AI crawlers and search engines the epic names', () => {
		for (const t of [
			'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'ClaudeBot',
			'Claude-SearchBot', 'Claude-User', 'Google-Extended', 'Googlebot', 'bingbot', 'Applebot',
			'CCBot', 'meta-externalagent', 'Bytespider', 'DuckDuckBot', 'YandexBot',
		])
			assert.ok(BOT_USER_AGENT_TOKENS.includes(t), t);
	});

	it('finds the bot in real User-Agent strings, whatever the case', () => {
		assert.equal(botFor(UA.gptbot)?.token, 'GPTBot');
		assert.equal(botFor(UA.claude)?.token, 'ClaudeBot');
		assert.equal(botFor(UA.claudeSearch)?.token, 'Claude-SearchBot');
		assert.equal(botFor(UA.perplexityUser)?.token, 'Perplexity-User');
		assert.equal(botFor(UA.googlebotPhone)?.token, 'Googlebot');
		assert.equal(botFor(UA.bing)?.token, 'bingbot');
		assert.equal(botFor(UA.applebotExtended)?.token, 'Applebot-Extended', 'the longer token wins');
		assert.equal(botFor(UA.meta)?.token, 'meta-externalagent');
		assert.equal(botFor('mozilla/5.0 (compatible; gptbot/1.0)')?.token, 'GPTBot');
	});

	it('takes browsers and nothing for people', () => {
		for (const ua of [UA.chrome, UA.iphone, '', undefined, null]) assert.equal(isBot(ua), false, String(ua));
		assert.equal(isBot('Mozilla/5.0 (compatible; NotGPTBotish)'), false, 'a token inside a word is not a match');
	});

	it('says which bots run the page scripts', () => {
		assert.equal(botFor(UA.googlebotPhone)?.runsScripts, true);
		assert.equal(botFor(UA.bing)?.runsScripts, true);
		assert.equal(botFor(UA.gptbot)?.runsScripts, false);
		assert.equal(botFor(UA.claude)?.runsScripts, false);
	});
});

describe('documentForBot: the text first', () => {
	const BOOT = `window.__APP_BOOTSTRAP__ = {"application":{"big":"${'x'.repeat(2000)}"}};`;
	const DOC =
		'<!DOCTYPE html><html><head><title>T</title></head><body>\n' +
		`\t\t<script>\n\t\t\tflag();\n\t\t\t${BOOT}\n\t\t\twindow.domainAppCode = 'site';\n\t\t</script>\n` +
		'\t\t<div id="app"><link rel="preload" as="image" href="x.png"/><style id="AppCss">.a{color:red}</style><div class="comp"><h1>Hello</h1><style>.b{}</style><img src="x.png" alt="A cat"></div><div id="_rendered" data-used-components="Text"></div></div>\n' +
		`\t\t${SIGNED_IN_DROP_SCRIPT}\n` +
		'\t\t<script src="https://cdn/index.js" defer></script>\n</body></html>';

	it('moves the bootstrap after #app for a bot that runs scripts, and keeps all of it', () => {
		const out = documentForBot(DOC, { runsScripts: true });
		assert.equal(out.length, DOC.length + '<script></script>\n\t\t'.length);
		assert.ok(out.indexOf('<h1>Hello</h1>') < out.indexOf('__APP_BOOTSTRAP__'), 'text first');
		assert.ok(out.indexOf('__APP_BOOTSTRAP__') < out.indexOf('index.js'), 'bootstrap before the deferred client');
		assert.ok(out.includes(`<script>${BOOT}</script>`));
		assert.ok(out.includes("window.domainAppCode = 'site';"), 'the other globals stay where they were');
		assert.ok(out.includes('.a{color:red}'), 'styles stay: it hydrates');
		assert.ok(out.includes('id="_rendered"'), 'and the hydration mark stays');
	});

	it('drops the bootstrap and the styles in #app for a bot that only reads', () => {
		const out = documentForBot(DOC, { runsScripts: false });
		assert.ok(!out.includes('__APP_BOOTSTRAP__'));
		assert.ok(!out.includes('<style'));
		assert.ok(!out.includes('rel="preload"'), 'no image preloads');
		assert.ok(!out.includes('id="_rendered"'), 'no hydration mark: a client that runs renders afresh');
		assert.ok(out.includes('<h1>Hello</h1>'));
		assert.ok(out.includes('<img src="x.png" alt="A cat">'));
		assert.ok(out.includes("window.domainAppCode = 'site';"));
		assert.ok(out.includes(SIGNED_IN_DROP_SCRIPT));
	});

	it('leaves a document of another shape alone', () => {
		const noBoot = DOC.replace(BOOT, '');
		assert.equal(documentForBot(noBoot, { runsScripts: false }), noBoot);
		const noApp = '<html><body><script>' + BOOT + '\n</script><p>x</p></body></html>';
		assert.equal(documentForBot(noApp, { runsScripts: true }), noApp);
	});
});
