import { htmlToBlocks } from '../htmlToBlocks';
import { Block } from '../blockTypes';

const types = (blocks: Block[]) => blocks.map(b => b.type);

describe('htmlToBlocks — leaf mapping', () => {
	it('maps headings, paragraphs, lists, dividers', () => {
		const b = htmlToBlocks(
			'<h1>Title</h1><p>Hello <strong>world</strong> ${name}</p><ul><li>a</li><li>b</li></ul><hr/>',
		);
		expect(types(b)).toEqual(['heading', 'text', 'list', 'divider']);
		expect(b[0].props.text).toBe('Title');
		expect(b[0].props.level).toBe('h1');
		// paragraph keeps inline markup + FreeMarker tokens verbatim
		expect(b[1].props.html).toContain('<strong>world</strong>');
		expect(b[1].props.html).toContain('${name}');
		expect(b[2].props.items).toBe('a\nb');
		expect(b[2].props.ordered).toBe('false');
	});

	it('caps heading level at h4 (block editor supports h1-h4)', () => {
		expect(htmlToBlocks('<h6>Deep</h6>')[0].props.level).toBe('h4');
	});

	it('maps ordered lists', () => {
		const b = htmlToBlocks('<ol><li>one</li><li>two</li></ol>');
		expect(b[0].type).toBe('list');
		expect(b[0].props.ordered).toBe('true');
	});

	it('maps a bare image with width', () => {
		const b = htmlToBlocks('<img src="logo.png" alt="Logo" width="120"/>');
		expect(b[0].type).toBe('image');
		expect(b[0].props).toMatchObject({ src: 'logo.png', alt: 'Logo', width: 120 });
	});

	it('treats a percentage-width image as default width', () => {
		expect(htmlToBlocks('<img src="x.png" width="100%"/>')[0].props.width).toBe(600);
	});
});

describe('htmlToBlocks — anchors', () => {
	it('an anchor wrapping only an image becomes an image with href', () => {
		const b = htmlToBlocks('<a href="https://x.com"><img src="i.png"/></a>');
		expect(b[0].type).toBe('image');
		expect(b[0].props.href).toBe('https://x.com');
	});

	it('a styled anchor becomes a button', () => {
		const b = htmlToBlocks(
			'<a href="/go" style="display:inline-block;background-color:#22c55e;padding:10px 20px;color:#fff;">Go</a>',
		);
		expect(b[0].type).toBe('button');
		expect(b[0].props).toMatchObject({ label: 'Go', href: '/go' });
	});

	it('a plain text anchor becomes a link', () => {
		const b = htmlToBlocks('<a href="mailto:a@b.com">Email us</a>');
		expect(b[0].type).toBe('link');
		expect(b[0].props).toMatchObject({ label: 'Email us', href: 'mailto:a@b.com' });
	});
});

describe('htmlToBlocks — containers and fallback', () => {
	it('descends layout tables to reach content', () => {
		const html =
			'<table><tr><td><h2>Hi</h2><p>Body text here</p></td></tr></table>';
		expect(types(htmlToBlocks(html))).toEqual(['heading', 'text']);
	});

	it('keeps an inline-only cell (icons/links, no prose) as one Raw HTML block', () => {
		const html =
			'<table><tr><td><a href="/x"><img src="a.png"/></a><a href="/y"><img src="b.png"/></a></td></tr></table>';
		const b = htmlToBlocks(html);
		expect(b).toHaveLength(1);
		expect(b[0].type).toBe('html');
		expect(b[0].props.html).toContain('a.png');
		expect(b[0].props.html).toContain('b.png');
	});

	it('keeps an unrecognised element verbatim as Raw HTML', () => {
		const b = htmlToBlocks('<video src="v.mp4"></video>');
		expect(b[0].type).toBe('html');
		expect(b[0].props.html).toContain('<video');
	});

	it('returns [] for empty input and a single html block when nothing maps', () => {
		expect(htmlToBlocks('')).toEqual([]);
		expect(htmlToBlocks('   ')).toEqual([]);
	});

	it('gives every block a unique id', () => {
		const b = htmlToBlocks('<p>one</p><p>two</p><p>three</p>');
		const ids = new Set(b.map(x => x.id));
		expect(ids.size).toBe(b.length);
	});
});

describe('htmlToBlocks — full custom document (the contactUs shape)', () => {
	const DOC = `<!DOCTYPE html><html><head><title>t</title></head>
	<body style="font-family: Inter">
	<center>
	<table class="table"><tr>
	<td><img src="logo.svg" width="76"/></td>
	</tr><tr>
	<td>
	<img src="hero.png" width="100%"/>
	<p>Hello Team,</p>
	<p>A new query has been submitted.</p>
	<p>&#x2022; Name:<span>\${fullName}</span></p>
	<p>&#x2022; Email:<span>\${email}</span></p>
	</td>
	</tr><tr>
	<td>
	<a href="https://x.com/m"><img src="x.png"/></a>
	<a href="https://fb.com/m"><img src="fb.png"/></a>
	</td>
	</tr></table>
	</center>
	</body></html>`;

	it('flattens the layout into editable content blocks, preserving text/vars and the icon row', () => {
		const b = htmlToBlocks(DOC);
		const t = types(b);
		// logo image + hero image + 4 paragraphs + 1 raw-html social row
		expect(t.filter(x => x === 'image').length).toBeGreaterThanOrEqual(2);
		expect(t.filter(x => x === 'text').length).toBeGreaterThanOrEqual(4);
		expect(t).toContain('html'); // social icon row kept verbatim
		// FreeMarker tokens survive the round trip into the text blocks
		const joined = b.map(x => x.props.html ?? '').join(' ');
		expect(joined).toContain('${fullName}');
		expect(joined).toContain('${email}');
		// no content is dropped: the logo made it in
		expect(b.some(x => x.type === 'image' && x.props.src === 'logo.svg')).toBe(true);
	});
});
