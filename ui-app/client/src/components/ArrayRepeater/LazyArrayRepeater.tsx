import {
	deepEqual,
	duplicate,
	ExpressionEvaluator,
	isNullValue,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import React, { Fragment, useEffect } from 'react';
import { ParentExtractorForRunEvent } from '../../context/ParentExtractor';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	getPathFromLocation,
	localStoreExtractor,
	PageStoreExtractor,
	setData,
	storeExtractor,
	themeExtractor,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import {
	ComponentProps,
	DataLocation,
	LocationHistory,
	PageDefinition,
	RenderContext,
} from '../../types/common';
import { shortUUID } from '../../util/shortUUID';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { runEvent } from '../util/runEvent';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './arrayRepeaterProperties';
import { putDataInObject } from '../util/putDataInObject';

export default function ArrayRepeaterComponent(props: Readonly<ComponentProps>) {
	const {
		definition: { children, bindingPath, bindingPath2, key },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		properties: {
			isItemDraggable,
			showMove,
			showDelete,
			showAdd,
			readOnly,
			layout,
			addEvent,
			removeEvent,
			moveEvent,
			defaultData,
			addIcon,
			deleteIcon,
			moveUpIcon,
			moveDownIcon,
			dataType,
			dropDataPrefix,
			dropDataType,
			onDropData,
			filterCondition,
			orderKey,
			orderDirection,
			orderValue,
			missingValueOrder,
			newKeyStrategy,
			minimizeReRender,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const [repeaterData, setRepeaterData] = React.useState<any[]>([]);

	const clickMove = moveEvent ? props.pageDefinition.eventFunctions?.[moveEvent] : undefined;
	const clickRemove = removeEvent
		? props.pageDefinition.eventFunctions?.[removeEvent]
		: undefined;
	const clickAdd = addEvent ? props.pageDefinition.eventFunctions?.[addEvent] : undefined;

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: `Store.defaultData.${pageExtractor?.getPageName() ?? '_global'}.${flattenUUID(key)}`;

	const bindingPathPath2 = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;

	const indKeys = React.useRef<{
		array: Array<string>;
		oldKeys: Array<{ object: any; key: string }>;
	}>({ array: [], oldKeys: [] });

	let valuesMap: Map<string, TokenValueExtractor> | undefined = undefined;
	if (filterCondition || orderKey) {
		valuesMap = new Map<string, TokenValueExtractor>([
			[storeExtractor.getPrefix(), storeExtractor],
			[localStoreExtractor.getPrefix(), localStoreExtractor],
			[pageExtractor.getPrefix(), pageExtractor],
			[themeExtractor.getPrefix(), themeExtractor],
			[dvExtractor.getPrefix(), dvExtractor],
		]);
		if (locationHistory.length) {
			const pse = new ParentExtractorForRunEvent(locationHistory, valuesMap);
			valuesMap.set(pse.getPrefix(), pse);
			valuesMap.set(pse.getPrefix(), pse);
		}
	}

	useEffect(() => {
		if (!defaultData) return;

		setData(bindingPathPath!, defaultData, context?.pageName);
	}, [defaultData]);

	React.useEffect(() => {
		if (!bindingPathPath || !indKeys.current) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, _v) => {
				let repData: any[][] = [];
				if (dataType === 'object' && _v) {
					if (Array.isArray(_v)) repData = _v.map((e, i) => [i, e]);
					else repData = Object.entries(_v);
				} else if (Array.isArray(_v)) repData = _v.map((e, i) => [i, e]);

				processArrayValue(repData, setRepeaterData, indKeys.current, {
					valuesMap,
					orderKey,
					orderDirection,
					missingValueOrder,
					minimizeReRender,
				});
			},
			bindingPathPath,
		);
	}, [bindingPathPath, indKeys.current, orderKey, orderDirection, missingValueOrder]);

	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	const handleAdd = async (index: any) => {
		if (dataType === 'object' && (orderValue === 'value' || !orderKey) && newKeyStrategy)
			return;

		let newData = [...(repeaterData ?? [])];

		let newKey;
		if (newKeyStrategy == 'index') newKey = index + 1;
		else if (newKeyStrategy == 'shortUUID') newKey = shortUUID();

		if (orderKey && orderValue != 'value') {
			newData.splice(index + 1, 0, [
				newKey,
				orderKey == '__index' ? {} : { [orderKey]: newKey },
			]);
			newData = duplicate(newData);

			const add = orderValue == 'index' ? 0 : 1;
			const isAssending = orderDirection == 'asc';
			for (let i = 0; i < newData.length; i++) {
				if (orderKey === '__index') {
					newData[i][0] = (isAssending ? i : newData.length - i - 1) + add;
				} else {
					newData[i][1][orderKey] = (isAssending ? i : newData.length - i - 1) + add;
				}
			}
		} else {
			newData.splice(index + 1, 0, [undefined, undefined as unknown as never]);
		}
		setData(
			bindingPathPath!,
			dataType == 'object'
				? newData.reduce((acc: { [x: string]: any }, e: any[]) => {
						acc[e[0]] = e[1];
						return acc;
					}, {} as any)
				: newData.map((e: any[]) => e[1]),
			context?.pageName,
		);

		clickAdd &&
			(await runEvent(
				clickAdd,
				addEvent,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			));
	};

	const handleDelete = async (index: any) => {
		let newData: any;

		if (dataType === 'object') {
			newData = repeaterData
				.filter((_, i) => i !== index)
				.reduce((acc, e) => {
					acc[e[0]] = e[1];
					return acc;
				}, {} as any);
		} else {
			newData = repeaterData.filter((_, i) => i !== index).map(e => e[1]);
		}

		setData(bindingPathPath!, newData, context?.pageName);
		clickRemove &&
			(await runEvent(
				clickRemove,
				removeEvent,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			));
	};

	const handleMove = async (from: number, to: number) => {
		if (dataType === 'object' && !orderKey) return;

		const newData = duplicate(repeaterData);
		if (from >= newData?.length || from < 0 || to >= newData.length || to < 0) return;

		if (!orderKey) {
			const temp = newData[from];
			newData[from] = newData[to];
			newData[to] = temp;
		} else if (orderKey == '__index') {
			const tempIndex = newData[from][0];
			newData[from][0] = newData[to][0];
			newData[to][0] = tempIndex;
		} else {
			const tempKey = newData[from][1][orderKey];
			newData[from][1][orderKey] = newData[to][1][orderKey];
			newData[to][1][orderKey] = tempKey;
		}

		setData(
			bindingPathPath!,
			dataType == 'object'
				? newData.reduce((acc: { [x: string]: any }, e: any[]) => {
						acc[e[0]] = e[1];
						return acc;
					}, {} as any)
				: newData.map((e: any[]) => e[1]),
			context?.pageName,
		);

		clickMove &&
			(await runEvent(
				clickMove,
				moveEvent,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			));
	};

	const handleDragStart = async (e: any, index: any) => {
		e.stopPropagation();
		const prefix = locationHistory?.length
			? locationHistory.map(e => `${e.componentKey}_${e.index}`).join('_')
			: '';
		e.dataTransfer.setData('_array_repeater_drag', `${prefix}_${key}_${index}`);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

	const handleDrop = (e: React.DragEvent<HTMLDivElement>, to: number) => {
		e.preventDefault();

		if (dataType === 'object' && !orderKey) return;

		const fromData = e.dataTransfer.getData('_array_repeater_drag');

		if (!fromData) return;

		const lastIndex = fromData.lastIndexOf('_');

		const fromDataKey = fromData.substring(0, lastIndex);
		const prefix = locationHistory?.length
			? locationHistory.map(e => `${e.componentKey}_${e.index}`).join('_')
			: '';

		if (fromDataKey != `${prefix}_${key}`) return;

		const from = Number(fromData.substring(lastIndex + 1));
		if (from === to) return;

		const newData = duplicate(repeaterData);
		newData.splice(to, 0, newData.splice(from, 1)[0]);

		if (orderValue === 'value') {
			for (let i = 0; i < newData.length; i++) {
				if (orderKey === '__index') {
					newData[i][0] = repeaterData[i][0];
				} else if (orderKey) {
					dvExtractor.setData(repeaterData[i][1]);
					const value =
						new ExpressionEvaluator(`Data.${orderKey}`).evaluate(valuesMap!) ?? i;
					putDataInObject(newData[i][1], value, orderKey);
				}
			}
		} else if (orderKey) {
			const add = orderValue == 'index' ? 0 : 1;
			const isAssending = orderDirection == 'asc';
			for (let i = 0; i < newData.length; i++) {
				if (orderKey === '__index') {
					newData[i][0] = (isAssending ? i : newData.length - i - 1) + add;
				} else {
					const value = (isAssending ? i : newData.length - i - 1) + add;
					putDataInObject(newData[i][1], value, orderKey);
				}
			}
			if (!isAssending) newData.reverse();
		}

		setData(
			bindingPathPath!,
			dataType == 'object'
				? newData.reduce((acc: { [x: string]: any }, e: any[]) => {
						acc[e[0]] = e[1];
						return acc;
					}, {} as any)
				: newData.map((e: any[]) => e[1]),
			context?.pageName,
		);

		if (!clickMove) return;
		(async () => {
			await runEvent(
				clickMove,
				moveEvent,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			);
		})();
	};

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	let items = <></>;

	if (repeaterData.length) {
		let updatableBindingPath = bindingPath;
		if (!updatableBindingPath && defaultData) {
			updatableBindingPath = {
				type: 'VALUE',
				value: `Store.defaultData.${
					pageExtractor?.getPageName() ?? '_global'
				}.${flattenUUID(key)}`,
			};
		}

		items = (
			<>
				{repeaterData.map((_, index) =>
					createRepeaterItem({
						pageDefinition,
						firstchild,
						context,
						locationHistory,
						key,
						updatableBindingPath,
						dataType,
						indKeys,
						index,
						pageExtractor,
						showAdd,
						addIcon,
						handleAdd,
						styleProperties,
						props,
						showMove,
						repeaterData,
						moveUpIcon,
						moveDownIcon,
						handleMove,
						readOnly,
						handleDragStart,
						handleDragOver,
						handleDrop,
						handleDragEnter,
						handleDragLeave,
						isItemDraggable,
						showDelete,
						deleteIcon,
						handleDelete,
						filterCondition,
						valuesMap,
						orderKey,
						orderDirection,
						orderValue,
						newKeyStrategy,
					}),
				)}
			</>
		);
	} else if (!repeaterData.length && dataType !== 'object' && showAdd) {
		items = (
			<div className="iconGrid" style={styleProperties.iconGrid ?? {}}>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="iconGrid"
				></SubHelperComponent>
				<i
					className={`addOne ${addIcon || 'fa fa-solid fa-circle-plus'}`}
					onClick={() => handleAdd(0)}
					style={styleProperties.add ?? {}}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="add"
					></SubHelperComponent>
				</i>
			</div>
		);
	}

	const hasDrop = onDropData || bindingPathPath2;

	return (
		<div
			className={`comp compArrayRepeater _${layout}`}
			style={styleProperties.comp}
			role="none"
			onDragOver={hasDrop ? e => e.preventDefault() : undefined}
			onDrop={
				hasDrop
					? e => {
							e.preventDefault();
							let data = e.dataTransfer.getData(dropDataType);
							if (dropDataPrefix) {
								if (!data.startsWith(dropDataPrefix)) return;
								data = data.substring(dropDataPrefix.length);
							}
							if (dropDataType === 'application/json') data = JSON.parse(data);
							if (bindingPathPath2) setData(bindingPathPath2, data, context.pageName);
							if (!onDropData || !pageDefinition.eventFunctions[onDropData]) return;
							(async () =>
								await runEvent(
									pageDefinition.eventFunctions[onDropData],
									onDropData,
									props.context.pageName,
									props.locationHistory,
									props.pageDefinition,
								))();
						}
					: undefined
			}
		>
			<HelperComponent context={props.context} definition={definition} />
			{items}
		</div>
	);
}

class DataValueExtractor extends TokenValueExtractor {
	private data: any;

	public setData(newData: any): void {
		this.data = newData;
	}

	public getPrefix(): string {
		return 'Data.';
	}

	protected getValueInternal(token: string): any {
		if (token === 'Data') return this.data;

		return this.retrieveElementFrom(
			token,
			token.split(TokenValueExtractor.REGEX_DOT),
			1,
			this.data,
		);
	}

	public getStore(): any {
		return this.data;
	}
}

const dvExtractor = new DataValueExtractor();

function createRepeaterItem({
	pageDefinition,
	firstchild,
	context,
	locationHistory,
	key,
	updatableBindingPath,
	dataType,
	indKeys,
	index,
	pageExtractor,
	showAdd,
	addIcon,
	handleAdd,
	styleProperties,
	props,
	showMove,
	repeaterData,
	moveUpIcon,
	moveDownIcon,
	handleMove,
	readOnly,
	handleDragStart,
	handleDragOver,
	handleDrop,
	handleDragEnter,
	handleDragLeave,
	isItemDraggable,
	showDelete,
	deleteIcon,
	handleDelete,
	filterCondition,
	valuesMap,
	orderKey,
	orderValue,
	newKeyStrategy,
}: {
	pageDefinition: PageDefinition;
	firstchild: any;
	context: RenderContext;
	locationHistory: LocationHistory[];
	key: string;
	updatableBindingPath: DataLocation | undefined;
	dataType: any;
	indKeys: React.MutableRefObject<{
		array: Array<string>;
		oldKeys: Array<{ object: any; key: string }>;
	}>;
	index: number;
	pageExtractor: PageStoreExtractor;
	showAdd: any;
	addIcon: any;
	handleAdd: (index: any) => Promise<void>;
	styleProperties: any;
	props: Readonly<ComponentProps>;
	showMove: any;
	repeaterData: any[][];
	moveUpIcon: any;
	moveDownIcon: any;
	handleMove: (from: number, to: number) => Promise<void>;
	readOnly: any;
	handleDragStart: (e: any, index: any) => Promise<void>;
	handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDrop: (e: React.DragEvent<HTMLDivElement>, to: number) => void;
	handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
	isItemDraggable: any;
	showDelete: any;
	deleteIcon: any;
	handleDelete: (index: any) => Promise<void>;
	filterCondition: string | undefined;
	valuesMap: Map<string, TokenValueExtractor> | undefined;
	orderKey: string;
	orderDirection: string;
	orderValue: string;
	newKeyStrategy: string;
}) {
	if (valuesMap && filterCondition) {
		dvExtractor.setData(repeaterData[index][1]);
		const ev = new ExpressionEvaluator(filterCondition);
		const value = ev.evaluate(valuesMap);

		if (!value)
			return (
				<Fragment
					key={
						indKeys.current.array[index]
							? undefined
							: `fragment_${indKeys.current.array[index]}`
					}
				/>
			);
	}

	const canDragToReSort = dataType !== 'object' || orderKey;

	const comp = (
		<Children
			pageDefinition={pageDefinition}
			renderableChildren={firstchild}
			context={context}
			locationHistory={[
				...locationHistory,
				updateLocationForChild(
					key,
					updatableBindingPath!,
					repeaterData[index][0],
					locationHistory,
					context.pageName,
					pageExtractor,
				),
			]}
		/>
	);
	let addButton;
	if (
		showAdd &&
		(dataType !== 'object' || (orderValue != 'value' && orderKey && newKeyStrategy))
	) {
		addButton = (
			<i
				tabIndex={0}
				className={`addOne ${addIcon ?? 'fa fa-circle-plus fa-solid'}`}
				onClick={showAdd ? () => handleAdd(index) : undefined}
				style={styleProperties.add ?? {}}
				onKeyDown={e => (e.key === 'Enter' || e.key == ' ' ? handleAdd(index) : undefined)}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="add"
				></SubHelperComponent>
			</i>
		);
	}
	let firstMoveButton;
	let secondMoveButton;
	if (showMove && canDragToReSort) {
		firstMoveButton = (
			<i
				tabIndex={0}
				className={`moveOne ${
					index == repeaterData?.length - 1
						? (moveUpIcon ?? 'fa fa-circle-arrow-up fa-solid')
						: (moveDownIcon ?? 'fa fa-circle-arrow-down fa-solid')
				}`}
				style={styleProperties.move ?? {}}
				onClick={
					showMove
						? () =>
								handleMove(
									index,
									index == repeaterData?.length - 1 ? index - 1 : index + 1,
								)
						: undefined
				}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="move"
				></SubHelperComponent>
			</i>
		);

		secondMoveButton = (
			<i
				tabIndex={0}
				className={`moveOne ${
					index == 0 || index == repeaterData?.length - 1
						? ''
						: (moveUpIcon ?? 'fa fa-circle-arrow-up fa-solid')
				}`}
				onClick={showMove ? () => handleMove(index, index - 1) : undefined}
				style={styleProperties.move ?? {}}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="move"
				></SubHelperComponent>
			</i>
		);
	}

	return (
		<div
			tabIndex={0}
			role="button"
			key={indKeys.current.array[index] ? undefined : `div_${indKeys.current.array[index]}`}
			data-key={`${indKeys.current.array[index]}`}
			className={`repeaterProperties ${readOnly ? 'disabled' : ''}`}
			onDragStart={canDragToReSort ? e => handleDragStart(e, index) : undefined}
			onDragOver={canDragToReSort ? handleDragOver : undefined}
			onDrop={canDragToReSort ? e => handleDrop(e, index) : undefined}
			onDragEnter={canDragToReSort ? handleDragEnter : undefined}
			onDragLeave={canDragToReSort ? handleDragLeave : undefined}
			draggable={canDragToReSort && isItemDraggable && !readOnly}
			style={styleProperties.repeaterProperties ?? {}}
			onKeyDown={() => {}}
		>
			<SubHelperComponent
				definition={props.definition}
				subComponentName="repeaterProperties"
			></SubHelperComponent>
			<div className="repeatedComp comp" style={styleProperties.repeatedComp ?? {}}>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="repeatedComp"
				></SubHelperComponent>
				{comp}
			</div>

			<div className="iconGrid" style={styleProperties.iconGrid ?? {}}>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="iconGrid"
				></SubHelperComponent>

				{addButton}
				{showDelete && (
					<i
						tabIndex={0}
						className={`reduceOne ${deleteIcon ?? 'fa fa-circle-minus fa-solid'}`}
						onClick={showDelete ? () => handleDelete(index) : undefined}
						style={styleProperties.remove ?? {}}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="remove"
						></SubHelperComponent>
					</i>
				)}
				{firstMoveButton}
				{secondMoveButton}
			</div>
		</div>
	);
}

function processArrayValue(
	repData: any[][],
	setRepeaterData: (v: any[]) => void,
	indKeysCurrent: { array: Array<string>; oldKeys: Array<{ object: any; key: string }> },
	{
		valuesMap,
		orderKey,
		orderDirection,
		missingValueOrder,
		minimizeReRender,
	}: {
		valuesMap: Map<string, TokenValueExtractor> | undefined;
		orderKey: string;
		orderDirection: string;
		missingValueOrder: string;
		minimizeReRender: boolean;
	},
) {
	if (!repData.length) {
		setRepeaterData([]);
		return;
	}

	if (orderKey && valuesMap) {
		repData = repData
			.map(e => {
				if (orderKey === '__index') return [e[0], e];
				dvExtractor.setData(e[1]);
				const ev = new ExpressionEvaluator(`Data.${orderKey}`);
				const value = ev.evaluate(valuesMap);
				return [value, e];
			})
			.sort((a, b) => {
				const aValue = a[0];
				const bValue = b[0];
				if (aValue === undefined || bValue === undefined)
					return missingValueOrder === 'last' ? 1 : -1;
				if (typeof aValue === 'number' && typeof bValue === 'number') {
					return orderDirection === 'asc' ? aValue - bValue : bValue - aValue;
				} else if (typeof aValue === 'string' || typeof bValue === 'string') {
					return orderDirection === 'asc'
						? aValue.localeCompare(bValue)
						: bValue.localeCompare(aValue);
				}
				return 0;
			})
			.map(e => e[1]);
	}

	setRepeaterData(repData);

	if (minimizeReRender) return;

	const duplicateCheck = new Array<{ object: any; occurance: number }>();
	for (let i = 0; i < repData.length; i++) {
		let oldIndex = -1;

		let duplicateObject = duplicateCheck.find(e => deepEqual(e.object, repData[i][1]));

		if (!duplicateObject) {
			duplicateObject = { object: repData[i][1], occurance: 1 };
			duplicateCheck.push(duplicateObject);
		} else {
			duplicateObject.occurance++;
		}

		let occurance = duplicateObject.occurance;
		let count = -1;
		for (let oldIndexObject of indKeysCurrent.oldKeys) {
			count++;
			if (!deepEqual(oldIndexObject.object, repData[i][1])) continue;
			occurance--;
			if (occurance !== 0) continue;
			oldIndex = count;
			break;
		}

		if (oldIndex === -1) {
			indKeysCurrent.array[i] = shortUUID();
			if (repData[i][1] !== undefined && repData[i][1] !== null)
				indKeysCurrent.oldKeys.push({
					object: duplicate(repData[i][1]),
					key: indKeysCurrent.array[i],
				});
		} else {
			indKeysCurrent.array[i] = indKeysCurrent.oldKeys[oldIndex].key;
		}
	}
}
