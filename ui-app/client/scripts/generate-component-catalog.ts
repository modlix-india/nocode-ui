/**
 * generate-component-catalog.ts
 *
 * Build-time script that scans all component source files and extracts
 * property definitions, style metadata, pseudo-states, and default templates
 * into a single component-catalog.json.
 *
 * The catalog is consumed by the nocode-ai AppBuilder agent so it knows
 * valid component types and their properties.
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/generate-component-catalog.ts
 *   # or
 *   npx tsx scripts/generate-component-catalog.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Types ──────────────────────────────────────────────────────

interface CatalogProperty {
	name: string;
	displayName?: string;
	description?: string;
	type?: string; // 'string' | 'boolean' | 'object' | etc.
	editor?: string; // ComponentPropertyEditor name
	group?: string; // ComponentPropertyGroup name
	translatable?: boolean;
	multiValued?: boolean;
	enumValues?: Array<{ name: string; displayName: string }>;
	defaultValue?: any;
}

interface ThemeStyleCssEntry {
	css: string;
	default?: string;
}

interface ThemeStyleProperties {
	designTypes: string[];
	themeStyles: Record<string, ThemeStyleCssEntry[]>;
}

interface SubComponentInfo {
	groups: string[];
	description: string;
}

interface CatalogComponent {
	displayName: string;
	description: string;
	structure?: string; // visual DOM hierarchy notation
	order?: number;
	properties: CatalogProperty[];
	subComponents: Record<string, SubComponentInfo>;
	pseudoStates: string[];
	allowedChildren: boolean; // whether it accepts children
	defaultTemplate?: Record<string, any>;
	bindingPaths?: Record<string, string>;
	themeProperties?: string[];
	themeStyleProperties?: ThemeStyleProperties;
	isHidden?: boolean;
}

interface ComponentCatalog {
	version: string;
	generatedAt: string;
	componentCount: number;
	designTypeDescriptions: Record<string, string>;
	components: Record<string, CatalogComponent>;
}

// ── Configuration ──────────────────────────────────────────────

const COMPONENTS_DIR = path.resolve(__dirname, '../src/components');
const OUTPUT_PATH = path.resolve(__dirname, '../dist/component-catalog.json');
const STYLE_PROPERTIES_DIR = path.resolve(__dirname, '../dist/styleProperties');

// Directories to skip (not user-facing components)
const SKIP_DIRS = new Set([
	'util',
	'HelperComponents',
	'Jot', // internal only
]);

// Standalone files (not directories)
const SKIP_FILES = new Set(['Children.tsx', 'Nothing.tsx', 'Portal.tsx', 'index.ts']);

// ── TypeScript AST Helpers ─────────────────────────────────────

/**
 * Parse a TypeScript file and return its source file AST.
 */
function parseFile(filePath: string): ts.SourceFile | null {
	if (!fs.existsSync(filePath)) return null;
	const content = fs.readFileSync(filePath, 'utf-8');
	return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

/**
 * Extract string literal value from AST node.
 */
function getStringLiteral(node: ts.Node): string | undefined {
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
		return node.text;
	}
	return undefined;
}

/**
 * Extract property value from an object literal expression by key name.
 */
function getObjectProperty(
	obj: ts.ObjectLiteralExpression,
	propName: string,
): ts.Expression | undefined {
	for (const prop of obj.properties) {
		if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === propName) {
			return prop.initializer;
		}
	}
	return undefined;
}

/**
 * Extract string array from an AST array literal.
 */
function extractStringArray(node: ts.Node): string[] {
	if (!ts.isArrayLiteralExpression(node)) return [];
	return node.elements
		.map(el => getStringLiteral(el))
		.filter((s): s is string => s !== undefined);
}

// ── ComponentPropertyEditor / Group enum resolution ────────────

const EDITOR_NAMES: Record<number, string> = {
	0: 'DATA_LOCATION',
	1: 'TRANSLATABLE_PROP',
	2: 'ICON',
	3: 'VALIDATION',
	4: 'ENUM',
	5: 'PAGE_SELECTOR',
	6: 'COMPONENT_SELECTOR',
	7: 'EVENT_SELECTOR',
	8: 'LAYOUT',
	9: 'BACKGROUND',
	10: 'STYLE_SELECTOR',
	11: 'THEME_SELECTOR',
	12: 'IMAGE',
	13: 'SCHEMA',
	14: 'LARGE_TEXT',
	15: 'ANIMATION',
	16: 'ANIMATIONOBSERVER',
	17: 'COLOR_PICKER',
	18: 'SECTION_PROPERTIES_EDITOR',
	19: 'TEXT_EDITOR',
};

/**
 * Resolve a ComponentPropertyEditor enum access to its string name.
 * Handles: ComponentPropertyEditor.ICON → "ICON"
 */
function resolveEditorName(node: ts.Expression): string | undefined {
	if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
		const accessedName = node.name.text;
		// Check if accessing ComponentPropertyEditor
		if (ts.isIdentifier(node.expression) && node.expression.text === 'ComponentPropertyEditor') {
			return accessedName;
		}
	}
	if (ts.isNumericLiteral(node)) {
		return EDITOR_NAMES[parseInt(node.text)] ?? node.text;
	}
	return undefined;
}

/**
 * Resolve a ComponentPropertyGroup enum access to its string name.
 */
function resolveGroupName(node: ts.Expression): string | undefined {
	if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
		return node.name.text;
	}
	if (ts.isStringLiteral(node)) {
		return node.text;
	}
	return undefined;
}

// ── Property Extraction ────────────────────────────────────────

/**
 * Extract a single property definition from an object literal AST node.
 */
