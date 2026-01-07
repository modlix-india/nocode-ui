/**
 * SSR-Safe Component Renderers
 *
 * These are simplified server-side renderers that output static HTML.
 * The client will hydrate with the full interactive components from CDN.
 */

import React from 'react';
import type {
	ComponentDefinition,
	PageDefinition,
	ThemeDefinition,
	ApplicationDefinition,
	ComponentProperty,
} from '~/api/client';

export interface RenderContext {
	pageName: string;
	appCode: string;
	clientCode: string;
	theme?: ThemeDefinition;
	application?: ApplicationDefinition;
}

export interface SSRComponentProps {
	definition: ComponentDefinition;
	pageDefinition: PageDefinition;
	context: RenderContext;
	children?: React.ReactNode;
}

// Style property structure (loosely typed for flexibility)
interface StyleResolution {
	[cssKey: string]: ComponentProperty | undefined;
}

interface StyleObject {
	resolutions?: {
		ALL?: StyleResolution;
		[key: string]: StyleResolution | undefined;
	};
}

/**
 * Resolve a simple property value (ignores expressions for SSR)
 */
function resolveValue<T>(prop: ComponentProperty<T> | undefined, defaultValue: T): T {
	if (!prop) return defaultValue;
	if (prop.value !== undefined) return prop.value;
	// For SSR, we skip expression evaluation - client will handle it
	return defaultValue;
}

/**
 * Get property from definition with type safety
 */
function getProp<T>(props: Record<string, ComponentProperty> | undefined, key: string): ComponentProperty<T> | undefined {
	if (!props) return undefined;
	return props[key] as ComponentProperty<T> | undefined;
}

/**
 * Resolve theme color
 */
function resolveThemeColor(
	prop: ComponentProperty<string> | undefined,
	theme: ThemeDefinition | undefined
): string | undefined {
	if (!prop) return undefined;
	if (prop.value) return prop.value;

	// Handle Theme.colorName expressions
	if (prop.location?.expression?.startsWith('Theme.')) {
		const colorName = prop.location.expression.replace('Theme.', '');
		return theme?.ALL?.[colorName];
	}

	return undefined;
}

/**
 * Convert style properties to CSS object
 */
function resolveStyles(
	styleProperties: Record<string, unknown> | undefined,
	theme?: ThemeDefinition
): React.CSSProperties {
	if (!styleProperties) return {};

	const styles: React.CSSProperties = {};

	// Get ALL resolution styles (most common for SSR)
	for (const [, styleValue] of Object.entries(styleProperties)) {
		const styleObj = styleValue as StyleObject | undefined;
		const allStyles = styleObj?.resolutions?.ALL;
		if (!allStyles) continue;

		for (const [cssKey, cssValue] of Object.entries(allStyles)) {
			if (!cssValue) continue;

			const prop = cssValue as ComponentProperty<string>;

			// Handle theme expressions
			if (prop.location?.expression?.startsWith('Theme.')) {
				const themeValue = resolveThemeColor(prop, theme);
				if (themeValue) {
					(styles as Record<string, string>)[cssKey] = themeValue;
				}
			} else if (prop.value !== undefined) {
				(styles as Record<string, string>)[cssKey] = String(prop.value);
			}
		}
	}

	return styles;
}

/**
 * Grid Component - Primary layout container
 * Matches client Grid.tsx:374 className pattern
 */
export function SSRGrid({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);
	const layout = resolveValue(getProp<string>(definition.properties, 'layout'), 'SINGLECOLUMNLAYOUT');

	return (
		<div
			className={`comp compGrid _noAnchorGrid _${layout}`}
			id={definition.key}
			style={styles}
		>
			{children}
		</div>
	);
}

/**
 * Text Component - Renders text content
 * Matches client Text.tsx:172 className pattern
 */
