import React from 'react';
import { MarkdownParserParameters } from './common';
import { parseInline } from './parseInline';

export function parseFootNotesSection(params: MarkdownParserParameters): Array<React.JSX.Element> {
	const { lineNumber, styles, footNotes } = params;
	let comps: Array<React.JSX.Element> = [];

	if (!footNotes.footNoteRefs.size) return comps;

	const iterator = footNotes.footNoteRefs.values();

	let ref;

	while (!(ref = iterator.next()).done) {
		const anchors: Array<React.JSX.Element> = [];

		for (let i = 0; i < (ref.value.refNum ?? 0); i++) {
			anchors.push(
				React.createElement(
					'a',
					{
						key: `#fnref-${ref.value.num}-${i + 1}`,
						href: `#fnref-${ref.value.num}-${i + 1}`,
					},
					`[${ref.value.num}]`,
				),
			);
		}

		const comp = React.createElement(
			'p',
			{ key: `footNote-${ref.value.num}`, className: '_footNote' },

			...anchors,
			React.createElement(
				'span',
				{ key: `footNote-${ref.value.num}-text`, id: `fn-${ref.value.num}` },
				parseInline({
					...params,
					line: ref.value.text,
					lineNumber: lineNumber + ref.value.num,
					parseNewline: true,
				}),
			),
		);

		comps.push(comp);
	}
	return comps;
}
