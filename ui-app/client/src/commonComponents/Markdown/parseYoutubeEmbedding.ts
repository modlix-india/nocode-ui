import React from 'react';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { cyrb53 } from '../../util/cyrb53';

export function parseYoutubeEmbedding(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber: i, styles } = params;
	let lineNumber = i;
	const line = lines[i].trim()?.substring(params.indentationLength ?? 0);

	let ind = line.indexOf('watch?v=');
	let key = '';
	let url = '';
	if (ind !== -1) {
		key = line.substring(ind + 8);
		ind = key.indexOf('&');
		if (ind !== -1) key = key.substring(0, ind);
		url = `https://www.youtube.com/embed/${key}`;
	} else {
		ind = line.indexOf('/embed/');
		if (ind != -1) {
			url = line;
		} else {
			ind = line.indexOf('?');
			key = line.substring(0, ind === -1 ? key.length : ind);
			ind = key.lastIndexOf('/');
			key = key.substring(ind + 1);
			url = `https://www.youtube.com/embed/${key}`;
		}
	}

	if (!url) return { lineNumber, comp: undefined };

	return {
		lineNumber,
		comp: React.createElement('iframe', {
			key: cyrb53(line),
			width: '100%',
			height: '315',
			src: url,
			allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
			referrerPolicy: 'strict-origin-when-cross-origin',
			allowFullScreen: true,
		}),
	};
}