export function SSRText({ definition, context }: SSRComponentProps) {
	const text = resolveValue(getProp<string>(definition.properties, 'text'), '');
	const styles = resolveStyles(definition.styleProperties, context.theme);
	const textType = resolveValue(getProp<string>(definition.properties, 'textType'), 'span');
	const textContainer = resolveValue(getProp<string>(definition.properties, 'textContainer'), '');

	// Map textType to HTML element
	const Tag = textType === 'h1' ? 'h1'
		: textType === 'h2' ? 'h2'
		: textType === 'h3' ? 'h3'
		: textType === 'h4' ? 'h4'
		: textType === 'h5' ? 'h5'
		: textType === 'h6' ? 'h6'
		: textType === 'p' ? 'p'
		: 'span';

	return (
		<Tag
			className={`comp compText ${textContainer}`}
			id={definition.key}
			style={styles}
		>
			{text}
		</Tag>
	);
}

/**
 * Image Component
 * Matches client Image.tsx className pattern
 */
export function SSRImage({ definition, context }: SSRComponentProps) {
	const src = resolveValue(getProp<string>(definition.properties, 'src'), '');
	const alt = resolveValue(getProp<string>(definition.properties, 'alt'), '');
	const styles = resolveStyles(definition.styleProperties, context.theme);

	if (!src) return null;

	return (
		<img
			className="comp compImage"
			id={definition.key}
			src={src}
			alt={alt}
			style={styles}
			loading="lazy"
		/>
	);
}

/**
 * Icon Component
 * Matches client Icon.tsx className pattern
 */
export function SSRIcon({ definition, context }: SSRComponentProps) {
	const icon = resolveValue(getProp<string>(definition.properties, 'icon'), '');
	const styles = resolveStyles(definition.styleProperties, context.theme);

	// Font Awesome style icons
	return (
		<i
			className={`comp compIcon ${icon}`}
			id={definition.key}
			style={styles}
		/>
	);
}

/**
 * Button Component
 * Matches client Button.tsx className pattern
 */
export function SSRButton({ definition, context, children }: SSRComponentProps) {
	const label = resolveValue(getProp<string>(definition.properties, 'label'), '');
	const styles = resolveStyles(definition.styleProperties, context.theme);
	const designType = resolveValue(getProp<string>(definition.properties, 'designType'), '');
	const colorScheme = resolveValue(getProp<string>(definition.properties, 'colorScheme'), '');

	return (
		<button
			className={`comp compButton ${designType} ${colorScheme}`}
			id={definition.key}
			style={styles}
			type="button"
		>
			{label || children}
		</button>
	);
}

/**
 * Link Component
 * Matches client Link.tsx className pattern
 */
export function SSRLink({ definition, context, children }: SSRComponentProps) {
	const href = resolveValue(getProp<string>(definition.properties, 'linkPath'), '#');
	const target = resolveValue(getProp<string>(definition.properties, 'target'), '_self');
	const styles = resolveStyles(definition.styleProperties, context.theme);

	return (
		<a
			className="comp compLink"
			id={definition.key}
			href={href}
			target={target as React.HTMLAttributeAnchorTarget}
			style={styles}
		>
			{children}
		</a>
	);
}

/**
 * TextBox Component - Renders as disabled input for SSR
 * Matches client TextBox.tsx className pattern
 */
export function SSRTextBox({ definition, context }: SSRComponentProps) {
	const placeholder = resolveValue(getProp<string>(definition.properties, 'placeholder'), '');
	const styles = resolveStyles(definition.styleProperties, context.theme);
	const designType = resolveValue(getProp<string>(definition.properties, 'designType'), '');
	const colorScheme = resolveValue(getProp<string>(definition.properties, 'colorScheme'), '');

	return (
		<div
			className={`comp compTextBox ${designType} ${colorScheme}`}
			id={definition.key}
			style={styles}
		>
			<input
				type="text"
				placeholder={placeholder}
				disabled
				readOnly
			/>
		</div>
	);
}

/**
 * Iframe Component
 * Matches client Iframe.tsx className pattern
 */
