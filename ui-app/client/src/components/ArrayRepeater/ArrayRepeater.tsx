import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import {
	addListener,
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
import { propertiesDefinition, stylePropertiesDefinition } from './ArrayRepeaterProperties';
import ArrayRepeaterStyle from './ArrayRepeaterStyle';
import useDefinition from '../util/useDefinition';
import UUID from '../util/uuid';
import Children from '../Children';

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
	const { properties: { isItemDraggable, showMove, showDelete, showAdd, readOnly } = {}, key } =
		useDefinition(
			definition,
			propertiesDefinition,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
		);
	if (!bindingPath) throw new Error('Definition requires bindingpath');
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);

	React.useEffect(() => {
		return addListener(
			(_, value) => {
				setValue(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	if (!Array.isArray(value)) return <></>;
	const firstchild = {
		[Object.entries(children)[0][0]]: Object.entries(children)[0][1],
	};

	const handleAdd = (index: any) => {
		const newData = value.slice();
		newData.splice(index + 1, 0, newData[index]);
		setData(bindingPathPath, newData, context?.pageName);
	};

	const handleDelete = (index: any) => {
		const newData = value.slice();
		newData.splice(index, 1);
		setData(bindingPathPath, newData, context?.pageName);
	};

	const handleMove = (from: number, to: number) => {
		const newData = value.slice();
		if (from >= newData?.length || from < 0 || to >= newData.length || to < 0) return;
		const temp = newData[from];
		newData[from] = newData[to];
		newData[to] = temp;
		setData(bindingPathPath, newData, context?.pageName);
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
		setData(bindingPathPath, newData, context?.pageName);
		e.target.classList.remove('dragging');
	};

	return (
		<div className="comp compArrayRepeater">
			<HelperComponent definition={definition} />
			{value.map((e: any, index) => {
				const comp = (
					<Children
						pageDefinition={pageDefinition}
						children={firstchild}
						context={context}
						locationHistory={[
							...locationHistory,
							updateLocationForChild(bindingPath!, index, locationHistory),
						]}
					/>
				);
				return (
					<div
						key={`${e.name}_${index}`}
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
	name: 'ArrayRepeater',
	displayName: 'Array Repeater',
	description: 'Array Repeater component',
	component: ArrayRepeaterComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: ArrayRepeaterStyle,
};

export default component;