function extractPropertyFromObject(obj: ts.ObjectLiteralExpression): CatalogProperty | null {
	const nameNode = getObjectProperty(obj, 'name');
	if (!nameNode) return null;

	const name = getStringLiteral(nameNode);
	if (!name) return null;

	const prop: CatalogProperty = { name };

	const displayNameNode = getObjectProperty(obj, 'displayName');
	if (displayNameNode) prop.displayName = getStringLiteral(displayNameNode);

	const descNode = getObjectProperty(obj, 'description');
	if (descNode) prop.description = getStringLiteral(descNode);

	const editorNode = getObjectProperty(obj, 'editor');
	if (editorNode) prop.editor = resolveEditorName(editorNode);

	const groupNode = getObjectProperty(obj, 'group');
	if (groupNode) prop.group = resolveGroupName(groupNode);

	const transNode = getObjectProperty(obj, 'translatable');
	if (transNode && transNode.kind === ts.SyntaxKind.TrueKeyword) prop.translatable = true;

	const multiNode = getObjectProperty(obj, 'multiValued');
	if (multiNode && multiNode.kind === ts.SyntaxKind.TrueKeyword) prop.multiValued = true;

	// Extract schema type hint
	const schemaNode = getObjectProperty(obj, 'schema');
	if (schemaNode && ts.isIdentifier(schemaNode)) {
		const schemaName = schemaNode.text;
		if (schemaName.includes('BOOL')) prop.type = 'boolean';
		else if (schemaName.includes('STRING')) prop.type = 'string';
		else if (schemaName.includes('NUM')) prop.type = 'number';
		else if (schemaName.includes('VALIDATION')) prop.type = 'validation';
	}

	// Extract enum values
	const enumNode = getObjectProperty(obj, 'enumValues');
	if (enumNode && ts.isArrayLiteralExpression(enumNode)) {
		prop.enumValues = [];
		for (const el of enumNode.elements) {
			if (ts.isObjectLiteralExpression(el)) {
				const eName = getObjectProperty(el, 'name');
				const eDisplay = getObjectProperty(el, 'displayName');
				if (eName) {
					prop.enumValues.push({
						name: getStringLiteral(eName) ?? '',
						displayName: (eDisplay && getStringLiteral(eDisplay)) ?? '',
					});
				}
			}
		}
	}

	return prop;
}

/**
 * Extract property names that reference COMMON_COMPONENT_PROPERTIES.xxx
 * These are spread references like: COMMON_COMPONENT_PROPERTIES.label
 */
function extractCommonPropReference(node: ts.Expression): string | undefined {
	if (
		ts.isPropertyAccessExpression(node) &&
		ts.isIdentifier(node.expression) &&
		node.expression.text === 'COMMON_COMPONENT_PROPERTIES'
	) {
		return node.name.text;
	}
	return undefined;
}

// Well-known common properties (from util/properties.ts)
const COMMON_PROPERTIES: Record<string, CatalogProperty> = {
	onClick: {
		name: 'onClick',
		displayName: 'On Click',
		editor: 'EVENT_SELECTOR',
		description: 'Event to be triggered when clicked.',
		group: 'EVENTS',
		type: 'string',
	},
	onChange: {
		name: 'onChange',
		displayName: 'On Change',
		editor: 'EVENT_SELECTOR',
		description: 'Event to be triggered on input change.',
		group: 'EVENTS',
		type: 'string',
	},
	onBlur: {
		name: 'onBlur',
		displayName: 'On Blur',
		editor: 'EVENT_SELECTOR',
		description: 'Event to be triggered on input blur.',
		group: 'EVENTS',
		type: 'string',
	},
	onFocus: {
		name: 'onFocus',
		displayName: 'On Focus',
		editor: 'EVENT_SELECTOR',
		description: 'Event to be triggered on input focus.',
		group: 'EVENTS',
		type: 'string',
	},
	onSelect: {
		name: 'onSelect',
		displayName: 'On Select',
		editor: 'EVENT_SELECTOR',
		description: 'Event to be triggered when selection.',
		group: 'EVENTS',
		type: 'string',
	},
	onEnter: {
		name: 'onEnter',
		displayName: 'On Enter',
		editor: 'EVENT_SELECTOR',
		description: 'Event to be triggered when enter is pressed.',
		group: 'EVENTS',
		type: 'string',
	},
	label: {
		name: 'label',
		displayName: 'Label',
		description: 'Label to be displayed',
		translatable: true,
		group: 'BASIC',
		editor: 'TRANSLATABLE_PROP',
		type: 'string',
	},
	readOnly: {
		name: 'readOnly',
		displayName: 'Read Only',
		description: 'This component will be rendered un editable when this property is true.',
		group: 'COMMON',
		type: 'boolean',
	},
	visibility: {
		name: 'visibility',
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: 'COMMON',
		type: 'boolean',
	},
	linkPath: {
		name: 'linkPath',
		displayName: 'Link Path',
		description: 'Path to navigate when clicked.',
		group: 'ADVANCED',
		type: 'string',
	},
	linkTargetType: {
		name: 'linkTargetType',
		displayName: 'Link Target',
		description: 'Target for link navigation.',
		group: 'ADVANCED',
		type: 'string',
	},
	designType: {
		name: 'designType',
		displayName: 'Design Type',
		description: 'Design type for theming.',
		group: 'ADVANCED',
		editor: 'ENUM',
		type: 'string',
		enumValues: [
			{ name: '_default', displayName: 'Default' },
		],
	},
	colorScheme: {
		name: 'colorScheme',
		displayName: 'Color Scheme',
		description: 'Color scheme for the component.',
		group: 'ADVANCED',
		editor: 'ENUM',
		type: 'string',
		enumValues: [
			{ name: '_default', displayName: 'Default' },
		],
	},
	validation: {
		name: 'validation',
		displayName: 'Validation',
		description: 'Validation Rule',
		editor: 'VALIDATION',
		multiValued: true,
		group: 'VALIDATION',
		type: 'validation',
	},
	placeholder: {
		name: 'placeholder',
		displayName: 'Placeholder',
		description: 'Placeholder text',
		translatable: true,
		group: 'BASIC',
		editor: 'TRANSLATABLE_PROP',
		type: 'string',
	},
};

// ── Component Briefs ───────────────────────────────────────────
// Hardcoded 1-2 sentence descriptions for each component so the
// AI agent understands what it does and when to use it.