export function SSRIframe({ definition, context }: SSRComponentProps) {
	const src = resolveValue(getProp<string>(definition.properties, 'src'), '');
	const styles = resolveStyles(definition.styleProperties, context.theme);

	if (!src) return null;

	return (
		<iframe
			className="comp compIframe"
			id={definition.key}
			src={src}
			style={styles}
			loading="lazy"
		/>
	);
}

/**
 * ArrayRepeater - Renders placeholder for data-bound repeaters
 * Matches client ArrayRepeater.tsx className pattern
 */
export function SSRArrayRepeater({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);

	// For SSR, we render the template once as a placeholder
	// Client will hydrate with actual data
	return (
		<div
			className="comp compArrayRepeater"
			id={definition.key}
			style={styles}
		>
			{children}
		</div>
	);
}

/**
 * Tabs Component - Renders first tab content for SSR
 * Matches client Tabs.tsx:183 className pattern
 */
export function SSRTabs({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);
	const tabsOrientation = resolveValue(getProp<string>(definition.properties, 'tabsOrientation'), '');
	const designType = resolveValue(getProp<string>(definition.properties, 'designType'), '');
	const colorScheme = resolveValue(getProp<string>(definition.properties, 'colorScheme'), '');

	return (
		<div
			className={`comp compTabs ${tabsOrientation} ${designType} ${colorScheme}`}
			id={definition.key}
			style={styles}
		>
			{children}
		</div>
	);
}

/**
 * Placeholder for client-only components
 * Use the appropriate comp class so client can hydrate properly
 */
export function SSRClientOnly({ definition }: SSRComponentProps) {
	const componentType = definition.type;
	return (
		<div
			className={`comp comp${componentType}`}
			id={definition.key}
			data-ssr-placeholder="true"
		>
			{/* Loading placeholder - will be hydrated by client */}
		</div>
	);
}

/**
 * Generic fallback component
 * Uses comp comp{Type} pattern for consistency
 */
export function SSRGeneric({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);

	return (
		<div
			className={`comp comp${definition.type}`}
			id={definition.key}
			style={styles}
		>
			{children}
		</div>
	);
}

/**
 * SectionGrid Component - same as Grid but with different semantics
 */
export function SSRSectionGrid({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);
	const layout = resolveValue(getProp<string>(definition.properties, 'layout'), 'SINGLECOLUMNLAYOUT');

	return (
		<div
			className={`comp compSectionGrid _noAnchorGrid _${layout}`}
			id={definition.key}
			style={styles}
		>
			{children}
		</div>
	);
}

/**
 * Table Component - Main table wrapper
 * Matches client Table.tsx:1126 className pattern
 */
export function SSRTable({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);
	const tableDesign = resolveValue(getProp<string>(definition.properties, 'tableDesign'), '');
	const colorScheme = resolveValue(getProp<string>(definition.properties, 'colorScheme'), '');
	const tableLayout = resolveValue(getProp<string>(definition.properties, 'tableLayout'), '');

	return (
		<div
			className={`comp compTable ${tableDesign} ${colorScheme} ${tableLayout}`}
			id={definition.key}
			style={styles}
		>
			{children}
		</div>
	);
}

/**
 * TableColumns Component - Renders as HTML table
 * Matches client TableColumns.tsx:323-346 className pattern
 */
export function SSRTableColumns({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);
	const fixedHeader = resolveValue(getProp<boolean>(definition.properties, 'fixedHeader'), false);

	return (
		<table
			className={`comp compTableColumns ${fixedHeader ? '_fixedHeader' : ''}`}
			id={definition.key}
			style={styles}
		>
			<tbody className="_rowContainer">
				{children}
			</tbody>
		</table>
	);
}

/**
 * TableColumn Component - Table cell (td)
 * Matches client TableColumn.tsx className pattern
 */
export function SSRTableColumn({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);

	return (
		<td
			className="comp compTableColumn"
			id={definition.key}
			style={styles}
		>
			{children}
		</td>
	);
}

