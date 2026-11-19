import { compareSources, diffLines, splitChange, splitSource } from '../lineDiff';

describe('splitSource', () => {
	it('cuts minified html between tags and after css rules', () => {
		expect(splitSource('<style>a{b:c}d{e:f}</style><h1>Hi</h1>')).toEqual([
			'<style>a{b:c}',
			'd{e:f}',
			'</style>',
			'<h1>Hi</h1>',
		]);
	});
	it('does not cut after the } of a merge field', () => {
		expect(splitSource("<p>Dear ${name!'x'}, hi ${a}</p>")).toEqual([
			"<p>Dear ${name!'x'}, hi ${a}</p>",
		]);
	});
	it('is empty for an empty source', () => {
		expect(splitSource('')).toEqual([]);
		expect(splitSource('   ')).toEqual([]);
	});
});

describe('diffLines', () => {
	it('marks removed and added lines with their numbers', () => {
		const d = diffLines(['a', 'b', 'c'], ['a', 'x', 'c']);
		expect(d.map(l => [l.op, l.text, l.oldNo, l.newNo])).toEqual([
			['eq', 'a', 1, 1],
			['del', 'b', 2, undefined],
			['add', 'x', undefined, 2],
			['eq', 'c', 3, 3],
		]);
	});
	it('handles a moved line as one removal and one addition', () => {
		const d = diffLines(['h', 'm', 'p'], ['h', 'p', 'm']);
		expect(d.filter(l => l.op === 'del').length).toBe(1);
		expect(d.filter(l => l.op === 'add').length).toBe(1);
	});
});

describe('compareSources', () => {
	it('reports no change for equal sources', () => {
		const r = compareSources('<p>a</p>', '<p>a</p>');
		expect(r.added + r.removed).toBe(0);
		expect(r.hunks).toEqual([]);
	});
	it('counts changes and keeps context lines around them', () => {
		const before = [
			'<h1>T</h1>',
			'<p>1</p>',
			'<p>2</p>',
			'<p>3</p>',
			'<p>4</p>',
			'<p>5</p>',
			'<p>6</p>',
			'<p>7</p>',
			'<p>8</p>',
		].join('');
		const after = before.replace('<p>5</p>', '<p>five</p>');
		const r = compareSources(before, after, 2);
		expect(r).toMatchObject({ added: 1, removed: 1 });
		expect(r.hunks).toHaveLength(1);
		expect(r.hunks[0].lines.map(l => l.text)).toEqual([
			'<p>3</p>',
			'<p>4</p>',
			'<p>5</p>',
			'<p>five</p>',
			'<p>6</p>',
			'<p>7</p>',
		]);
		expect(r.hunks[0].rows.find(x => x.left?.op === 'del')?.right?.text).toBe('<p>five</p>');
	});
	it('shows everything as added when there was nothing before', () => {
		const r = compareSources('', '<p>a</p><p>b</p>');
		expect(r).toMatchObject({ added: 2, removed: 0 });
	});
});

describe('splitChange', () => {
	it('isolates the part that differs', () => {
		expect(splitChange('margin:4mm 0', 'margin:2mm 0')).toEqual({
			old: ['margin:', '4', 'mm 0'],
			new: ['margin:', '2', 'mm 0'],
		});
	});
});
