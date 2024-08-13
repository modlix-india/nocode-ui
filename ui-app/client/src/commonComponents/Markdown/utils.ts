import { MarkdownFootnoteRef, MarkdownURLRef } from './common';

const URL_TITLE_REGEX = /(.*)(\"(.*?)\")?/;

export function parseAttributes(line: string | undefined): { [key: string]: any } | undefined {
	if (!line?.startsWith('{')) return undefined;

	const result: { [key: string]: string } = {};
	let attrName = '';
	for (let i = 1; i < line.length; i++) {
		if (line[i] === '=') {
			const startNum = line.indexOf('"', i);
			if (startNum === -1) return undefined;
			let endNum = 0,
				searchFrom = startNum + 1;
			while ((endNum = line.indexOf('"', searchFrom)) !== -1) {
				if (line[endNum - 1] !== '\\') break;
				searchFrom = endNum + 1;
			}
			if (endNum === -1) return undefined;
			let attrValue = line.substring(startNum, endNum + 1);
			attrName = attrName.trim();
			if (attrName) result[attrName] = processAttributeValue(attrName, attrValue.trim());
			attrName = '';
			i = endNum;
		} else if (line[i] != ',') attrName += line[i];
	}

	return result;
}

function processAttributeValue(name: string, value: string): any {
	if (value.startsWith('"')) value = value.substring(1);
	if (value.endsWith('"')) value = value.substring(0, value.length - 1);

	if (name !== 'style') return value;

	const style: { [key: string]: string } = {};

	for (const styleDef of value.split(';')) {
		let [styleName = '', styleValue = ''] = styleDef.split(':');
		styleName = styleName.trim();
		let ind = -1;
		while ((ind = styleName.indexOf('-')) !== -1) {
			if (ind === styleName.length - 1) break;
			styleName =
				styleName.substring(0, ind) +
				styleName[ind + 1].toUpperCase() +
				styleName.substring(ind + 2);
		}
		style[styleName] = styleValue.trim();
	}
	return style;
}

export function makeId(text: string) {
	return text
		.toLowerCase()
		.replace(/ /g, '-')
		.replace(/[^a-z0-9-]/g, '');
}

export function makeRefsAndRemove(lines: string[]): {
	footNoteRefs: Map<string, MarkdownFootnoteRef>;
	urlRefs: Map<string, MarkdownURLRef>;
} {
	const footNoteRefs = new Map<string, MarkdownFootnoteRef>();
	const urlRefs = new Map<string, MarkdownURLRef>();

	let inCodeBlock = false;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		if (line.startsWith('```')) {
			inCodeBlock = !inCodeBlock;
			continue;
		}
		if (inCodeBlock || !line.startsWith('[')) continue;

		const ending = line.indexOf(']:');
		if (ending === -1) continue;
		const ref = line.substring(1, ending);
		let url = line.substring(ending + 2).trim();
		let count = 0;
		if (ref.startsWith('^')) {
			let j = i + 1;
			for (; j < lines.length; j++) {
				const inLine = lines[j].trim();
				if (inLine.startsWith('[') || !inLine.length) break;
				else url += '\n' + inLine;
			}
			count = j - i;
			footNoteRefs.set(ref.toLowerCase(), {
				text: url,
				ref,
				refKeys: new Array<string>(),
				num: 0,
			});
		} else {
			if (url.startsWith('<')) url = url.substring(1);
			if (url.endsWith('>')) url = url.substring(0, url.length - 1);
			urlRefs.set(ref.toLowerCase(), makeURLnTitle(url));
			count = 1;
		}

		lines.splice(i, count);
		i--;
	}

	return { footNoteRefs, urlRefs };
}

export function makeURLnTitle(text: string): MarkdownURLRef {
	const match = text.match(URL_TITLE_REGEX);
	if (!match) return { url: text };
	const [, url, , title] = match;
	return { url, title: title };
}
