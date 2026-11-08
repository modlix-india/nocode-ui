// What the AI answers (see nocode-ai app/services/template_doc_ai.py) turned into page blocks. The AI only
// names fields by path; this writes them as FreeMarker with a value for when they are empty. Paths are
// checked again here against the template's own fields, so nothing the template does not have gets in.

import { VariableEntry } from '../util/variableUtils';
import { block, DocBlock, FieldFormat, makeToken, ShowIfOp } from './docModel';

export interface AiField {
	path: string;
	label?: string;
	description?: string;
	type?: string;
}

// The template's fields as the AI gets them: list items written LIST[].field.
export function aiFields(variables: VariableEntry[]): AiField[] {
	return variables.map(v => ({
		path: v.path.replace(/\[0\]/g, '[]') + (/ARRAY/i.test(v.type ?? '') ? '[]' : ''),
		label: v.label,
		description: v.description,
		type: v.type,
	}));
}

function known(fields: AiField[]): Set<string> {
	const s = new Set<string>();
	fields.forEach(f => {
		s.add(f.path);
		if (f.path.endsWith('[]')) s.add(f.path.slice(0, -2));
	});
	return s;
}

const text = (s: string, ok: Set<string>) =>
	(s ?? '').replace(/\{\{\s*([\w.[\]]+)\s*\}\}/g, (_, p) => (ok.has(p) ? makeToken(p) : ''));

export function aiToBlocks(raw: any[], fields: AiField[]): DocBlock[] {
	const ok = known(fields);
	const item = (list: string, f: string) => ok.has(`${list}[].${f}`);
	const out: DocBlock[] = [];
	for (const b of Array.isArray(raw) ? raw : []) {
		if (!b || typeof b !== 'object') continue;
		let nb: DocBlock | undefined;
		switch (b.type) {
			case 'title':
			case 'heading':
				nb = block(b.type, { text: text(b.text, ok) });
				break;
			case 'text':
				nb = block('text', { html: `<p>${text(b.text, ok)}</p>` });
				break;
			case 'button':
				nb = block('button', { text: text(b.text, ok), href: text(b.href ?? '', ok) });
				break;
			case 'fields':
				if (b.list && ok.has(b.list))
					nb = block('fields', {
						list: b.list,
						alias: 'r',
						columns: b.columns === 2 ? 2 : 1,
					});
				else {
					const rows = (b.rows ?? [])
						.filter((r: any) => ok.has(r?.field))
						.map((r: any) => ({
							label: `${r.label ?? ''}`,
							value: makeToken(r.field),
						}));
					if (rows.length)
						nb = block('fields', { rows, columns: b.columns === 2 ? 2 : 1 });
				}
				break;
			case 'table': {
				if (!ok.has(b.list)) break;
				const columns = (b.columns ?? [])
					.filter((c: any) => item(b.list, c?.field))
					.map((c: any) => ({
						label: `${c.label ?? ''}`,
						value: makeToken(
							`row.${c.field}`,
							(['plain', 'amount', 'amount0'].includes(c.format)
								? c.format
								: 'plain') as FieldFormat,
						),
					}));
				if (columns.length) nb = block('table', { list: b.list, alias: 'row', columns });
				break;
			}
			case 'applicants': {
				if (!ok.has(b.list)) break;
				const f = (k: string, d: string) => (b[k] && item(b.list, b[k]) ? b[k] : d);
				nb = block('applicants', {
					list: b.list,
					alias: 'a',
					layout: 'cols',
					titleField: f('titleField', 'title'),
					rowsField: f('rowsField', 'personal'),
					...(b.photoField && item(b.list, b.photoField)
						? { photo: true, photoField: b.photoField }
						: {}),
				});
				break;
			}
			case 'signatures':
				if (ok.has(b.list))
					nb = block('signatures', {
						list: b.list,
						alias: 's',
						nameField: b.nameField && item(b.list, b.nameField) ? b.nameField : 'name',
						roleField: b.roleField && item(b.list, b.roleField) ? b.roleField : '',
					});
				break;
			case 'terms':
				if (b.list && ok.has(b.list)) nb = block('terms', { list: b.list, alias: 't' });
				else if (Array.isArray(b.items))
					nb = block('terms', { items: b.items.map((x: any) => text(`${x}`, ok)) });
				break;
			case 'image':
				if (ok.has(b.field))
					nb = block('image', { src: `\${${b.field}!''}`, width: '40mm' });
				break;
			case 'pageBreak':
			case 'spacer':
				nb = block(b.type, b.type === 'spacer' ? { height: 6 } : {});
				break;
		}
		if (!nb) continue;
		const s = b.showIf;
		if (s && ok.has(s.field))
			nb.showIf = {
				field: s.field,
				op: (s.op ?? 'filled') as ShowIfOp,
				value: s.value ?? undefined,
			};
		out.push(nb);
	}
	return out;
}
