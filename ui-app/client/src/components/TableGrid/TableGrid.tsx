import React, { useEffect, useState } from 'react';
import { getDataFromPath, PageStoreExtractor, setData } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tableGridProperties';
import TableGridStyle from './TableGridStyle';
import useDefinition from '../util/useDefinition';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { deepEqual, ExpressionEvaluator } from '@fincity/kirun-js';
import { getExtractionMap } from '../util/getRenderData';
import CommonCheckbox from '../../commonComponents/CommonCheckbox';
import { duplicate } from '@fincity/kirun-js';
import { runEvent } from '../util/runEvent';
import { styleDefaults } from './tableGridStyleProperties';
import { IconHelper } from '../util/IconHelper';

function TableGridComponent(props: ComponentProps) {
	const [value, setValue] = useState([]);
	const {
		definition: { children },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { layout, showEmptyGrids } = {}, stylePropertiesWithPseudoStates } =
		useDefinition(
			definition,
			propertiesDefinition,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
		);

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
		onSelect,
	} = props.context.table ?? {};

	useEffect(() => setValue(data), [data]);

	const [hover, setHover] = useState<number>(-1);

	if (!Array.isArray(value)) return <></>;

	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: false },
		stylePropertiesWithPseudoStates,
	);
	const styleHoverProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true },
		stylePropertiesWithPseudoStates,
	);

	const total = to - from;

	let emptyCount = pageSize - total;
	if (emptyCount < 0 || !showEmptyGrids) emptyCount = 0;

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
			selectionType === 'OBJECT' ? duplicate(data[index]) : `${dataBindingPath}[${index}]`;

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

		const selectEvent = onSelect ? props.pageDefinition.eventFunctions?.[onSelect] : undefined;

		if (!selectEvent) return;

		(async () =>
			await runEvent(
				selectEvent,
				uniqueKey,
				context.pageName,
				locationHistory,
				props.pageDefinition,
			))();
	};

	let emptyGrids = [];
	if (emptyCount) {
		for (let i = 0; i < emptyCount; i++) {
			emptyGrids.push(
				<div className="_eachTableGrid" style={styleProperties?.eachGrid}>
					&nbsp;
				</div>,
			);
		}
	}

	return (
		<div className={`comp compTableGrid _${layout}`} style={styleProperties.comp}>
			<HelperComponent context={props.context} definition={definition} />
			{value.map((e: any, index) => {
				if (index < from || index >= to) return undefined;

				const checkBox =
					multiSelect && selectionType !== 'NONE' && selectionBindingPath ? (
						<CommonCheckbox
							key="checkbox"
							isChecked={isSelected(index)}
							onChange={() => select(index)}
						/>
					) : (
						<></>
					);

				const onClick =
					!multiSelect && selectionType !== 'NONE' ? () => select(index) : undefined;

				let key = undefined;

				if (uniqueKey) {
					let ev: ExpressionEvaluator = new ExpressionEvaluator(`Data.${uniqueKey}`);
					key = ev.evaluate(getExtractionMap(data?.[index]));
				}

				return (
					<div
						key={key}
						className={`_eachTableGrid _dataGrid ${onClick ? '_pointer' : ''}  ${
							isSelected(index) ? '_selected' : ''
						}`}
						tabIndex={0}
						onClick={onClick}
						style={(hover !== index ? styleProperties : styleHoverProperties)?.eachGrid}
						onMouseEnter={
							stylePropertiesWithPseudoStates?.hover
								? () => setHover(index)
								: undefined
						}
						onMouseLeave={
							stylePropertiesWithPseudoStates?.hover ? () => setHover(-1) : undefined
						}
					>
						{checkBox}
						<Children
							pageDefinition={pageDefinition}
							children={firstchild}
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
			})}
			{emptyGrids}
		</div>
	);
}

const component: Component = {
	name: 'TableGrid',
	displayName: 'Table Grid',
	description: 'Table Grid component',
	component: TableGridComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: TableGridStyle,
	styleDefaults: styleDefaults,
	allowedChildrenType: new Map<string, number>([['', 1]]),
	parentType: 'Table',
	stylePseudoStates: ['hover'],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect x="1" y="9.7998" width="5.5" height="4.4" rx="0.2" fill="currentColor" />
					<path
						d="M1 17.5H6.5V23H1.8C1.35817 23 1 22.6418 1 22.2V17.5Z"
						fill="currentColor"
					/>
					<rect
						x="9.80078"
						y="9.7998"
						width="4.4"
						height="4.4"
						rx="0.2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="9.80078"
						y="17.5"
						width="4.4"
						height="5.5"
						rx="0.2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="17.5"
						y="9.7998"
						width="5.5"
						height="4.4"
						rx="0.2"
						fill="currentColor"
					/>
					<path
						d="M17.5 17.5H23V22.2C23 22.6418 22.6418 23 22.2 23H17.5V17.5Z"
						fill="currentColor"
					/>
					<path d="M1 6.5H6.5V1H1.8C1.35817 1 1 1.35817 1 1.8V6.5Z" fill="currentColor" />
					<rect
						width="4.4"
						height="5.5"
						rx="0.2"
						transform="matrix(1 0 0 -1 9.80078 6.5)"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M17.5 6.5H23V1.8C23 1.35817 22.6418 1 22.2 1H17.5V6.5Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'eachGrid',
			displayName: 'Each Grid',
			description: 'Each Grid',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