const COMPONENT_BRIEFS: Record<string, string> = {
	Animator:
		'Animation wrapper that applies CSS animations to child components. Use to add entrance, exit, or scroll-triggered animations.',
	ArrayRepeater:
		'Repeats child components for each item in a bound array. Supports add, delete, and reorder operations on list data.',
	Audio:
		'Audio player with playback controls, seek bar, volume, and playback speed. Use for music or audio file playback.',
	Button:
		'Clickable button with designType variants (default, outlined, text, fab, icon, decorative). Triggers onClick events.',
	ButtonBar:
		'Horizontal group of buttons for related actions (e.g. save/cancel, pagination). Arranges Button children in a row.',
	Calendar:
		'Date picker with month/year navigation, date range selection, and weekend highlighting. Binds to a date value.',
	Carousel:
		'Image/content slideshow with navigation arrows, dot indicators, and auto-play. Slides through child components.',
	Chart:
		'Data visualization using Chart.js — supports bar, line, pie, doughnut, radar, and polar area chart types.',
	CheckBox:
		'Boolean toggle input with label. Renders as a checkbox with checked/unchecked states and optional indeterminate.',
	ColorPicker:
		'Color selection input with hex/RGB picker, preset swatches, and transparency support.',
	Dropdown:
		'Select input with search, multi-select, and checkbox mode. Bind data via bindingPath to populate options.',
	FileSelector:
		'File browser that lets users select files from the platform file storage. Shows thumbnails and file details.',
	FileUpload:
		'File upload input with drag-and-drop, progress indicator, and multi-file support. Uploads to platform storage.',
	FillerDefinitionEditor:
		'Editor for defining filler templates — configures template variables and their types. Internal/admin component.',
	FillerValueEditor:
		'Editor for filling in filler template values. Renders form fields based on filler definition. Internal/admin component.',
	Form: 'Form wrapper that provides validation context for child input components. Groups inputs and handles submit.',
	FormEditor:
		'Visual form builder that generates form layouts from schema definitions. Drag-and-drop field arrangement.',
	Gallery:
		'Image gallery with grid/masonry layout, lightbox preview, and thumbnail navigation. Displays image collections.',
	Grid: 'Flex/grid container for layout. The primary building block — use to arrange child components in rows, columns, or grid layouts.',
	Icon: 'Displays an icon from the platform icon library (Font Awesome). Supports sizing, color, and click events.',
	Iframe:
		'Embeds an external webpage or URL inside an iframe. Use for third-party content integration.',
	Image: 'Displays an image with responsive sizing, object-fit modes, and optional click/hover events.',
	ImageWithBrowser:
		'Image display with built-in file browser for selecting images from platform storage. Combines Image + FileSelector.',
	Jot: 'Sticky note / annotation component for adding comments or notes to a page layout. Internal/editor component.',
	'KIRun Editor':
		'Visual editor for KIRun function definitions with step-by-step flow builder. Internal/developer component.',
	Link: 'Navigation link that routes to internal pages or external URLs. Renders as an anchor tag with styling.',
	MarkdownEditor:
		'Rich text editor that outputs Markdown. Toolbar with formatting buttons, preview mode, and syntax highlighting.',
	MarkdownTOC:
		'Auto-generated table of contents from Markdown headings. Updates dynamically as content changes.',
	Menu: 'Navigation menu with nested sub-menus, icons, and horizontal/vertical orientation. Supports multi-level hierarchies.',
	Otp: 'One-time password input with individual digit boxes. Auto-focuses next box on input, supports paste.',
	Page: 'Root page container that wraps all components on a page. Provides page-level properties and store initialization.',
	PageEditor:
		'Visual page editor with component tree, property panel, and drag-and-drop. Internal/platform component.',
	PhoneNumber:
		'Phone number input with country code dropdown, flag icons, and international format validation.',
	Popover:
		'Content that appears in a floating overlay near a trigger element. Use for tooltips, menus, or contextual info.',
	Popup:
		'Modal dialog overlay with backdrop, close button, and customizable content area. Use for confirmations or forms.',
	ProgressBar:
		'Visual progress indicator showing completion percentage. Supports horizontal bar and circular variants.',
	Prompt:
		'AI chat interface with SSE streaming, message history, and tool call display. Connects to AI agent endpoints.',
	RadioButton:
		'Radio button group for single-selection from multiple options. Each option has a label and value.',
	RangeSlider:
		'Numeric range input with draggable thumb(s). Supports single value or min/max range selection with marks.',
	SSEventListener:
		'Server-Sent Events listener that subscribes to an SSE endpoint and triggers events on messages. Non-visual component.',
	SchemaBuilder:
		'Visual JSON schema editor for defining data structures. Supports nested objects, arrays, and type constraints.',
	SchemaForm:
		'Auto-generates a form UI from a JSON schema definition. Maps schema types to appropriate input components.',
	SectionGrid:
		'Page section container with semantic HTML (header, main, footer, section, article, aside, nav). Use for page structure.',
	'Small Carousel':
		'Compact carousel variant showing multiple items at once with peek/slide navigation. Use for product cards or thumbnails.',
	Stepper:
		'Multi-step wizard/progress indicator showing numbered steps with active/done/pending states. Use for multi-page forms.',
	SubPage:
		'Embeds another page inside the current page. Use for reusable page fragments and page composition.',
	Table:
		'Data table with pagination, sorting, filtering, column/grid view modes, and row selection. Uses TableColumn children.',
	TableColumn:
		'Defines a single column in a Table — specifies header, data binding, width, sortability, and cell renderer.',
	TableColumnHeader:
		'Custom header renderer for a TableColumn. Use to add sorting icons, filters, or custom header content.',
	TableColumns:
		'Container for dynamically generated table columns. Use when columns are data-driven rather than static.',
	TableDynamicColumn:
		'Column definition for dynamically generated columns inside TableColumns. Bound to column data source.',
	TableEmptyGrid:
		'Empty state display shown when a Table has no data. Contains child components for the empty message.',
	TableGrid:
		'Grid/card view renderer for Table data. Displays each row as a card instead of a table row.',
	TablePreviewGrid:
		'Preview/detail panel for a selected Table row. Shows expanded content below or beside the table.',
	TableRow:
		'Custom row renderer for Table. Overrides default row rendering with custom layout for each data row.',
	Tabs: 'Tabbed container — each tab hosts child components. Supports horizontal/vertical orientation and tab icons.',
	Tags: 'Tag/chip input for entering multiple values as tags. Supports autocomplete, remove, and custom tag rendering.',
	TemplateEditor:
		'Editor for HTML/text templates with variable insertion. Used for email templates and dynamic content.',
	Text: 'Display text with formatting (number, date, currency, markdown). Supports prefix/suffix, truncation, and rich text.',
	TextArea:
		'Multi-line text input with resizable height, character count, and auto-grow. Use for longer text content.',
	TextBox:
		'Single-line text input with label, validation, icons, and edit-on-request mode. Use for email, password, search, numbers.',
	TextEditor:
		'Rich text WYSIWYG editor with formatting toolbar. Outputs HTML content. Use for content authoring.',
	TextList:
		'Ordered or unordered list display. Renders array data as a styled list with bullet/number markers.',
	ThemeEditor:
		'Visual theme customization editor for colors, fonts, and spacing. Internal/admin component.',
	Timer: 'Countdown or count-up timer with start/stop/reset controls. Triggers events on completion.',
	ToggleButton:
		'On/off switch toggle with label. Renders as a sliding switch control with customizable track and knob.',
	Video:
		'Video player with playback controls, seek bar, volume, fullscreen, and playback speed. Supports multiple sources.',
};

// ── Sub-Component Descriptions ─────────────────────────────────
// Descriptions for commonly-used sub-component keys that appear
// in stylePropertiesDefinition across components.

