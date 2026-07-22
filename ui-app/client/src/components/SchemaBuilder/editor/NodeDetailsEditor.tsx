import { isNullValue } from '@fincity/kirun-js';
import React, { ReactNode } from 'react';
import { getEffectiveTypes } from './schemaUtils';
import ArraySection from './sections/ArraySection';
import CompositionSection from './sections/CompositionSection';
import GeneralSection from './sections/GeneralSection';
import NumberSection from './sections/NumberSection';
import ObjectSection from './sections/ObjectSection';
import StringSection from './sections/StringSection';
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
	const showConstraints =
		isNullValue(schema?.constant) && isNullValue(schema?.ref) && types.length > 0;

	const hasComposition = !!(
		schema?.anyOf?.length ||
		schema?.oneOf?.length ||
		schema?.allOf?.length ||
		schema?.not ||
		schema?.examples?.length
	);

	return (
		<div className="_detailsCard">
			<Section title="General" defaultOpen={true}>
				<GeneralSection
					schema={schema}
					path={path}
					types={types}
					showNameNamespace={kind === 'root' && showNameNamespace}
					ctx={ctx}
				/>
			</Section>
			{showConstraints && typeSet.has('STRING') && (
				<Section title="String Constraints" defaultOpen={true}>
					<StringSection schema={schema} path={path} ctx={ctx} />
				</Section>
			)}
			{showConstraints && NUMBER_TYPES.some(t => typeSet.has(t)) && (
				<Section title="Number Constraints" defaultOpen={true}>
					<NumberSection schema={schema} path={path} ctx={ctx} />
				</Section>
			)}
			{showConstraints && typeSet.has('OBJECT') && (
				<Section title="Object Constraints" defaultOpen={false}>
					<ObjectSection schema={schema} path={path} ctx={ctx} />
				</Section>
			)}
			{showConstraints && typeSet.has('ARRAY') && (
				<Section title="Array Constraints" defaultOpen={true}>
					<ArraySection schema={schema} path={path} ctx={ctx} />
				</Section>
			)}
			<Section title="Composition & Examples" defaultOpen={hasComposition}>
				<CompositionSection schema={schema} path={path} ctx={ctx} />
			</Section>
		</div>
	);
}

function Section({
	title,
	defaultOpen,
	children,
}: Readonly<{ title: string; defaultOpen: boolean; children: ReactNode }>) {
	return (
		<details className="_detailsSection" open={defaultOpen}>
			<summary>{title}</summary>
			<div className="_detailsGrid">{children}</div>
		</details>
	);
}
