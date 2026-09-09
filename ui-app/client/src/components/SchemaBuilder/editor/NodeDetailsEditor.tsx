import React, { ReactNode, useState } from 'react';
import { getEffectiveTypes } from './schemaUtils';
import ArraySection from './sections/ArraySection';
import CompositionSection from './sections/CompositionSection';
import GeneralSection from './sections/GeneralSection';
import NumberSection from './sections/NumberSection';
import ObjectSection from './sections/ObjectSection';
import StringSection from './sections/StringSection';
import {
	hasAny,
	InertFinding,
	inertGroups,
	KeywordGroup,
	schemaWarnings,
	SECTION_KEYWORDS,
} from './precedence';
import { TreeContext, TreeNodeKind } from './types';

const NUMBER_TYPES = ['INTEGER', 'LONG', 'FLOAT', 'DOUBLE'];

export default function NodeDetailsEditor({
	schema,
	path,
	kind,
	lockedType,
	showNameNamespace,
	ctx,
}: Readonly<{
	schema: any;
	path: string;
	kind: TreeNodeKind;
	lockedType?: string;
	showNameNamespace?: boolean;
	ctx: TreeContext;
}>) {
	const types = lockedType ? [lockedType] : getEffectiveTypes(schema);
	const typeSet = new Set(types);

	// Nothing is hidden any more. A section shows because the type calls for it OR because the
	// schema already carries one of its keywords, so a value can always be seen and cleared.
	// What the runtime will not reach is marked instead, with the reason.
	const inert = inertGroups(schema);
	const warnings = schemaWarnings(schema);

	const show = (group: KeywordGroup, typeApplies: boolean) =>
		typeApplies || hasAny(schema, SECTION_KEYWORDS[group]);

	const showString = show('string', typeSet.has('STRING'));
	const showNumber = show(
		'number',
		NUMBER_TYPES.some(t => typeSet.has(t)),
	);
	const showObject = show('object', typeSet.has('OBJECT'));
	const showArray = show('array', typeSet.has('ARRAY'));

	const strayTag = (typeApplies: boolean, typeName: string) =>
		typeApplies ? undefined : `no ${typeName} type, not evaluated`;

	const overrideNote = inert.values().next().value as InertFinding | undefined;

	return (
		<div className="_detailsCard">
			{overrideNote ? (
				<div className="_cardNote _inert">{overrideNote.reason}</div>
			) : undefined}
			{warnings.map(w => (
				<div key={w.keyword} className="_cardNote _warning">
					{w.message}
				</div>
			))}
			<Section title="General" defaultOpen={true}>
				<GeneralSection
					schema={schema}
					path={path}
					types={types}
					showNameNamespace={kind === 'root' && showNameNamespace}
					ctx={ctx}
				/>
			</Section>
			{showString && (
				<Section
					title="String Constraints"
					defaultOpen={true}
					inert={inert.get('string')}
					tag={strayTag(typeSet.has('STRING'), 'string')}
				>
					<StringSection schema={schema} path={path} ctx={ctx} />
				</Section>
			)}
			{showNumber && (
				<Section
					title="Number Constraints"
					defaultOpen={true}
					inert={inert.get('number')}
					tag={strayTag(
						NUMBER_TYPES.some(t => typeSet.has(t)),
						'number',
					)}
				>
					<NumberSection schema={schema} path={path} ctx={ctx} />
				</Section>
			)}
			{showObject && (
				<Section
					title="Object Constraints"
					// Was hard-coded closed, so an existing minProperties or patternProperties
					// cost a second click to even discover.
					defaultOpen={hasAny(schema, SECTION_KEYWORDS.object)}
					inert={inert.get('object')}
					tag={strayTag(typeSet.has('OBJECT'), 'object')}
				>
					<ObjectSection schema={schema} path={path} ctx={ctx} />
				</Section>
			)}
			{showArray && (
				<Section
					title="Array Constraints"
					defaultOpen={true}
					inert={inert.get('array')}
					tag={strayTag(typeSet.has('ARRAY'), 'array')}
				>
					<ArraySection schema={schema} path={path} ctx={ctx} />
				</Section>
			)}
			<Section
				title="Composition & Examples"
				defaultOpen={hasAny(schema, [
					...SECTION_KEYWORDS.composition,
					...SECTION_KEYWORDS.examples,
				])}
				inert={inert.get('composition')}
			>
				<CompositionSection schema={schema} path={path} ctx={ctx} />
			</Section>
		</div>
	);
}

function Section({
	title,
	defaultOpen,
	inert,
	tag,
	children,
}: Readonly<{
	title: string;
	defaultOpen: boolean;
	inert?: InertFinding;
	tag?: string;
	children: ReactNode;
}>) {
	// Seeded once per mount, then owned by the user. A `defaultOpen` derived from the data and
	// passed straight to <details open> would yank a section open the moment the first character
	// of a constraint is typed into it.
	const [open, setOpen] = useState(() => defaultOpen);
	const note = inert?.reason ?? tag;

	return (
		<details
			className={`_detailsSection ${inert ? '_inert' : ''}`}
			open={open}
			onToggle={e => setOpen((e.currentTarget as HTMLDetailsElement).open)}
		>
			<summary>
				{title}
				{note ? (
					<span className="_inertTag" title={note}>
						{inert ? 'not evaluated' : tag}
					</span>
				) : undefined}
			</summary>
			<div className="_detailsGrid">{children}</div>
		</details>
	);
}
