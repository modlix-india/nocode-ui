import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { shortUUID } from '../../util/shortUUID';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './arrayRepeaterProperties';
import ArrayRepeaterStyle from './ArrayRepeaterStyle';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { runEvent } from '../util/runEvent';
import { styleDefaults } from './arrayRepeaterStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { deepEqual } from '@fincity/kirun-js';
import { flattenUUID } from '../util/uuid';

function ArrayRepeaterComponent(props: Readonly<ComponentProps>) {
	const {
		definition: { children, bindingPath, key },
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
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [value, setValue] = React.useState<any[]>([]);

	const clickMove = moveEvent ? props.pageDefinition.eventFunctions?.[moveEvent] : undefined;
	const clickRemove = removeEvent
		? props.pageDefinition.eventFunctions?.[removeEvent]
		: undefined;
	const clickAdd = addEvent ? props.pageDefinition.eventFunctions?.[addEvent] : undefined;

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: `Store.defaultData.${pageExtractor?.getPageName() ?? '_global'}.${flattenUUID(key)}`;

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
				setValue(_v ?? []);
				if (!_v?.length) return;

				const duplicateCheck = new Array<{ object: any; occurance: number }>();
				for (let i = 0; i < _v.length; i++) {
					let oldIndex = -1;

					let duplicate = duplicateCheck.find(e => deepEqual(e.object, _v[i]));

					if (!duplicate) {
						duplicate = { object: _v[i], occurance: 1 };
						duplicateCheck.push(duplicate);
					} else {
						duplicate.occurance++;
					}

					let occurance = duplicate.occurance;
					let count = -1;
					for (let oldIndexObject of indKeys.current.oldKeys) {
						count++;
						if (!deepEqual(oldIndexObject.object, _v[i])) continue;
						occurance--;
						if (occurance !== 0) continue;
						oldIndex = count;
						break;
					}

					if (oldIndex === -1) {
						indKeys.current.array[i] = shortUUID();
						if (_v[i] !== undefined && _v[i] !== null)
							indKeys.current.oldKeys.push({
								object: _v[i],
								key: indKeys.current.array[i],
							});
					} else {
						indKeys.current.array[i] = indKeys.current.oldKeys[oldIndex].key;
					}
				}
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, indKeys.current]);

	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	const handleAdd = async (index: any) => {
		const newData = [...(value ?? [])];
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
		const newData = value.slice();
		newData.splice(index, 1);
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
		const newData = value.slice();
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
		e.dataTransfer.setData('_array_repeater_drag', `${key}_${index}`);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

	const handleDrop = (e: React.DragEvent<HTMLDivElement>, to: number) => {
		e.preventDefault();
		const fromData = e.dataTransfer.getData('_array_repeater_drag');
		if (!fromData?.startsWith(`${key}_`)) return;

		const from = Number(fromData.split('_')[1]);
		if (from === to) return;

		const newData = value.slice();
		newData.splice(to, 0, newData.splice(from, 1)[0]);
		setData(bindingPathPath!, newData, context?.pageName);
	};

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	let items = <></>;

	if (Array.isArray(value) && value.length) {
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
				{value.map((e: any, index) => {
					const comp = (
						<Children
							pageDefinition={pageDefinition}
							children={firstchild}
							context={context}
							locationHistory={[
								...locationHistory,
								updateLocationForChild(
									updatableBindingPath!,
									index,
									locationHistory,
									context.pageName,
									pageExtractor,
								),
							]}
						/>
					);
					return (
						<div
							tabIndex={0}
							role="button"
							key={`${indKeys.current.array[index]}`}
							data-key={`${indKeys.current.array[index]}`}
							className={`repeaterProperties ${readOnly ? 'disabled' : ''}`}
							onDragStart={e => handleDragStart(e, index)}
							onDragOver={handleDragOver}
							onDrop={e => handleDrop(e, index)}
							onDragEnter={handleDragEnter}
							onDragLeave={handleDragLeave}
							draggable={isItemDraggable && !readOnly}
							style={styleProperties.repeaterProperties ?? {}}
							onKeyDown={() => {}}
						>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="repeaterProperties"
							></SubHelperComponent>
							<div
								className="repeatedComp comp"
								style={styleProperties.repeatedComp ?? {}}
							>
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
								{showAdd && (
									<i
										tabIndex={0}
										className="addOne fa fa-circle-plus fa-solid"
										onClick={showAdd ? () => handleAdd(index) : undefined}
										style={styleProperties.add ?? {}}
										onKeyDown={e =>
											e.key === 'Enter' || e.key == ' '
												? handleAdd(index)
												: undefined
										}
									>
										<SubHelperComponent
											definition={props.definition}
											subComponentName="add"
										></SubHelperComponent>
									</i>
								)}
								{showDelete && (
									<i
										tabIndex={0}
										className="reduceOne fa fa-circle-minus fa-solid"
										onClick={showDelete ? () => handleDelete(index) : undefined}
										style={styleProperties.remove ?? {}}
									>
										<SubHelperComponent
											definition={props.definition}
											subComponentName="remove"
										></SubHelperComponent>
									</i>
								)}
								{showMove && (
									<i
										tabIndex={0}
										className={`moveOne ${
											index == value?.length - 1
												? 'fa fa-circle-arrow-up fa-solid'
												: 'fa fa-circle-arrow-down fa-solid'
										}`}
										style={styleProperties.move ?? {}}
										onClick={
											showMove
												? () =>
														handleMove(
															index,
															index == value?.length - 1
																? index - 1
																: index + 1,
														)
												: undefined
										}
									>
										<SubHelperComponent
											definition={props.definition}
											subComponentName="move"
										></SubHelperComponent>
									</i>
								)}
								{showMove && (
									<i
										tabIndex={0}
										className={`moveOne ${
											index == 0 || index == value?.length - 1
												? ''
												: 'fa fa-circle-arrow-up fa-solid'
										}`}
										onClick={
											showMove
												? () => handleMove(index, index - 1)
												: undefined
										}
										style={styleProperties.move ?? {}}
									>
										<SubHelperComponent
											definition={props.definition}
											subComponentName="move"
										></SubHelperComponent>
									</i>
								)}
							</div>
						</div>
					);
				})}
			</>
		);
	} else if (!value?.length && showAdd) {
		items = (
			<div className="iconGrid" style={styleProperties.iconGrid ?? {}}>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="iconGrid"
				></SubHelperComponent>
				<i
					className="addOne fa fa-circle-plus fa-solid"
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

	return (
		<div className={`comp compArrayRepeater _${layout}`} style={styleProperties.comp}>
			<HelperComponent definition={definition} />
			{items}
		</div>
	);
}

const component: Component = {
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
		bindingPath: { name: 'Array Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'repeator',
		type: 'ArrayRepeater',
		properties: {},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M11.9976 18C13.6009 18 15.1078 17.3762 16.2405 16.2436C17.3201 15.1642 17.9437 13.7328 17.9969 12.2106C18.05 10.5256 17.4263 8.94463 16.2405 7.75895C15.0546 6.57328 13.4747 5.95098 11.7858 6.00302C10.2657 6.05605 8.83411 6.67963 7.75471 7.75895C5.4151 10.0982 5.4151 13.9044 7.75471 16.2436C8.88742 17.3762 10.3943 18 11.9976 18Z"
						fill="currentColor"
					/>
					<path
						d="M18.3606 18.4685L18.3606 18.4685C16.661 20.168 14.4023 21.103 11.9962 21.103C9.59005 21.103 7.33143 20.168 5.63183 18.4685L5.63181 18.4685C2.12273 14.96 2.12273 9.25016 5.63181 5.74162L5.63183 5.7416C7.25148 4.12205 9.39779 3.18732 11.6772 3.10754C14.2144 3.02963 16.5817 3.96301 18.3606 5.74162C20.1398 7.52057 21.075 9.88963 20.9953 12.4203C20.9153 14.703 19.9804 16.8489 18.3606 18.4685Z"
						stroke="currentColor"
						strokeOpacity="0.2"
						fill="none"
					/>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M8.81991 5.62444C8.81267 5.81538 9.05171 5.9297 9.18675 5.79451L11.9786 2.99962C12.0875 2.89054 12.0373 2.7044 11.8883 2.66494L8.06798 1.65333C7.88342 1.60446 7.73446 1.82302 7.83661 1.98432C8.52656 3.0737 8.86859 4.33994 8.81991 5.62444Z"
						fill="currentColor"
					/>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M14.4365 19.3763C14.5052 19.198 14.3161 19.0124 14.1445 19.0965L10.5977 20.836C10.4593 20.9038 10.4465 21.0962 10.5747 21.1818L13.861 23.3768C14.0198 23.4828 14.2315 23.3243 14.1871 23.1386C13.8874 21.8845 13.9742 20.5757 14.4365 19.3763Z"
						fill="currentColor"
					/>
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
