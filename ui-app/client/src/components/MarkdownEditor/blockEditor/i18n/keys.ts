// ============================================================
// Editor i18n — master English bundle.
//
// Every user-visible string in the editor lives here. Hosts may
// override any subset via the `translations` prop on BlockEditor,
// or provide their own `t` function. Missing keys fall back to the
// English value defined here.
// ============================================================

export const defaultEditorTranslations = {
	// ---- Editor core UI ----
	'editor.defaultPlaceholder': 'Type here...',
	'editor.addBlock.coarse': 'Insert block',
	'editor.addBlock.fine': 'Add block below',
	'editor.blockDrag': 'Drag to reorder or click for options',
	'editor.blockDrag.coarse': 'Drag to reorder or tap for options',
	'editor.debug.markdown': 'Markdown',
	'editor.debug.json': 'Document JSON',
	'editor.debug.selection': 'Selection',

	// ---- Slash command menu ----
	'slash.category.basic': 'Basic',
	'slash.category.lists': 'Lists',
	'slash.category.advanced': 'Advanced',
	'slash.category.media': 'Media',
	'slash.results': 'Results',
	'slash.empty': 'No matching blocks',

	// ---- Block definitions (slash menu + turn-into) ----
	'block.paragraph.label': 'Text',
	'block.paragraph.description': 'Plain text block',
	'block.heading1.label': 'Heading 1',
	'block.heading1.description': 'Large heading',
	'block.heading2.label': 'Heading 2',
	'block.heading2.description': 'Medium heading',
	'block.heading3.label': 'Heading 3',
	'block.heading3.description': 'Small heading',
	'block.heading4.label': 'Heading 4',
	'block.heading4.description': 'Smaller heading',
	'block.heading5.label': 'Heading 5',
	'block.heading5.description': 'Even smaller heading',
	'block.heading6.label': 'Heading 6',
	'block.heading6.description': 'Smallest heading',
	'block.codeBlock.label': 'Code',
	'block.codeBlock.description': 'Code block',
	'block.quote.label': 'Quote',
	'block.quote.description': 'Block quote',
	'block.callout.label': 'Callout',
	'block.callout.description': 'Highlighted callout box',
	'block.toggle.label': 'Toggle',
	'block.toggle.description': 'Collapsible content',
	'block.divider.label': 'Divider',
	'block.divider.description': 'Horizontal line',
	'block.image.label': 'Image',
	'block.image.description': 'Upload or embed an image',
	'block.embed.label': 'Embed',
	'block.embed.description': 'Embed a URL',
	'block.table.label': 'Table',
	'block.table.description': 'Simple table',
	'block.toc.label': 'Table of Contents',
	'block.toc.description': 'Auto-generated from headings',
	'block.toc.empty': 'Add headings to see them here',
	'block.toc.heading': 'On this page',
	'block.toc.levels.menu': 'Heading levels',
	'block.toc.levels.label': 'Show headings up to',
	'block.toc.levels.one': 'Heading 1',
	'block.toc.levels.two': 'Headings 1–2',
	'block.toc.levels.three': 'Headings 1–3',
	'block.toc.levels.four': 'Headings 1–4',
	'block.toc.levels.five': 'Headings 1–5',
	'block.toc.levels.six': 'Headings 1–6',
	'block.toc.style.label': 'Style',
	'block.toc.style.plain': 'Plain',
	'block.toc.style.bulleted': 'Bulleted',
	'block.toc.style.numbered': 'Numbered',
	'block.toc.style.card': 'Card',
	'block.toc.style.accent': 'Accent bar',
	'block.toc.plain.label': 'Table of Contents',
	'block.toc.plain.description': 'Indented list of headings',
	'block.toc.bulleted.label': 'Contents — Bulleted',
	'block.toc.bulleted.description': 'Headings with bullet markers',
	'block.toc.numbered.label': 'Contents — Numbered',
	'block.toc.numbered.description': 'Headings with 1, 1.1 numbering',
	'block.toc.card.label': 'Contents — Card',
	'block.toc.card.description': 'Headings in a bordered panel',
	'block.toc.accent.label': 'Contents — Accent bar',
	'block.toc.accent.description': 'Headings with a left accent bar',
	'block.columns.label': 'Columns',
	'block.columns.description': 'Split content side-by-side',
	'block.customComponent.label': 'Component',
	'block.customComponent.description': 'Custom component',
	'block.bulletItem.label': 'Bullet list',
	'block.bulletItem.description': 'Bulleted item',
	'block.numberItem.label': 'Numbered list',
	'block.numberItem.description': 'Ordered item',
	'block.todoItem.label': 'To-do list',
	'block.todoItem.description': 'Checkbox list item',
	'block.toggleHeading1.label': 'Toggle heading 1',
	'block.toggleHeading1.description': 'Large collapsible heading',
	'block.toggleHeading2.label': 'Toggle heading 2',
	'block.toggleHeading2.description': 'Medium collapsible heading',
	'block.toggleHeading3.label': 'Toggle heading 3',
	'block.toggleHeading3.description': 'Small collapsible heading',
	'block.tabs.label': 'Tabs',
	'block.tabs.description': 'Switch between tabs of content',
	'blockMenu.copy': 'Copy block',
	'blockMenu.cut': 'Cut block',
	'blockMenu.paste': 'Paste block',
	'slash.category.color': 'Color',
	'slash.color.text.default': 'Default text',
	'slash.color.text.gray': 'Gray text',
	'slash.color.text.brown': 'Brown text',
	'slash.color.text.orange': 'Orange text',
	'slash.color.text.yellow': 'Yellow text',
	'slash.color.text.green': 'Green text',
	'slash.color.text.blue': 'Blue text',
	'slash.color.text.purple': 'Purple text',
	'slash.color.text.pink': 'Pink text',
	'slash.color.text.red': 'Red text',
	'slash.color.bg.default': 'Default background',
	'slash.color.bg.gray': 'Gray background',
	'slash.color.bg.brown': 'Brown background',
	'slash.color.bg.orange': 'Orange background',
	'slash.color.bg.yellow': 'Yellow background',
	'slash.color.bg.green': 'Green background',
	'slash.color.bg.blue': 'Blue background',
	'slash.color.bg.purple': 'Purple background',
	'slash.color.bg.pink': 'Pink background',
	'slash.color.bg.red': 'Red background',

	// ---- Floating toolbar — mark buttons ----
	'toolbar.bold.label': 'Bold',
	'toolbar.bold.shortcut': '⌘B',
	'toolbar.italic.label': 'Italic',
	'toolbar.italic.shortcut': '⌘I',
	'toolbar.underline.label': 'Underline',
	'toolbar.underline.shortcut': '⌘U',
	'toolbar.strikethrough.label': 'Strikethrough',
	'toolbar.strikethrough.shortcut': '⌘⇧S',
	'toolbar.code.label': 'Code',
	'toolbar.code.shortcut': '⌘E',
	'toolbar.link.label': 'Link',
	'toolbar.link.shortcut': '⌘K',
	'toolbar.superscript.label': 'Superscript',
	'toolbar.subscript.label': 'Subscript',
	'toolbar.textColor.label': 'Text color',
	'toolbar.highlight.label': 'Highlight color',
	'toolbar.font.label': 'Font',

	// ---- Toolbar — text color palette ----
	'toolbar.color.default': 'Default',

	// ---- Toolbar — highlight palette ----
	'toolbar.highlightColor.none': 'None',

	// ---- Toolbar — link input + custom swatches ----
	'toolbar.link.placeholder': 'Paste or type a URL...',
	'toolbar.link.apply': 'Apply',

	// ---- Block menu — actions ----
	'blockMenu.moveUp': 'Move up',
	'blockMenu.moveDown': 'Move down',
	'blockMenu.duplicate': 'Duplicate',
	'blockMenu.delete': 'Delete',
	'blockMenu.font': 'Font',

	// ---- Block menu — table ----
	'blockMenu.table.showBorders': 'Show Borders',
	'blockMenu.table.hideBorders': 'Hide Borders',
	'blockMenu.table.fullWidth': 'Full Width',
	'blockMenu.table.compact': 'Compact',

	// ---- Block menu — color theme ----
	'blockMenu.colorTheme.label': 'Color Theme',
	'blockMenu.colorTheme.newTemplate': 'New template…',
	'blockMenu.colorTheme.templateNameLabel': 'Name',
	'blockMenu.colorTheme.templateNamePlaceholder': 'Marketing theme',
	'blockMenu.colorTheme.headerColorLabel': 'Header color',
	'blockMenu.colorTheme.rowColorLabel': 'Alternating row color',
	'blockMenu.colorTheme.cancel': 'Cancel',
	'blockMenu.colorTheme.save': 'Save',
	'blockMenu.colorTheme.remove': 'Remove',
	'blockMenu.colorTheme.removeAria': 'Remove custom template',

	// ---- Block menu — list style ----
	'blockMenu.listStyle.label': 'Bullet style',
	'blockMenu.listStyle.styleSection': 'Style',
	'blockMenu.listStyle.formatSection': 'Format',
	'blockMenu.listStyle.sizeSection': 'Size',
	'blockMenu.listStyle.colorSection': 'Color',
	'blockMenu.listStyle.startAt': 'Start at',

	// bullet style options
	'blockMenu.listStyle.bullet.disc': 'Disc',
	'blockMenu.listStyle.bullet.circle': 'Circle',
	'blockMenu.listStyle.bullet.square': 'Square',
	'blockMenu.listStyle.bullet.dash': 'Dash',
	'blockMenu.listStyle.bullet.arrow': 'Arrow',
	'blockMenu.listStyle.bullet.star': 'Star',
	'blockMenu.listStyle.bullet.checkmark': 'Checkmark',

	// number style options
	'blockMenu.listStyle.number.decimal': 'Numbers',
	'blockMenu.listStyle.number.lowerAlpha': 'Lowercase',
	'blockMenu.listStyle.number.upperAlpha': 'Uppercase',
	'blockMenu.listStyle.number.lowerRoman': 'Roman (lower)',
	'blockMenu.listStyle.number.upperRoman': 'Roman (upper)',

	// marker sizes
	'blockMenu.listStyle.size.small': 'Small',
	'blockMenu.listStyle.size.medium': 'Medium',
	'blockMenu.listStyle.size.large': 'Large',

	// marker colors
	'blockMenu.listStyle.color.default': 'Default',
	'blockMenu.listStyle.color.black': 'Black',
	'blockMenu.listStyle.color.gray': 'Gray',
	'blockMenu.listStyle.color.red': 'Red',
	'blockMenu.listStyle.color.orange': 'Orange',
	'blockMenu.listStyle.color.yellow': 'Yellow',
	'blockMenu.listStyle.color.green': 'Green',
	'blockMenu.listStyle.color.blue': 'Blue',
	'blockMenu.listStyle.color.purple': 'Purple',
	'blockMenu.listStyle.color.pink': 'Pink',

	// ---- Block menu — turn into ----
	'blockMenu.turnInto.label': 'Turn into',
	'blockMenu.turnInto.paragraph': 'Text',
	'blockMenu.turnInto.heading1': 'Heading 1',
	'blockMenu.turnInto.heading2': 'Heading 2',
	'blockMenu.turnInto.heading3': 'Heading 3',
	'blockMenu.turnInto.bulletItem': 'Bullet list',
	'blockMenu.turnInto.numberItem': 'Numbered list',
	'blockMenu.turnInto.todoItem': 'To-do list',
	'blockMenu.turnInto.toggle': 'Toggle list',
	'blockMenu.turnInto.code': 'Code',
	'blockMenu.turnInto.quote': 'Quote',
	'blockMenu.turnInto.callout': 'Callout',

	// ---- Block menu — columns ----
	'blockMenu.columns.splitInto': 'Split into columns',
	'blockMenu.columns.addColumnLeft': 'Add column left',
	'blockMenu.columns.addColumnRight': 'Add column right',
	'blockMenu.columns.removeColumn': 'Remove column',

	// ---- Find & replace ----
	'findReplace.drag': 'Drag to move',
	'findReplace.findPlaceholder': 'Find...',
	'findReplace.previous': 'Previous (Shift+Enter)',
	'findReplace.next': 'Next (Enter)',
	'findReplace.toggleReplace': 'Toggle replace',
	'findReplace.close': 'Close (Esc)',
	'findReplace.replacePlaceholder': 'Replace with...',
	'findReplace.replace': 'Replace current',
	'findReplace.replaceAll': 'Replace all',
	'findReplace.replaceButton': 'Replace',
	'findReplace.allButton': 'All',

	// ---- Emoji picker ----
	'emoji.category': 'Emoji',
	'emoji.empty': 'No matching emoji',

	// ---- Image block ----
	'image.urlPlaceholder': 'Paste image URL...',
	'image.altPlaceholder': 'Alt text...',
	'image.enterCropMode': 'Crop mode',
	'image.exitCropMode': 'Exit crop mode',
	'image.lockAspect': 'Lock aspect ratio',
	'image.unlockAspect': 'Unlock aspect ratio',
	'image.layoutGroup': 'Image layout',
	'image.layoutLeft': 'Align left',
	'image.layoutCenter': 'Center',
	'image.layoutRight': 'Align right',
	'image.layoutFull': 'Full width',
	'image.uploading': 'Uploading…',

	// ---- Table — content templates ----
	'table.template.empty.name': 'Empty 3×3',
	'table.template.empty.description': 'Blank table with header row',
	'table.template.taskTracker.name': 'Task Tracker',
	'table.template.taskTracker.description': 'Track tasks with status and assignee',
	'table.template.comparison.name': 'Comparison',
	'table.template.comparison.description': 'Compare features or options',
	'table.template.weeklySchedule.name': 'Weekly Schedule',
	'table.template.weeklySchedule.description': 'Plan your week',
	'table.template.prosCons.name': 'Pros & Cons',
	'table.template.prosCons.description': 'Evaluate pros and cons',
	'table.template.contactList.name': 'Contact List',
	'table.template.contactList.description': 'Store contacts information',

	// ---- Table — color templates ----
	'table.colorTemplate.default.name': 'Default',
	'table.colorTemplate.default.description': 'No colors',
	'table.colorTemplate.stripedGray.name': 'Striped Gray',
	'table.colorTemplate.stripedGray.description': 'Alternating gray rows',
	'table.colorTemplate.blueHeader.name': 'Blue Header',
	'table.colorTemplate.blueHeader.description': 'Blue header with light rows',
	'table.colorTemplate.greenHeader.name': 'Green Header',
	'table.colorTemplate.greenHeader.description': 'Green header with light rows',
	'table.colorTemplate.purpleHeader.name': 'Purple Header',
	'table.colorTemplate.purpleHeader.description': 'Purple header with light rows',
	'table.colorTemplate.warmTones.name': 'Warm Tones',
	'table.colorTemplate.warmTones.description': 'Orange header with warm rows',
	'table.colorTemplate.rose.name': 'Rose',
	'table.colorTemplate.rose.description': 'Pink header with rose rows',

	// ---- Table — cell colors ----
	'table.cellColor.none': 'None',
	'table.cellColor.lightGray': 'Light Gray',
	'table.cellColor.lightRed': 'Light Red',
	'table.cellColor.lightOrange': 'Light Orange',
	'table.cellColor.lightYellow': 'Light Yellow',
	'table.cellColor.lightGreen': 'Light Green',
	'table.cellColor.lightBlue': 'Light Blue',
	'table.cellColor.lightPurple': 'Light Purple',
	'table.cellColor.lightPink': 'Light Pink',

	// ---- Table — operations / aria ----
	'table.merge': 'Merge selected cells',
	'table.mergeCount': 'Merge {{count}} cells',
	'table.columnOptions': 'Column options',
	'table.columnDrag': 'Drag to reorder or click for options',
	'table.rowOptions': 'Row options',
	'table.rowDrag': 'Drag to reorder or click for options',
	'table.addColumn': 'Add column',
	'table.addRow': 'Add row',
} as const;

export type EditorTranslationKey = keyof typeof defaultEditorTranslations;

export type EditorTranslations = Record<EditorTranslationKey, string>;

export type EditorTFunction = (
	key: EditorTranslationKey,
	vars?: Record<string, string | number>,
) => string;

/** Substitute `{{name}}` placeholders. Matches i18next syntax. */
export function interpolate(str: string, vars?: Record<string, string | number>): string {
	if (!vars) return str;
	return str.replaceAll(/\{\{(\w+)\}\}/g, (_, k) => {
		const v = vars[k];
		return v === undefined ? `{{${k}}}` : String(v);
	});
}

/** Internal `t` impl used when host provides static translations or nothing. */
export function makeStaticT(overrides?: Partial<EditorTranslations>): EditorTFunction {
	return (key, vars) => {
		const raw = overrides?.[key] ?? defaultEditorTranslations[key];
		return interpolate(raw, vars);
	};
}