const SUB_COMPONENT_DESCRIPTIONS: Record<string, string> = {
	inputBox: 'The text input element',
	label: 'Label text above/beside the input',
	leftIcon: 'Icon on the left side of the input',
	rightIcon: 'Icon on the right side of the input',
	errorText: 'Validation error message text',
	errorTextContainer: 'Container wrapping the error message',
	supportText: 'Helper/support text below the input',
	asterisk: 'Required field indicator (*)',
	icon: 'Icon element',
	container: 'Inner container wrapper',
	header: 'Header section',
	title: 'Title text element',
	text: 'Text content element',
	subText: 'Secondary/subtitle text',
	image: 'Image element',
	dropdownBody: 'Dropdown panel/overlay body',
	dropdownItem: 'Individual item in the dropdown list',
	dropdownOption: 'Selectable option in the dropdown',
	dropdownSelect: 'The select trigger/display area',
	dropdownOptionList: 'Container for dropdown options',
	searchBox: 'Search input field',
	searchBoxContainer: 'Container wrapping the search input',
	tab: 'Individual tab content panel',
	tabBar: 'Tab navigation bar container',
	tabButton: 'Clickable tab button/label',
	tabHighlighter: 'Active tab indicator/underline',
	checkbox: 'Checkbox element',
	knob: 'Toggle switch knob/handle',
	track: 'Toggle switch or slider track',
	thumb: 'Slider thumb/handle',
	progress: 'Progress bar fill element',
	bar: 'Bar element (progress/chart)',
	modal: 'Modal dialog container',
	closeButton: 'Close/dismiss button',
	tooltip: 'Tooltip popup element',
	player: 'Media player container',
	video: 'Video element',
	seekSlider: 'Media seek/scrub bar',
	playPauseButton: 'Play/pause toggle button',
	volumeSlider: 'Volume control slider',
	tagContainer: 'Individual tag/chip wrapper',
	tagText: 'Text inside a tag/chip',
	tagCloseIcon: 'Remove icon on a tag/chip',
	step: 'Individual step in a stepper',
	activeLine: 'Active step connector line',
	doneLine: 'Completed step connector line',
	selectedOption: 'Currently selected option display',
	validationMessage: 'Validation message text',
	listItem: 'Individual item in a list',
	row: 'Table row element',
	topLabel: 'Label positioned above the component',
	bottomLabel: 'Label positioned below the component',
	caretIcon: 'Dropdown caret/arrow icon',
	visibilityToggle: 'Password visibility toggle button',
};

// ── Component Visual Structures ────────────────────────────────
// Shows the visual DOM hierarchy of each component so the AI
// understands how sub-components are arranged spatially.
//
// Notation:
//   →  vertical flow (top to bottom)
//   |  horizontal siblings (left to right)
//   ?  conditionally shown
//   [] grouping / container
//   {} floating overlay / popup
//  ... repeated elements

const COMPONENT_STRUCTURES: Record<string, string> = {
	TextBox:
		'[label + asterisk?] → [leftIcon? | inputBox | rightIcon?] → supportText? → errorText?',
	Dropdown:
		'[label + asterisk?] → [leftIcon? | selectedValue | caretIcon] → {searchBox? → options...} → supportText?',
	Button: '[leftIcon? | label | rightIcon?]',
	CheckBox: '[checkbox | label + text?]',
	ToggleButton: '[knob | checkbox(hidden) | label?]',
	Table:
		'[modesContainer? | searchBox?] → [columnHeaders → rows...] | [gridCards...] → [pagination]',
	Tabs: 'tabBar[tabButton... + highlighter] → childContainer(activeTabContent)',
	Calendar:
		'[label + asterisk?] → [inputBox | caretIcon] → {calendar[header → weekNames → dateGrid]} → supportText?',
	TextArea:
		'[label + asterisk?] → [textArea | clearIcon?] → supportText? → errorText?',
	PhoneNumber:
		'[label + asterisk?] → [countryDropdown | inputBox | clearIcon?] → supportText? → errorText?',
	Stepper: 'steps[icon + title + connectorLine]...',
	RangeSlider:
		'topLabels? → track[rangeTrack | thumb1(tooltip) | thumb2?(tooltip) | marks?] → bottomLabels?',
	Tags: '[label?] → [tagChip[tagText + closeIcon]... | inputBox] → {dropdownBody?}',
	Popup: '{backdrop → modal[titleBar[closeBtn | title] → content]}',
	Menu: 'menuItem[icon? | label | caretIcon?]... → {subMenu?}',
	FileUpload:
		'label? → [uploadIcon | mainText | subText?] → uploadButton? → supportText? → validationMessages?',
	Otp: '[label + asterisk?] → [inputBox... | visibilityToggle?] → supportText? → errorText?',
	Audio:
		'[rewindBtn | playPauseBtn | forwardBtn | fileName? | seekSlider | timeText | volumeControls | playbackSpeed?]',
	Video:
		'[videoElement] → {controls[seekSlider → [playPause | timeText | volume] → [pip? | fullscreen]]}',
	ProgressBar:
		'topLabel? → track[progressFill + label?] → bottomLabel? | circular: svg[trackCircle + progressCircle] + label',
	RadioButton: 'option[radioCircle | label]...',
	Carousel: 'indicators? → [leftArrow | slides... | rightArrow] → indicators?',
	Gallery:
		'{lightbox[toolbar → [leftArrow | imageSlide | rightArrow] → thumbnails?]}',
	Grid: 'children... (flex/grid layout)',
	SectionGrid: '<semanticTag>children...</semanticTag>',
	Text: '[prefixText? | mainText | suffixText?]',
	Image: '[imageElement]',
	Icon: '[iconElement]',
	Link: '[icon? | linkText]',
	Popover: 'triggerElement → {popoverContent}',
	SubPage: '[embeddedPageContent]',
	ArrayRepeater: 'repeatedComponent... → addButton?',
	Form: 'childInputs...',
	ColorPicker:
		'[label + asterisk?] → [inputBox | colorPreview] → {colorPickerPanel} → supportText? → errorText?',
	'Small Carousel':
		'[leftArrow | visibleItems... | rightArrow] → indicators?',
};

// ── Design Type Visual Descriptions ────────────────────────────
// Describes what each designType looks like visually so the AI
// can choose the right variant. Shared across components.

