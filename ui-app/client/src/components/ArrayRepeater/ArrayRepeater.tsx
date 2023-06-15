import { Schema } from '@fincity/kirun-js';
import React, { useState } from 'react';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import {
	addListener,
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getData,
	getDataFromLocation,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import {
	ComponentPropertyDefinition,
	ComponentProps,
	DataLocation,
	RenderContext,
} from '../../types/common';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './arrayRepeaterProperties';
import ArrayRepeaterStyle from './ArrayRepeaterStyle';
import useDefinition from '../util/useDefinition';
import UUID from '../util/uuid';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { shortUUID } from '../../util/shortUUID';

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
		properties: { isItemDraggable, showMove, showDelete, showAdd, readOnly, layout } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;
	const [indexKeys, setIndexKeys] = useState<{ [key: number]: string; object?: any }>({});

	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, value) => {
				setValue(value);
				const objKeys: { [key: number]: string } = {};
				if (value?.length) {
					for (let i = 0; i < value.length; i++) {
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

	const handleAdd = (index: any) => {
		const newData = value.slice();
		newData.splice(index + 1, 0, newData[index]);
		setData(bindingPathPath!, newData, context?.pageName);
	};

	const handleDelete = (index: any) => {
		const newData = value.slice();
		newData.splice(index, 1);
		setData(bindingPathPath!, newData, context?.pageName);
	};

	const handleMove = (from: number, to: number) => {
		const newData = value.slice();
		if (from >= newData?.length || from < 0 || to >= newData.length || to < 0) return;
		const temp = newData[from];
		newData[from] = newData[to];
		newData[to] = temp;
		setData(bindingPathPath!, newData, context?.pageName);
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
					>
						{comp}
						{showAdd && (
							<i
								className="addOne fa fa-circle-plus fa-solid"
								onClick={showAdd ? () => handleAdd(index) : undefined}
							/>
						)}
						{showDelete && (
							<i
								className="reduceOne fa fa-circle-minus fa-solid"
								onClick={showDelete ? () => handleDelete(index) : undefined}
							/>
						)}
						{showMove && (
							<i
								className={`moveOne ${
									index == value?.length - 1
										? 'fa fa-circle-arrow-up fa-solid'
										: 'fa fa-circle-arrow-down fa-solid'
								}`}
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
							/>
						)}
						{showMove && (
							<i
								className={`moveOne ${
									index == 0 || index == value?.length - 1
										? ''
										: 'fa fa-circle-arrow-up fa-solid'
								}`}
								onClick={showMove ? () => handleMove(index, index - 1) : undefined}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-layer-group',
	name: 'ArrayRepeater',
	displayName: 'Repeater',
	description: 'Array Repeater component',
	component: ArrayRepeaterComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: ArrayRepeaterStyle,
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
};

export default component;
