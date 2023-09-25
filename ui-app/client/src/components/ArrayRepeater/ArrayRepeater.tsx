import React, { useState } from 'react';
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
import { HelperComponent } from '../HelperComponent';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './arrayRepeaterProperties';
import ArrayRepeaterStyle from './ArrayRepeaterStyle';
import { SubHelperComponent } from '../SubHelperComponent';
import { runEvent } from '../util/runEvent';
import { styleDefaults } from './arrayRepeaterStyleProperties';
import { IconHelper } from '../util/IconHelper';

function ArrayRepeaterComponent(props: ComponentProps) {
	const [value, setValue] = React.useState([]);
	const {
		definition: { children, bindingPath },
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
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const clickMove = moveEvent ? props.pageDefinition.eventFunctions[moveEvent] : undefined;
	const clickRemove = removeEvent ? props.pageDefinition.eventFunctions[removeEvent] : undefined;
	const clickAdd = addEvent ? props.pageDefinition.eventFunctions[addEvent] : undefined;

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;
	const [indexKeys, setIndexKeys] = useState<{ [key: number]: string; object?: any }>({});

	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, _v) => {
				setValue(_v);
				const objKeys: { [key: number]: string } = {};
				if (_v?.length) {
					for (let i = 0; i < _v.length; i++) {
						objKeys[i] = shortUUID();
					}
				}
				setIndexKeys(objKeys);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	if (!Array.isArray(value)) return <></>;

	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	const handleAdd = async (index: any) => {
		const newData = [...value];
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
		e.dataTransfer.setData('application/my-app', index);
	};

	const handleDragOver = (e: any) => {
		e.preventDefault();
	};

	const handleDragEnter = async (e: any) => {
		e.preventDefault();
		e.target.classList.add('dragging');
	};

	const handleDragLeave = (e: any) => {
		e.preventDefault();
		e.target.classList.remove('dragging');
	};

	const handleDrop = (e: any, to: any) => {
		e.preventDefault();
		const from = parseInt(e.dataTransfer.getData('application/my-app'));
		const newData = value.slice();
		const temp = newData[from];
		to === newData.length - 1 ? newData.push(temp) : newData.splice(to, 0, temp);
		newData.splice(from > to ? from + 1 : from, 1);
		setData(bindingPathPath!, newData, context?.pageName);
		e.target.classList.remove('dragging');
	};

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	return (
		<div
			key={Object.values(indexKeys)
				.map(e => e.key)
				.join('_')}
			className={`comp compArrayRepeater _${layout}`}
			style={styleProperties.comp}
		>
			<HelperComponent definition={definition} />
			{value.map((e: any, index) => {
				const comp = (
					<Children
						pageDefinition={pageDefinition}
						children={firstchild}
						context={context}
						locationHistory={[
							...locationHistory,
							updateLocationForChild(
								bindingPath!,
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
						key={`${indexKeys[index]}`}
						data-key={`${indexKeys[index]}`}
						className={`repeaterProperties ${readOnly ? 'disabled' : ''}`}
						onDragStart={e => handleDragStart(e, index)}
						onDragOver={handleDragOver}
						onDrop={e => handleDrop(e, index)}
						onDragEnter={handleDragEnter}
						onDragLeave={handleDragLeave}
						draggable={isItemDraggable && !readOnly}
						style={styleProperties.repeaterProperties ?? {}}
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
									className="addOne fa fa-circle-plus fa-solid"
									onClick={showAdd ? () => handleAdd(index) : undefined}
									style={styleProperties.add ?? {}}
								>
									<SubHelperComponent
										definition={props.definition}
										subComponentName="add"
									></SubHelperComponent>
								</i>
							)}
							{showDelete && (
								<i
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
									className={`moveOne ${
										index == 0 || index == value?.length - 1
											? ''
											: 'fa fa-circle-arrow-up fa-solid'
									}`}
									onClick={
										showMove ? () => handleMove(index, index - 1) : undefined
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
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M8.81991 5.62444C8.81267 5.81538 9.05171 5.9297 9.18675 5.79451L11.9786 2.99962C12.0875 2.89054 12.0373 2.7044 11.8883 2.66494L8.06798 1.65333C7.88342 1.60446 7.73446 1.82302 7.83661 1.98432C8.52656 3.0737 8.86859 4.33994 8.81991 5.62444Z"
						fill="currentColor"
					/>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
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