const DESIGN_TYPE_DESCRIPTIONS: Record<string, string> = {
	default:
		'Standard appearance — solid background, minimal border, 32px height, 4px border-radius.',
	outlined:
		'Transparent background with visible 1px border. Pill shape (16px border-radius), extra horizontal padding.',
	filled:
		'Solid background color fill with subtle border. Standard 4px border-radius.',
	text: 'Minimal — no background, no border. Text-only appearance.',
	bigDesign1:
		'Large variant (60px height) with gradient background fill. Good for hero/CTA elements.',
	editOnReq:
		'Invisible by default (no border/background). Reveals border and background on hover/focus.',
	fabButton:
		'Circular floating action button (48px, border-radius 50%). Solid background, no label.',
	fabButtonMini:
		'Small circular FAB variant (32px, border-radius 50%).',
	iconButton: 'Icon-only button — no label text, compact sizing.',
	decorative:
		'Decorative variant with hover-color background and specialized icon sections.',
};

// ── Sub-Component Builder ──────────────────────────────────────

/**
 * Convert style property groups (Record<string, string[]>) into enriched
 * subComponents (Record<string, SubComponentInfo>) with descriptions.
 */
function buildSubComponents(
	styleGroups: Record<string, string[]>,
): Record<string, SubComponentInfo> {
	const result: Record<string, SubComponentInfo> = {};

	for (const [key, groups] of Object.entries(styleGroups)) {
		const displayKey = key === '' ? '(root)' : key;
		let description: string;

		if (key === '') {
			description = 'Main component container';
		} else if (SUB_COMPONENT_DESCRIPTIONS[key]) {
			description = SUB_COMPONENT_DESCRIPTIONS[key];
		} else {
			// Auto-generate from camelCase: "inputBox" → "Input box"
			description = key
				.replace(/([A-Z])/g, ' $1')
				.replace(/^./, s => s.toUpperCase())
				.trim();
		}

		result[displayKey] = { groups, description };
	}

	return result;
}

/**
 * Extract all property definitions from a *Properties.ts file.
 */
