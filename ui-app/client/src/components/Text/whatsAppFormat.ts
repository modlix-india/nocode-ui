/**
 * WhatsApp message formatting -> the markdown the Text component already renders.
 *
 *   WhatsApp          markdown here
 *   *bold*            **bold**
 *   _italic_          *italic*
 *   ~strike~          ~~strike~~
 *   ```mono```        `mono`
 *
 * Only a mark that opens at the start of a word and closes at the end of one counts (as in WhatsApp),
 * so `2 * 3 * 4`, `snake_case_name` and a lone `~` stay as typed. Text inside a code span is left alone.
 * Used by the Text component for Text Type "WhatsApp".
 */

// A mark opens after a non-word character (or at the start), holds no space next to either mark, and
// closes before a non-word character (or at the end).
const mark = (ch: string) =>
	new RegExp(
		`(^|[^\\w${ch}])${escape(ch)}([^\\s${ch}](?:[^${ch}\\n]*[^\\s${ch}])?)${escape(ch)}(?![\\w${ch}])`,
		'g',
	);

function escape(ch: string): string {
	return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const BOLD = mark('*');
const ITALIC = mark('_');
const STRIKE = mark('~');

// Private-use characters stand in for a recognised mark while everything else is escaped.
const B = '\uE000';
const I = '\uE001';
const S = '\uE002';

function convertPlain(part: string): string {
	const marked = part
		.replace(BOLD, `$1${B}$2${B}`)
		.replace(ITALIC, `$1${I}$2${I}`)
		.replace(STRIKE, `$1${S}$2${S}`);
	// What is left is plain text: keep the markdown parser from reading it as formatting.
	return marked
		.replace(/[\\*_~=^[]/g, '\\$&')
		.split(B)
		.join('**')
		.split(I)
		.join('*')
		.split(S)
		.join('~~');
}

export function whatsAppToMarkdown(text: string): string {
	if (!text) return '';
	// Triple backticks (WhatsApp monospace) become a single-backtick code span on one line.
	const src = text.replace(/```([\s\S]+?)```/g, (_m, code: string) => '`' + code.replace(/\n/g, ' ') + '`');
	// Split on code spans so their content is never converted.
	return src
		.split(/(`[^`\n]*`)/g)
		.map((part, i) => (i % 2 === 1 ? part : convertPlain(part)))
		.join('');
}
