import React from 'react';
import {
	compDefinitionMap,
	CustomSchema,
	FormCompDefinition,
	FormCompValidation,
	formDefinition,
	FormSchema,
	FormStorageEditorDefinition,
} from './formCommons';
import Accordion from './Accordion';
import { duplicate } from '@fincity/kirun-js';
import { PageStoreExtractor, setData } from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';
import { shortUUID } from '../../../util/shortUUID';

export default function FormEditor({
	value,
	defPath,
	pageExtractor,
	locationHistory,
}: {
	value: FormStorageEditorDefinition;
	defPath: string | undefined;
	pageExtractor: PageStoreExtractor;
	locationHistory: Array<LocationHistory>;
}) {
	const { fieldDefinitionMap } = value;
	console.log('fieldDefinitionMap', fieldDefinitionMap);

	const generateFormSchema = (fieldDefinitionMap: formDefinition) => {
		const schemaProps: { [key: string]: CustomSchema } = {};
		const required: Array<string> = [];
		Object.entries(fieldDefinitionMap).forEach(([key, value]) => {
			if (Object.keys(value.schema).length > 0) {
				schemaProps[key] = value.schema;
			}
			if (value.validation?.['MANDATORY']) {
				required.push(key);
			}
		});
		const tempSchema: FormSchema = {
			type: 'OBJECT',
			additionalProperties: false,
			properties: schemaProps,
			required: required,
		};
		return tempSchema;
	};

	const generateValidationUUID = (fieldDefinitionMap: formDefinition) => {
		let tempData = duplicate(fieldDefinitionMap);

		Object.entries(tempData).forEach(([k, v]) => {
			//add uuid to validation
			let tempCompDef = duplicate(v) as FormCompDefinition;
			Object.entries(tempCompDef.validation).forEach(([k1, v1]) => {
				let tempVal = duplicate(v1) as FormCompValidation;
				let key = k1 as string;
				if (!tempVal.uuid) {
					console.log('new validation');
					let uuid = shortUUID();
					tempVal['uuid'] = uuid;
					tempCompDef.validation[key] = tempVal;
				}
			});
			tempData[k] = tempCompDef;
		});
		return tempData;
	};

	const setFormData = (fieldDefinitionMap: formDefinition) => {
		let tempData: FormStorageEditorDefinition = {
			...value,
			fieldDefinitionMap: fieldDefinitionMap,
			schema: generateFormSchema(fieldDefinitionMap)!,
		};
		setData(defPath!, tempData, pageExtractor.getPageName());
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	const handleDragStart = async (
		e: React.DragEvent<HTMLDivElement>,
		key: string,
		dropType: string,
	) => {
		e.dataTransfer.setData('editor/text', `{ "key" : "${key}", "dropType": "${dropType}"}`);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>, key?: string) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			const dragData: { key: string; dropType?: string } = JSON.parse(
				e.dataTransfer.getData('editor/text'),
			);
			if (dragData.dropType === 'Inside_Drop') {
				let newData = duplicate(fieldDefinitionMap);
				let temp = newData[key!].order;
				newData[key!].order = newData[dragData.key].order;
				newData[dragData.key].order = temp;
				setFormData(newData);
			} else {
				// adding form component to fieldDefinitionMap/editor
				let tempObj = duplicate(fieldDefinitionMap);

				if (compDefinitionMap.has(dragData.key)) {
					if (fieldDefinitionMap[dragData.key]) {
						let flag = true;
						let i = 1;
						let newKey: string = dragData.key;
						while (flag) {
							newKey = dragData.key + i;
							if (!!fieldDefinitionMap[newKey]) {
								i++;
							} else {
								flag = false;
							}
						}
						tempObj[newKey] = {
							...duplicate(compDefinitionMap.get(dragData.key)!),
							order: Object.entries(fieldDefinitionMap).length,
							key: newKey,
							uuid: shortUUID(),
						};
					} else {
						tempObj[dragData.key] = {
							...duplicate(compDefinitionMap.get(dragData.key)!),
							order: Object.entries(fieldDefinitionMap).length,
							key: dragData.key,
							uuid: shortUUID(),
						};
					}
				}
				setFormData(generateValidationUUID(tempObj));
			}
		} catch (error) {}
	};

	const handleCompDefChanges = (key: string, data: FormCompDefinition) => {
		let tempObj = duplicate(fieldDefinitionMap);
		tempObj[key] = data;
		setFormData(generateValidationUUID(tempObj));
	};

	const handleDelete = (key: string) => {
		let tempObj: formDefinition = duplicate(fieldDefinitionMap);
		delete tempObj[key];
		Object.entries(tempObj)
			.sort(
				(a: [string, FormCompDefinition], b: [string, FormCompDefinition]) =>
					(a[1].order ?? 0) - (b[1].order ?? 0),
			)
			.map(([key, obj], index) => {
				tempObj[key] = { ...obj, order: index };
			});
		setFormData(tempObj);
	};

	return (
		<div className="_editor" onDrop={e => handleDrop(e)} onDragOver={handleDragOver}>
			<Accordion
				data={Object.values(fieldDefinitionMap).sort(
					(a: FormCompDefinition, b: FormCompDefinition) =>
						(a.order ?? 0) - (b.order ?? 0),
				)}
				handleDrop={handleDrop}
				handleDelete={handleDelete}
				handleDragStart={handleDragStart}
				handleCompDefChanges={handleCompDefChanges}
			/>
		</div>
	);
}
