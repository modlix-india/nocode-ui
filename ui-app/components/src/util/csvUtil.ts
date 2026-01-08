import { StringBuilder } from '@fincity/kirun-js';

export function ToArray(lines: string, hasHeaders: boolean = false, delim: string = ','): any[] {
	lines = lines.trim();
	if (lines.length == 0) return [];

	const sb = new StringBuilder();
	let i = 0;
	let rowIndex = 0;
	let colIndex = 0;
	let firstRow = true;

	const headers: string[] = [];
	const rows: any[] = [];

	while (i < lines.length) {
		let ch = lines[i++];

		if (ch === '"') {
			let clean = false;
			while (i < lines.length) {
				ch = lines[i++];
				if (ch === '"') {
					if (i < lines.length && lines[i] === '"') {
						sb.append(ch);
						i++;
					} else {
						clean = true;
						break;
					}
				} else sb.append(ch);
			}
			if (!clean) throw new Error('Invalid CSV format');
			addRow(sb, firstRow, hasHeaders, headers, rows, rowIndex, colIndex);

			continue;
		}

		if (ch === delim || ch === '\n' || ch === '\r' || i === lines.length) {
			if (ch === '\r' && lines[i] === '\n') ch = lines[i++];

			if (i === lines.length && ch !== '\n' && ch !== '\r') sb.append(ch);

			addRow(sb, firstRow, hasHeaders, headers, rows, rowIndex, colIndex);

			if (ch === '\n') {
				if (!firstRow || !hasHeaders) rowIndex++;
				colIndex = 0;
				firstRow = false;
			} else colIndex++;

			sb.setLength(0);
		} else {
			sb.append(ch);
		}
	}

	return rows;
}
function addRow(
	sb: StringBuilder,
	firstRow: boolean,
	hasHeaders: boolean,
	headers: string[],
	rows: any[],
	rowIndex: number,
	colIndex: number,
) {
	const str = sb.toString();

	if (firstRow && hasHeaders) headers.push(str);
	else if (hasHeaders) {
		if (!rows[rowIndex]) rows[rowIndex] = {} as any;
		if (headers[colIndex]) rows[rowIndex][headers[colIndex]] = str === '' ? undefined : str;
	} else if (str !== '') {
		if (!rows[rowIndex]) rows[rowIndex] = [] as string[];
		rows[rowIndex][colIndex] = str;
	}
}
