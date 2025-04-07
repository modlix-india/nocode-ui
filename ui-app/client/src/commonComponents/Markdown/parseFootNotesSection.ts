import React from 'react';
import { MarkdownParserParameters, MDDef } from './common';
import { parseInline } from './parseInline';

export function parseFootNotesSection(params: MarkdownParserParameters): Array<MDDef> {
	const { lineNumber, footNotes } = params;
	let comps: Array<MDDef> = [];

	if (!footNotes?.footNoteRefs.size) return comps;

	const iterator = footNotes.footNoteRefs.values();

	let ref;

	while (!(ref = iterator.next()).done) {
		const anchors: Array<MDDef> = [];

		for (let i = 0; i < (ref.value.refNum ?? 0); i++) {
			anchors.push({
				type: 'a',
				start: 0,
				end: 0,
				marker: '',
				attributes: { href: `#fnref-${ref.value.num}-${i + 1}` },
				children: undefined,
				lineNumber: lineNumber + ref.value.num,
				text: `[${ref.value.num}]`
			})
		}

		const comp = {
			type: 'p',
			start: 0,
			end: 0,
			marker: '',
			attributes: { className: '_footNote' },
			lineNumber: lineNumber + ref.value.num,
			text: '',
			children: [...anchors, {
				type: 'span',
				start: 0,
				end: 0,
				marker: '',
				attributes: { id: `fn-${ref.value.num}` },
				lineNumber: lineNumber + ref.value.num,
				text: '',
				children: parseInline({
					...params,
					line: ref.value.text,
					lineNumber: lineNumber + ref.value.num,
					parseNewline: true,
				}),
			}]
		};


		comps.push(comp);
	}
	return comps;
}