/**
 * TableColumnHeader Component - Table header cell (th equivalent rendered as div)
 * Matches client TableColumnHeader.tsx className pattern
 */
export function SSRTableColumnHeader({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);
	const label = resolveValue(getProp<string>(definition.properties, 'label'), '');

	return (
		<div
			className="comp compTableColumnHeader"
			id={definition.key}
			style={styles}
		>
			{label || children}
		</div>
	);
}

/**
 * TableGrid Component - Grid view of table
 * Matches client TableGrid.tsx className pattern
 */
export function SSRTableGrid({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);

	return (
		<div
			className="comp compTableGrid"
			id={definition.key}
			style={styles}
		>
			{children}
		</div>
	);
}

/**
 * TableEmptyGrid Component - Shown when table has no data
 */
export function SSRTableEmptyGrid({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);

	return (
		<div
			className="comp compTableEmptyGrid"
			id={definition.key}
			style={styles}
		>
			{children}
		</div>
	);
}

/**
 * TablePreviewGrid Component - Preview grid for selected row
 */
export function SSRTablePreviewGrid({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);

	return (
		<div
			className="comp compTablePreviewGrid"
			id={definition.key}
			style={styles}
		>
			{children}
		</div>
	);
}

/**
 * TableDynamicColumn Component - Dynamic column definition
 */
export function SSRTableDynamicColumn({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);

	return (
		<td
			className="comp compTableDynamicColumn"
			id={definition.key}
			style={styles}
		>
			{children}
		</td>
	);
}

/**
 * TableDynamicColumns Component - Dynamic columns container
 */
export function SSRTableDynamicColumns({ definition, context, children }: SSRComponentProps) {
	const styles = resolveStyles(definition.styleProperties, context.theme);

	return (
		<table
			className="comp compTableDynamicColumns"
			id={definition.key}
			style={styles}
		>
			<tbody className="_rowContainer">
				{children}
			</tbody>
		</table>
	);
}

/**
 * Component registry for SSR
 */
export const SSRComponents: Record<string, React.FC<SSRComponentProps>> = {
	// Layout
	Grid: SSRGrid,
	SectionGrid: SSRSectionGrid,

	// Content
	Text: SSRText,
	Image: SSRImage,
	Icon: SSRIcon,
	Link: SSRLink,
	Iframe: SSRIframe,

	// Interactive (rendered but disabled)
	Button: SSRButton,
	TextBox: SSRTextBox,

	// Data components
	ArrayRepeater: SSRArrayRepeater,
	Tabs: SSRTabs,

	// Table components - rendered as client-only since they require data bindings
	// The structure is too complex to render without the runtime data context
	Table: SSRClientOnly,
	TableColumns: SSRClientOnly,
	TableColumn: SSRClientOnly,
	TableColumnHeader: SSRClientOnly,
	TableGrid: SSRClientOnly,
	TableEmptyGrid: SSRClientOnly,
	TablePreviewGrid: SSRClientOnly,
	TableDynamicColumn: SSRClientOnly,
	TableDynamicColumns: SSRClientOnly,

	// Client-only components (placeholder)
	Chart: SSRClientOnly,
	FileUpload: SSRClientOnly,
	KIRunEditor: SSRClientOnly,
	TextEditor: SSRClientOnly,
	SchemaBuilder: SSRClientOnly,
	ThemeEditor: SSRClientOnly,
	FormEditor: SSRClientOnly,
	PageEditor: SSRClientOnly,
	FileSelector: SSRClientOnly,
	ColorPicker: SSRClientOnly,
	Calendar: SSRClientOnly,
	Video: SSRClientOnly,
	Audio: SSRClientOnly,
	MarkdownEditor: SSRClientOnly,
};

/**
 * Get SSR component by type
 */
export function getSSRComponent(type: string): React.FC<SSRComponentProps> {
	return SSRComponents[type] || SSRGeneric;
}
