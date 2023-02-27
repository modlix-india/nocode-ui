import React, { useEffect, useMemo, useState } from 'react';
import { getDataFromPath, PageStoreExtractor, setData } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tableColumnsProperties';
import TableColumnsStyle from './TableColumnsStyle';
import useDefinition from '../util/useDefinition';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { deepEqual, ExpressionEvaluator } from '@fincity/kirun-js';
import { getExtractionMap } from '../util/getRenderData';
import CommonCheckbox from '../../commonComponents/CommonCheckbox';

function TableColumnsComponent(props: ComponentProps) {
	const [value, setValue] = useState([]);
	const {
		definition: { children },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { showEmptyRows, showHeaders } = {}, stylePropertiesWithPseudoStates } =
		useDefinition(
			definition,
			propertiesDefinition,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
		);

	const newPageDef = useMemo(() => {
		const np = JSON.parse(JSON.stringify(pageDefinition));
		Object.keys(children ?? {})
			.map(k => np?.componentDefinition[k])
			.filter(e => e?.type === 'TableColumn')
			.forEach(cd => (cd.type = 'TableColumnHeader'));
		return np;
	}, [pageDefinition]);

	const colPageDef = useMemo(() => {
		if (!showEmptyRows) return pageDefinition;
		const np = JSON.parse(JSON.stringify(pageDefinition));
		Object.keys(children ?? {})
			.map(k => np?.componentDefinition[k])
			.filter(e => e?.type === 'TableColumn')
			.forEach(cd => (cd.children = {}));
		return np;
	}, [pageDefinition, showEmptyRows]);

	const {
		from = 0,
		to = 0,
		data,
		dataBindingPath,
		selectionBindingPath,
		selectionType,
		multiSelect,
		pageSize,
		uniqueKey,
	} = props.context.table ?? {};

	useEffect(() => setValue(props.context.table?.data), [props.context.table?.data]);

	const [hover, setHover] = useState(false);
	const [hoverRow, setHoverRow] = useState(-1);

	if (!Array.isArray(value)) return <></>;

	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	const styleNormalProperties =
		processComponentStylePseudoClasses({ hover: false }, stylePropertiesWithPseudoStates) ?? {};
	const styleHoverProperties =
		processComponentStylePseudoClasses({ hover: true }, stylePropertiesWithPseudoStates) ?? {};

	const total = to - from;

	let emptyCount = pageSize - total;
	if (emptyCount < 0 || !showEmptyRows) emptyCount = 0;

	const selection = getDataFromPath(selectionBindingPath, locationHistory, pageExtractor);

	const isSelected = (index: number): boolean => {
		if (selectionType === 'NONE' || !selectionBindingPath) return false;

		const selected =
			(multiSelect ? selection ?? [] : [selection]).filter((e: any) =>
				selectionType === 'OBJECT'
					? deepEqual(e, data[index])
					: e === `(${dataBindingPath})[${index}]`,
			).length !== 0;

		return selected;
	};

	const select = (index: number) => {
		if (selectionType === 'NONE' || !selectionBindingPath) return;

		const putObj =
			selectionType === 'OBJECT'
				? JSON.parse(JSON.stringify(data[index]))
				: `(${dataBindingPath})[${index}]`;

		if (multiSelect) {
			let x = selection ? [...selection] : [];
			if (isSelected(index)) {
				x = x.filter(e => !deepEqual(e, putObj));
			} else {
				x.push(putObj);
			}
			setData(selectionBindingPath, x, context.pageName);
		} else {
			setData(selectionBindingPath, putObj, context.pageName);
		}
	};

	const showCheckBox = multiSelect && selectionType !== 'NONE' && selectionBindingPath;

	const rows = value.map((e: any, index) => {
		if (index < from || index >= to) return undefined;

		const checkBox = showCheckBox ? (
			<div className="comp compTableColumn">
				<CommonCheckbox
					key="checkbox"
					isChecked={isSelected(index)}
					onChange={() => select(index)}
				/>
			</div>
		) : (
			<></>
		);

		const onClick = !multiSelect && selectionType !== 'NONE' ? () => select(index) : undefined;

		let key = undefined;

		if (uniqueKey) {
			let ev: ExpressionEvaluator = new ExpressionEvaluator(`Data.${uniqueKey}`);
			key = ev.evaluate(getExtractionMap(data?.[index]));
		}

		return (
			<div
				key={key}
				className={`_row _dataRow ${onClick ? '_pointer' : ''} ${
					isSelected(index) ? '_selected' : ''
				}`}
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHoverRow(index) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHoverRow(-1) : undefined
				}
				onClick={onClick}
				style={(hoverRow === index ? styleHoverProperties : styleNormalProperties).comp}
			>
				{checkBox}
				<Children
					pageDefinition={pageDefinition}
					children={children}
					context={context}
					locationHistory={[
						...locationHistory,
						updateLocationForChild(
							context.table?.bindingPath,
							index,
							locationHistory,
							context.pageName,
							pageExtractor,
						),
					]}
				/>
			</div>
		);
	});

	let headers = undefined;
	if (showHeaders) {
		let checkBoxTop = undefined;
		if (showCheckBox) {
			checkBoxTop = <div className="comp compTableHeaderColumn">&nbsp;</div>;
		}
		headers = (
			<div className="_row">
				{checkBoxTop}
				<Children
					pageDefinition={newPageDef}
					children={children}
					context={context}
					locationHistory={locationHistory}
				/>
			</div>
		);
	}

	const emptyRows = [];
	if (emptyCount) {
		for (let i = 0; i < emptyCount; i++) {
			emptyRows.push(
				<div key={`emptyRow_${i}`} className="_row">
					<Children
						pageDefinition={colPageDef}
						children={children}
						context={context}
						locationHistory={locationHistory}
					/>
				</div>,
			);
		}
	}

	return (
		<div
			className="comp compTableColumns"
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
			style={(hover ? styleHoverProperties : styleNormalProperties).comp}
		>
			<HelperComponent definition={definition} />
			{headers}
			{rows}
			{emptyRows}
		</div>
	);
}

const component: Component = {
	name: 'TableColumns',
	displayName: 'Table Columns',
	description: 'Table Columns component',
	component: TableColumnsComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TableColumnsStyle,
	hasChildren: true,
	allowedChildrenType: new Map([['TableColumn', -1]]),
	parentType: 'Table',
	stylePseudoStates: ['hover'],
};

export default component;
