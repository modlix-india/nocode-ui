import { deepEqual, duplicate, ExpressionEvaluator } from '@fincity/kirun-js';
import { useEffect, useState } from 'react';
import CommonCheckbox from '../../../commonComponents/CommonCheckbox';
import { getDataFromPath, PageStoreExtractor, setData } from '../../../context/StoreContext';
import { ComponentProps } from '../../../types/common';
import { processComponentStylePseudoClasses } from '../../../util/styleProcessor';
import Children from '../../Children';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import { getExtractionMap } from '../../util/getRenderData';
import { runEvent } from '../../util/runEvent';
import { updateLocationForChild } from '../../util/updateLoactionForChild';
import useDefinition from '../../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tableGridProperties';

export default function TableGridComponent(props: Readonly<ComponentProps>) {
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
			(multiSelect ? (selection ?? []) : [selection]).filter((e: any) =>
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
							renderableChildren={firstchild}
							context={context}
							locationHistory={[
								...locationHistory,
								updateLocationForChild(
									definition.key,
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
