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
} from '../../context/StoreContext';
import {
	Component,
	ComponentPropertyDefinition,
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
import { IconHelper } from '../util/IconHelper';
import { runEvent } from '../util/runEvent';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './arrayRepeaterProperties';
import ArrayRepeaterStyle from './ArrayRepeaterStyle';
import { styleDefaults } from './arrayRepeaterStyleProperties';

function ArrayRepeaterComponent(props: Readonly<ComponentProps>) {
	const {
		definition: { children, bindingPath, bindingPath2, key },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);

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
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [arrayValue, setArrayValue] = React.useState<any[]>([]);
	const [objectValue, setObjectValue] = React.useState<any>(undefined);

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

	useEffect(() => {
		if (!defaultData) return;

		setData(bindingPathPath!, defaultData, context?.pageName);
	}, [defaultData]);

	React.useEffect(() => {
		if (!bindingPathPath || !indKeys.current) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, _v) => {
				if (dataType === 'object')
					processObjectValue(_v, setArrayValue, setObjectValue, indKeys.current);
				else processArrayValue(_v, setArrayValue, setObjectValue, indKeys.current);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, indKeys.current]);

	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	const handleAdd = async (index: any) => {
		const newData = [...(arrayValue ?? [])];
		newData.splice(index + 1, 0, undefined as unknown as never);
		setData(bindingPathPath!, newData, context?.pageName);

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
			newData = { ...objectValue };
			delete newData[index];
		} else {
			newData = arrayValue.slice();
			newData.splice(index, 1);
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
		if (dataType === 'object') return;

		const newData = arrayValue.slice();
		if (from >= newData?.length || from < 0 || to >= newData.length || to < 0) return;
		const temp = newData[from];
		newData[from] = newData[to];
		newData[to] = temp;
		setData(bindingPathPath!, newData, context?.pageName);

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

		if (dataType === 'object') return;

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

		const newData = arrayValue.slice();
		newData.splice(to, 0, newData.splice(from, 1)[0]);
		setData(bindingPathPath!, newData, context?.pageName);

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

	if (Array.isArray(arrayValue) && arrayValue.length) {
		let updatableBindingPath = bindingPath;
		if (!updatableBindingPath && defaultData) {
			updatableBindingPath = {
				type: 'VALUE',
				value: `Store.defaultData.${
					pageExtractor?.getPageName() ?? '_global'
				}.${flattenUUID(key)}`,
			};
		}
		let valuesMap: Map<string, TokenValueExtractor> | undefined = undefined;
		if (filterCondition) {
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
		items = (
			<>
				{arrayValue.map((e: any, index) =>
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
						arrayValue,
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
					}),
				)}
			</>
		);
	} else if (!arrayValue?.length && dataType !== 'object' && showAdd) {
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
	arrayValue,
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
	arrayValue: any[];
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
}) {
	if (valuesMap && filterCondition) {
		dvExtractor.setData(arrayValue[index]);
		const ev = new ExpressionEvaluator(filterCondition);
		const value = ev.evaluate(valuesMap);

		if (!value) return <Fragment key={`fragment_${indKeys.current.array[index]}`} />;
	}
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
					dataType === 'object' ? indKeys.current.array[index] : index,
					locationHistory,
					context.pageName,
					pageExtractor,
				),
			]}
		/>
	);
	let addButton;
	if (showAdd && dataType !== 'object') {
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
	if (showMove && dataType !== 'object') {
		firstMoveButton = (
			<i
				tabIndex={0}
				className={`moveOne ${
					index == arrayValue?.length - 1
						? (moveUpIcon ?? 'fa fa-circle-arrow-up fa-solid')
						: (moveDownIcon ?? 'fa fa-circle-arrow-down fa-solid')
				}`}
				style={styleProperties.move ?? {}}
				onClick={
					showMove
						? () =>
								handleMove(
									index,
									index == arrayValue?.length - 1 ? index - 1 : index + 1,
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
					index == 0 || index == arrayValue?.length - 1
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
			key={`div_${indKeys.current.array[index]}`}
			data-key={`${indKeys.current.array[index]}`}
			className={`repeaterProperties ${readOnly ? 'disabled' : ''}`}
			onDragStart={dataType === 'object' ? undefined : e => handleDragStart(e, index)}
			onDragOver={dataType === 'object' ? undefined : handleDragOver}
			onDrop={dataType === 'object' ? undefined : e => handleDrop(e, index)}
			onDragEnter={dataType === 'object' ? undefined : handleDragEnter}
			onDragLeave={dataType === 'object' ? undefined : handleDragLeave}
			draggable={dataType !== 'object' && isItemDraggable && !readOnly}
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

function processObjectValue(
	_v: any | undefined,
	setArrayValue: (v: any[]) => void,
	setObjectValue: (v: any) => void,
	indKeysCurrent: { array: Array<string>; oldKeys: Array<{ object: any; key: string }> },
) {
	if (isNullValue(_v)) {
		setArrayValue([]);
		setObjectValue(undefined);
		return;
	}

	const entries = Object.entries(_v);
	const keys = entries.map(([k, v]) => k);
	const values = entries.map(([k, v]) => v);

	setArrayValue(values);
	setObjectValue(_v);
	indKeysCurrent.array = keys;
}

function processArrayValue(
	_v: any[] | undefined,
	setArrayValue: (v: any[]) => void,
	setObjectValue: (v: any) => void,
	indKeysCurrent: { array: Array<string>; oldKeys: Array<{ object: any; key: string }> },
) {
	setArrayValue(_v ?? []);
	setObjectValue(undefined);
	if (!_v?.length) return;

	const duplicateCheck = new Array<{ object: any; occurance: number }>();
	for (let i = 0; i < _v.length; i++) {
		let oldIndex = -1;

		let duplicateObject = duplicateCheck.find(e => deepEqual(e.object, _v[i]));

		if (!duplicateObject) {
			duplicateObject = { object: _v[i], occurance: 1 };
			duplicateCheck.push(duplicateObject);
		} else {
			duplicateObject.occurance++;
		}

		let occurance = duplicateObject.occurance;
		let count = -1;
		for (let oldIndexObject of indKeysCurrent.oldKeys) {
			count++;
			if (!deepEqual(oldIndexObject.object, _v[i])) continue;
			occurance--;
			if (occurance !== 0) continue;
			oldIndex = count;
			break;
		}

		if (oldIndex === -1) {
			indKeysCurrent.array[i] = shortUUID();
			if (_v[i] !== undefined && _v[i] !== null)
				indKeysCurrent.oldKeys.push({
					object: duplicate(_v[i]),
					key: indKeysCurrent.array[i],
				});
		} else {
			indKeysCurrent.array[i] = indKeysCurrent.oldKeys[oldIndex].key;
		}
	}
}

const component: Component = {
	order: 6,
	name: 'ArrayRepeater',
	displayName: 'Repeater',
	description: 'Array Repeater component',
	component: ArrayRepeaterComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: ArrayRepeaterStyle,
	styleDefaults: styleDefaults,
	allowedChildrenType: new Map<string, number>([['', 1]]),
	bindingPaths: {
		bindingPath: { name: 'Array/Object Binding' },
		bindingPath2: { name: 'Dropped Data Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'Repeator',
		type: 'ArrayRepeater',
		properties: {},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper id="_arrayRepeaterIcon" viewBox="0 0 30 30">
					<rect id="_rect1" width="13" height="13" rx="1" fill="#3aad6c" />
					<rect id="_rect5" y="15" width="13" height="13" rx="1" fill="#008FDD" />
					<rect id="_rect3" x="15" width="13" height="13" rx="1" fill="#3aad6c" />
					<rect id="_rect7" x="15" y="15" width="13" height="13" rx="1" fill="#008FDD" />
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'repeaterProperties',
			displayName: 'Repeater Properties',
			description: 'Repeater Properties',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'repeatedComp',
			displayName: 'Repeated Component',
			description: 'Repeated Component',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'iconGrid',
			displayName: 'Icon Grid',
			description: 'Icon Grid',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'add',
			displayName: 'Add',
			description: 'Add',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'remove',
			displayName: 'Remove',
			description: 'Remove',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'move',
			displayName: 'Move',
			description: 'Move',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