function extractPropertiesFromFile(filePath: string): CatalogProperty[] {
	const sourceFile = parseFile(filePath);
	if (!sourceFile) return [];

	const properties: CatalogProperty[] = [];

	// Find the propertiesDefinition variable declaration
	function visit(node: ts.Node) {
		if (
			ts.isVariableDeclaration(node) &&
			ts.isIdentifier(node.name) &&
			node.name.text === 'propertiesDefinition' &&
			node.initializer &&
			ts.isArrayLiteralExpression(node.initializer)
		) {
			for (const element of node.initializer.elements) {
				// Direct COMMON_COMPONENT_PROPERTIES reference
				const commonRef = extractCommonPropReference(element);
				if (commonRef && COMMON_PROPERTIES[commonRef]) {
					properties.push({ ...COMMON_PROPERTIES[commonRef] });
					continue;
				}

				// Object literal (inline property definition)
				if (ts.isObjectLiteralExpression(element)) {
					const prop = extractPropertyFromObject(element);
					if (prop) properties.push(prop);
					continue;
				}

				// Spread of common property with overrides:
				// { ...COMMON_COMPONENT_PROPERTIES.designType, enumValues: [...] }
				if (ts.isObjectLiteralExpression(element)) {
					// Already handled above
				}
			}
		}
		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return properties;
}

// ── Style Property Group Extraction ────────────────────────────

/**
 * Extract stylePropertiesDefinition from a *Properties.ts file.
 * Returns a map of sub-component name → style group type strings.
 */
function extractStylePropertyGroups(filePath: string): Record<string, string[]> {
	const sourceFile = parseFile(filePath);
	if (!sourceFile) return {};

	const groups: Record<string, string[]> = {};

	function visit(node: ts.Node) {
		if (
			ts.isVariableDeclaration(node) &&
			ts.isIdentifier(node.name) &&
			node.name.text === 'stylePropertiesDefinition' &&
			node.initializer &&
			ts.isObjectLiteralExpression(node.initializer)
		) {
			for (const prop of node.initializer.properties) {
				if (ts.isPropertyAssignment(prop)) {
					let key = '';
					if (ts.isStringLiteral(prop.name) || ts.isIdentifier(prop.name))
						key = prop.name.text;

					if (ts.isArrayLiteralExpression(prop.initializer)) {
						const types: string[] = [];
						for (const el of prop.initializer.elements) {
							// COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type → "spacing"
							if (ts.isPropertyAccessExpression(el)) {
								// Navigate up: el.expression should be CSGP.spacing, el.name is "type"
								const parent = el.expression;
								if (
									ts.isPropertyAccessExpression(parent) &&
									ts.isIdentifier(parent.name)
								) {
									types.push(parent.name.text);
								}
							}
						}
						groups[key] = types;
					}
				}
			}
		}
		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return groups;
}

// ── Component Export Extraction (from .tsx files) ──────────────

interface ComponentExportMeta {
	name: string;
	displayName: string;
	description: string;
	order?: number;
	pseudoStates: string[];
	allowedChildren: boolean;
	defaultTemplate?: Record<string, any>;
	bindingPaths?: Record<string, string>;
	themeProperties?: string[];
	isHidden?: boolean;
}

/**
 * Extract a brace-balanced block for a given property name from source text.
 * E.g. extractBalancedBlock(text, 'bindingPaths') finds `bindingPaths: { ... }`
 * and returns the full content between the outermost braces.
 */
function extractBalancedBlock(text: string, propName: string): string | null {
	const start = text.indexOf(`${propName}:`);
	if (start === -1) return null;

	const braceStart = text.indexOf('{', start);
	if (braceStart === -1) return null;

	let depth = 0;
	for (let i = braceStart; i < text.length; i++) {
		if (text[i] === '{') depth++;
		else if (text[i] === '}') depth--;
		if (depth === 0) return text.slice(braceStart, i + 1);
	}
	return null;
}

/**
 * Parse a component object block (the inner content of `{ ... }`) into metadata.
 */
function extractMetaFromBlock(block: string): ComponentExportMeta | null {
	// Extract name (supports names with spaces like 'Small Carousel')
	const nameMatch = block.match(/\bname:\s*['"]([^'"]+)['"]/);
	const name = nameMatch?.[1] ?? '';
	if (!name) return null;

	// Extract displayName
	const displayNameMatch = block.match(/\bdisplayName:\s*['"]([^'"]+)['"]/);
	const displayName = displayNameMatch?.[1] ?? name;

	// Extract description
	const descMatch = block.match(/\bdescription:\s*['"]([^'"]+)['"]/);
	const description = descMatch?.[1] ?? '';

	// Extract order
	const orderMatch = block.match(/\border:\s*(\d+)/);
	const order = orderMatch ? parseInt(orderMatch[1]) : undefined;

	// Extract stylePseudoStates
	const pseudoMatch = block.match(/stylePseudoStates:\s*\[(.*?)\]/);
	let pseudoStates: string[] = [];
	if (pseudoMatch) {
		pseudoStates = pseudoMatch[1]
			.split(',')
			.map(s => s.trim().replace(/['"]/g, ''))
			.filter(s => s.length > 0);
	}

	// Check for allowedChildrenType
	const allowedChildren = /allowedChildrenType/.test(block);

	// Check isHidden
	const isHidden = /isHidden:\s*true/.test(block);

	// Extract defaultTemplate — find type and property values
	let defaultTemplate: Record<string, any> | undefined;
	const templateTypeMatch = block.match(/defaultTemplate:\s*\{[\s\S]*?type:\s*['"]([^'"]+)['"]/);
	if (templateTypeMatch) {
		defaultTemplate = { type: templateTypeMatch[1] };
		// Extract property values from within defaultTemplate block
		const templateBlock = extractBalancedBlock(block, 'defaultTemplate');
		if (templateBlock) {
			const propMatches = templateBlock.matchAll(/(\w+):\s*\{\s*value:\s*['"]?([^'"}]+)['"]?\s*\}/g);
			const props: Record<string, any> = {};
			for (const m of propMatches) {
				props[m[1]] = m[2].trim();
			}
			if (Object.keys(props).length > 0) {
				defaultTemplate.properties = props;
			}
		}
	}

	// Extract bindingPaths — use brace-balanced extraction to handle nested { name: '...' }
	let bindingPaths: Record<string, string> | undefined;
	const bindingBlock = extractBalancedBlock(block, 'bindingPaths');
	if (bindingBlock) {
		bindingPaths = {};
		const bindings = bindingBlock.matchAll(
			/(\w+):\s*\{\s*name:\s*['"]([^'"]+)['"]\s*\}/g,
		);
		for (const b of bindings) {
			bindingPaths[b[1]] = b[2];
		}
	}

	// Extract propertiesForTheme (variable references)
	let themeProperties: string[] | undefined;
	const themeMatch = block.match(/propertiesForTheme:\s*\[(.*?)\]/);
	if (themeMatch) {
		themeProperties = themeMatch[1]
			.split(',')
			.map(s => s.trim())
			.filter(s => s.length > 0);
	}

	return {
		name,
		displayName,
		description,
		order,
		pseudoStates,
		allowedChildren,
		defaultTemplate,
		bindingPaths,
		themeProperties,
		isHidden,
	};
}

/**
 * Extract the component export object metadata from a .tsx file.
 * Uses regex for robustness since .tsx files have JSX that complicates AST walking.
 */
function extractComponentExportMeta(filePath: string): ComponentExportMeta | null {
	if (!fs.existsSync(filePath)) return null;
	const content = fs.readFileSync(filePath, 'utf-8');

	// Find the component object definition block
	// Pattern 1: const component = { ... }; export default component;
	// Pattern 2: export const Name: Component = { ... };
	const componentBlockMatch =
		content.match(
			/const\s+component\s*(?::\s*Component)?\s*=\s*\{([\s\S]*?)\};\s*\n\s*export\s+default\s+component/,
		) ??
		content.match(
			/export\s+const\s+\w+\s*:\s*Component\s*=\s*\{([\s\S]*?)\};\s*\n/,
		);
	if (!componentBlockMatch) return null;

	return extractMetaFromBlock(componentBlockMatch[1]);
}

// ── Main Scanning Logic ────────────────────────────────────────

/**
 * Find the main component .tsx file in a directory.
 * Convention: ComponentName/ComponentName.tsx
 */
function findMainComponentFile(dirPath: string, dirName: string): string | null {
	// Try exact match first
	const exact = path.join(dirPath, `${dirName}.tsx`);
	if (fs.existsSync(exact)) return exact;

	// Try common variations
	const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.tsx') && !f.includes('Style'));
	for (const f of files) {
		if (f.toLowerCase() === `${dirName.toLowerCase()}.tsx`) return path.join(dirPath, f);
	}

	// Take the first .tsx that isn't a Style file
	if (files.length === 1) return path.join(dirPath, files[0]);

	return null;
}

/**
 * Find properties file in a component directory.
 */
function findPropertiesFile(dirPath: string): string | null {
	const files = fs.readdirSync(dirPath);
	// Find *Properties.ts (not *StyleProperties.ts)
	const propsFile = files.find(
		f => f.endsWith('Properties.ts') && !f.toLowerCase().includes('style'),
	);
	return propsFile ? path.join(dirPath, propsFile) : null;
}

/**
 * Process a single component directory.
 */
function processComponent(dirPath: string, dirName: string): [string, CatalogComponent] | null {
	const mainFile = findMainComponentFile(dirPath, dirName);
	if (!mainFile) {
		console.warn(`  SKIP ${dirName}: no main .tsx file found`);
		return null;
	}

	// Extract component export metadata
	const meta = extractComponentExportMeta(mainFile);
	if (!meta || !meta.name) {
		console.warn(`  SKIP ${dirName}: no component export found in ${path.basename(mainFile)}`);
		return null;
	}

	// Extract properties
	const propsFile = findPropertiesFile(dirPath);
	const properties = propsFile ? extractPropertiesFromFile(propsFile) : [];

	// Extract style property groups and build enriched subComponents
	const styleGroupsRaw = propsFile ? extractStylePropertyGroups(propsFile) : {};
	const subComponents = buildSubComponents(styleGroupsRaw);

	// Use hardcoded brief if available, otherwise fall back to source description
	const description = COMPONENT_BRIEFS[meta.name] ?? meta.description;

	const catalogEntry: CatalogComponent = {
		displayName: meta.displayName,
		description,
		structure: COMPONENT_STRUCTURES[meta.name],
		order: meta.order,
		properties,
		subComponents,
		pseudoStates: meta.pseudoStates,
		allowedChildren: meta.allowedChildren,
		defaultTemplate: meta.defaultTemplate,
		isHidden: meta.isHidden || undefined,
	};

	if (meta.bindingPaths && Object.keys(meta.bindingPaths).length > 0) {
		catalogEntry.bindingPaths = meta.bindingPaths;
	}

	if (meta.themeProperties && meta.themeProperties.length > 0) {
		catalogEntry.themeProperties = meta.themeProperties;
	}

	return [meta.name, catalogEntry];
}

/**
 * Extract all component export blocks from a file with multiple
 * `export const Name: Component = { ... };` definitions.
 */
function extractAllComponentExportMetas(filePath: string): ComponentExportMeta[] {
	if (!fs.existsSync(filePath)) return [];
	const content = fs.readFileSync(filePath, 'utf-8');

	const results: ComponentExportMeta[] = [];
	// Match each `export const Xxx: Component = { ... };`
	const regex = /export\s+const\s+\w+\s*:\s*Component\s*=\s*\{([\s\S]*?)\};\s*\n/g;
	let match: RegExpExecArray | null;
	while ((match = regex.exec(content)) !== null) {
		const meta = extractMetaFromBlock(match[1]);
		if (meta) results.push(meta);
	}
	return results;
}

/**
 * Process TableComponents which uses a consolidated index.tsx with
 * multiple `export const` component definitions, plus individual
 * sub-directories for properties/styles.
 */
function processTableComponents(tableDir: string): Array<[string, CatalogComponent]> {
	const results: Array<[string, CatalogComponent]> = [];
	if (!fs.existsSync(tableDir)) return results;

	const indexFile = path.join(tableDir, 'index.tsx');
	const metas = extractAllComponentExportMetas(indexFile);

	for (const meta of metas) {
		// Find the sub-directory for this component's properties
		const subDirPath = path.join(tableDir, meta.name);

		const propsFile = fs.existsSync(subDirPath) ? findPropertiesFile(subDirPath) : null;
		const properties = propsFile ? extractPropertiesFromFile(propsFile) : [];
		const styleGroupsRaw = propsFile ? extractStylePropertyGroups(propsFile) : {};
		const subComponents = buildSubComponents(styleGroupsRaw);

		// Use hardcoded brief if available, otherwise fall back to source description
		const description = COMPONENT_BRIEFS[meta.name] ?? meta.description;

		const catalogEntry: CatalogComponent = {
			displayName: meta.displayName,
			description,
			structure: COMPONENT_STRUCTURES[meta.name],
			order: meta.order,
			properties,
			subComponents,
			pseudoStates: meta.pseudoStates,
			allowedChildren: meta.allowedChildren,
			defaultTemplate: meta.defaultTemplate,
			isHidden: meta.isHidden || undefined,
		};

		if (meta.bindingPaths && Object.keys(meta.bindingPaths).length > 0) {
			catalogEntry.bindingPaths = meta.bindingPaths;
		}

		results.push([meta.name, catalogEntry]);
	}

	return results;
}

// ── Theme Style Properties Extraction (from dist/styleProperties/*.json) ──

/** CSS state classes that appear in selectors but are NOT sub-element targets. */
const SELECTOR_STATE_CLASSES = new Set([
	'active', 'done', 'nextItem', 'previousItem', 'selected',
	'hasValue', 'hasError', 'isActive', 'readOnly', 'editMode',
	'lowLightWeekend', 'horizontal', 'vertical', 'textRight', 'textLeft',
	'validationSuccess', 'dateWeekend', 'dateSelected', 'dateSelectable',
	'dateDisabled', 'dateNotInMonth', 'dateToday', 'row',
]);

/** Design/color-scheme class names that should NOT be treated as design types. */
const COLOR_SCHEME_NAMES = new Set([
	'primary', 'secondary', 'tertiary', 'quaternary', 'quinary',
]);

/** State classes that may appear directly on the component root in selectors. */
const ROOT_STATE_CLASSES = new Set([
	...SELECTOR_STATE_CLASSES,
	...COLOR_SCHEME_NAMES,
]);

interface StylePropertyEntry {
	cp?: string;
	sel?: string;
	dv?: string;
	spv?: Record<string, string>;
	np?: boolean;
	gn?: string;
	dn?: string;
	n?: string;
}

/**
 * Check if a selector matches a known special pattern and return
 * the corresponding target name, or null if not special.
 */
function resolveSpecialTarget(sel: string): string | null {
	if (/input\[type=["']?range["']?\]/.test(sel)) return 'input[type=range]';
	if (sel.includes('textarea::placeholder')) return 'placeholder';
	if (sel.includes('input::placeholder')) return 'placeholder';
	if (/\ssvg\b/.test(sel)) return 'svg';
	return null;
}

/**
 * Walk descendant parts of a multi-part selector to find the first
 * sub-element class (._xxx) that is NOT a state class.
 */
function resolveDescendantTarget(parts: string[]): string | null {
	for (let i = parts.length - 1; i >= 1; i--) {
		const classMatches = parts[i].match(/\._([a-zA-Z]\w*)/g);
		if (!classMatches) continue;
		for (const m of classMatches) {
			const name = m.slice(2); // strip "._"
			if (!SELECTOR_STATE_CLASSES.has(name)) return name;
		}
	}
	return null;
}

/**
 * Parse a single style-property selector to identify the sub-element target.
 *
 * Rules:
 * 1. Strip template tokens (<designType>, <colorScheme>, <tableDesign>, etc.)
 * 2. Take the first comma-separated selector.
 * 3. Special-case `input[type="range"]`, `textarea::placeholder`, `input::placeholder`, ` svg`.
 * 4. Split by whitespace; if there are descendant parts, find the last part with `._xxx`
 *    class names that are NOT state classes.  The first such class is the target.
 * 5. Otherwise the target is "(root)".
 */
function resolveTarget(sel: string): string {
	// Strip all template tokens
	const cleanSel = sel.replaceAll(/<[a-zA-Z]+>/g, '');

	// Take the first comma-separated alternative
	const firstSel = cleanSel.split(',')[0].trim();

	// Check special selectors first
	const special = resolveSpecialTarget(firstSel);
	if (special) return special;

	// Check descendant parts for sub-element classes
	const parts = firstSel.split(/\s+/);
	if (parts.length > 1) {
		const descendant = resolveDescendantTarget(parts);
		if (descendant) return descendant;
	}

	return '(root)';
}

/**
 * Extract design-type names from an `spv` keys map.
 *
 * SPV keys follow the pattern `_designType-_colorScheme` (or just `_designType-`).
 * The design type is everything before the first `-`, with leading `_` stripped.
 */
function extractDesignTypesFromSpv(spv: Record<string, string>): string[] {
	const types: string[] = [];
	for (const key of Object.keys(spv)) {
		const dashIdx = key.indexOf('-');
		if (dashIdx < 0) continue;
		let dt = key.substring(0, dashIdx);
		if (dt.startsWith('_')) dt = dt.substring(1);
		if (dt.length > 0) types.push(dt);
	}
	return types;
}

/**
 * Extract design-type names from hardcoded selectors (e.g. Stepper uses
 * `.comp.compStepper._default` instead of template tokens).
 */
function extractDesignTypesFromSelector(sel: string): string[] {
	const types: string[] = [];
	const regex = /\.comp\.comp\w+\._(\w+)/g;
	let m: RegExpExecArray | null;
	while ((m = regex.exec(sel)) !== null) {
		const dt = m[1];
		if (!ROOT_STATE_CLASSES.has(dt)) {
			types.push(dt);
		}
	}
	return types;
}

/**
 * Read and process a single `dist/styleProperties/<Component>.json` file.
 * Returns a ThemeStyleProperties object with deduplicated design types,
 * sub-element groupings, and CSS properties with defaults.
 */
/**
 * Collect all design types from a single style property entry into the given set.
 */
function collectDesignTypes(entry: StylePropertyEntry, designTypesSet: Set<string>): void {
	if (entry.spv) {
		for (const dt of extractDesignTypesFromSpv(entry.spv)) {
			designTypesSet.add(dt);
		}
	}
	if (entry.sel) {
		for (const dt of extractDesignTypesFromSelector(entry.sel)) {
			designTypesSet.add(dt);
		}
	}
}

/**
 * Resolve the default CSS value for a style property entry.
 * Prefers the explicit `dv` field, falls back to the `_default-` key in `spv`.
 */
function resolveDefaultValue(entry: StylePropertyEntry): string | undefined {
	if (entry.dv) return entry.dv;
	if (!entry.spv) return undefined;
	const defaultKey = Object.keys(entry.spv).find(k => /^_?default-/.test(k));
	return defaultKey ? entry.spv[defaultKey] : undefined;
}

/**
 * Insert or update a CSS property entry in the target's cssMap.
 * Deduplicates: if the same (target, css) already exists, keeps the entry with a default.
 */
function upsertCssEntry(
	cssMap: Map<string, ThemeStyleCssEntry>,
	cp: string,
	defaultVal: string | undefined,
): void {
	if (cssMap.has(cp)) {
		const existing = cssMap.get(cp)!;
		if (!existing.default && defaultVal) {
			cssMap.set(cp, { css: cp, default: defaultVal });
		}
	} else {
		const prop: ThemeStyleCssEntry = { css: cp };
		if (defaultVal) prop.default = defaultVal;
		cssMap.set(cp, prop);
	}
}

/**
 * Read and process a single `dist/styleProperties/<Component>.json` file.
 * Returns a ThemeStyleProperties object with deduplicated design types,
 * sub-element groupings, and CSS properties with defaults.
 */
function extractThemeStyleProperties(filePath: string): ThemeStyleProperties | null {
	if (!fs.existsSync(filePath)) return null;

	let entries: StylePropertyEntry[];
	try {
		entries = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
	} catch {
		return null;
	}

	if (!Array.isArray(entries) || entries.length === 0) return null;

	const designTypesSet = new Set<string>();
	const targetMap = new Map<string, Map<string, ThemeStyleCssEntry>>();

	for (const entry of entries) {
		collectDesignTypes(entry, designTypesSet);

		if (!entry.cp) continue;

		const target = entry.sel ? resolveTarget(entry.sel) : '(root)';
		const defaultVal = resolveDefaultValue(entry);

		if (!targetMap.has(target)) targetMap.set(target, new Map());
		upsertCssEntry(targetMap.get(target)!, entry.cp, defaultVal);
	}

	const themeStyles: Record<string, ThemeStyleCssEntry[]> = {};
	for (const [target, cssMap] of targetMap) {
		themeStyles[target] = Array.from(cssMap.values());
	}

	return {
		designTypes: Array.from(designTypesSet).sort((a, b) => a.localeCompare(b)),
		themeStyles,
	};
}

/**
 * Scan all JSON files in STYLE_PROPERTIES_DIR and return a map of
 * component name -> ThemeStyleProperties.
 */
function loadAllThemeStyleProperties(): Record<string, ThemeStyleProperties> {
	const result: Record<string, ThemeStyleProperties> = {};

	if (!fs.existsSync(STYLE_PROPERTIES_DIR)) {
		console.warn(`  Style properties directory not found: ${STYLE_PROPERTIES_DIR}`);
		return result;
	}

	const files = fs.readdirSync(STYLE_PROPERTIES_DIR).filter(f => f.endsWith('.json'));

	for (const file of files) {
		const compName = file.replace('.json', '');
		const filePath = path.join(STYLE_PROPERTIES_DIR, file);
		const props = extractThemeStyleProperties(filePath);
		if (props) {
			result[compName] = props;
		}
	}

	return result;
}

/**
 * Load theme style properties from dist/styleProperties/*.json and merge them
 * into the corresponding component catalog entries.
 */
function mergeThemeStyleProperties(components: Record<string, CatalogComponent>): void {
	console.log(`\nScanning theme style properties: ${STYLE_PROPERTIES_DIR}`);
	const themeStyleMap = loadAllThemeStyleProperties();
	let themeStyleCount = 0;

	for (const [compName, themeProps] of Object.entries(themeStyleMap)) {
		if (components[compName]) {
			components[compName].themeStyleProperties = themeProps;
			themeStyleCount++;
			const designCount = themeProps.designTypes.length;
			const subElCount = Object.keys(themeProps.themeStyles).length;
			console.log(`  + ${compName} (${designCount} design types, ${subElCount} sub-elements)`);
		} else {
			console.warn(`  ? ${compName}: style properties found but no matching component in catalog`);
		}
	}

	console.log(`  Merged theme styles for ${themeStyleCount} components`);
}

// ── Main ───────────────────────────────────────────────────────

function main() {
	console.log('Generating component catalog...');
	console.log(`Scanning: ${COMPONENTS_DIR}`);

	const components: Record<string, CatalogComponent> = {};
	const entries = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true });

	for (const entry of entries) {
		// Skip non-directories and excluded dirs
		if (!entry.isDirectory()) continue;
		if (SKIP_DIRS.has(entry.name)) continue;

		const dirPath = path.join(COMPONENTS_DIR, entry.name);

		// Special handling for TableComponents (nested sub-directories)
		if (entry.name === 'TableComponents') {
			const tableResults = processTableComponents(dirPath);
			for (const [name, comp] of tableResults) {
				components[name] = comp;
				console.log(`  ✓ ${name} (Table sub-component)`);
			}
			continue;
		}

		const result = processComponent(dirPath, entry.name);
		if (result) {
			const [name, comp] = result;
			components[name] = comp;
			console.log(`  ✓ ${name} (${comp.properties.length} props, ${comp.pseudoStates.length} pseudo-states)`);
		}
	}

	// Merge theme style properties from dist/styleProperties/*.json
	mergeThemeStyleProperties(components);

	const catalog: ComponentCatalog = {
		version: '1.0.0',
		generatedAt: new Date().toISOString(),
		componentCount: Object.keys(components).length,
		designTypeDescriptions: DESIGN_TYPE_DESCRIPTIONS,
		components,
	};

	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2));
	console.log(`\nCatalog written to: ${OUTPUT_PATH}`);
	console.log(`Total components: ${catalog.componentCount}`);
}

main();
