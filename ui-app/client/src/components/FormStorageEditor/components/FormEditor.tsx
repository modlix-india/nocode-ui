import React from 'react';
import {
	COMP_DEFINITION_MAP,
	CustomSchema,
	FormCompDefinition,
	FormCompValidation,
	FormDefinition,
	FormSchema,
	FormStorageEditorDefinition,
} from './formCommons';
import Accordion from './Accordion';
import { duplicate } from '@fincity/kirun-js';
import { PageStoreExtractor, setData } from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';
import { shortUUID } from '../../../util/shortUUID';

export default function FormEditor({
	formStorage,
	storagePath,
	pageExtractor,
	locationHistory,
}: {
	formStorage: FormStorageEditorDefinition;
	storagePath: string;
	pageExtractor: PageStoreExtractor;
	locationHistory: Array<LocationHistory>;
}) {
	const { fieldDefinitionMap } = formStorage;

	const generateFormSchema = (fieldDefinitionMap: FormDefinition) => {
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

	const generateValidationUUID = (fieldDefinitionMap: FormDefinition) => {
		let tempData = duplicate(fieldDefinitionMap);

		Object.entries(tempData).forEach(([k, v]) => {
			//add uuid to validation
			let tempCompDef = duplicate(v) as FormCompDefinition;
			Object.entries(tempCompDef.validation).forEach(([k1, v1]) => {
				let tempVal = duplicate(v1) as FormCompValidation;
				let key = k1 as string;
				if (!tempVal.uuid) {
					let uuid = shortUUID();
					tempVal['uuid'] = uuid;
					tempCompDef.validation[key] = tempVal;
				}
			});
			tempData[k] = tempCompDef;
		});
		return tempData;
	};

	const setFormData = (fieldDefinitionMap: FormDefinition) => {
		let tempData: FormStorageEditorDefinition = {
			...formStorage,
			fieldDefinitionMap: fieldDefinitionMap,
			schema: generateFormSchema(fieldDefinitionMap)!,
		};
		setData(storagePath!, tempData, pageExtractor.getPageName());
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	const handleDragStart = async (
		e: React.DragEvent<HTMLDivElement>,
		key: string,
		dropType: string,
	) => {
		e.dataTransfer.setData(
			'editor/text',
			`FORM_STORAGE_COMPONENT_{ "key" : "${key}", "dropType": "${dropType}"}`,
		);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>, key?: string) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			let dropData: string = e.dataTransfer.getData('editor/text');
			if (!dropData.startsWith('FORM_STORAGE_COMPONENT_')) return;
			const dragData: { key: string; dropType?: string } = JSON.parse(
				dropData.substring(dropData.indexOf('{')),
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

				if (COMP_DEFINITION_MAP.has(dragData.key)) {
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
							...duplicate(COMP_DEFINITION_MAP.get(dragData.key)!),
							order: Object.entries(fieldDefinitionMap).length,
							key: newKey,
							uuid: shortUUID(),
						};
					} else {
						tempObj[dragData.key] = {
							...duplicate(COMP_DEFINITION_MAP.get(dragData.key)!),
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

	const handleFieldDefMapChanges = (key: string, data: FormCompDefinition, newKey?: string) => {
		let tempObj = duplicate(fieldDefinitionMap);
		// when changing key
		if (newKey && newKey != key) {
			tempObj[newKey] = data;
			delete tempObj[key];
		} else tempObj[key] = data;
		setFormData(generateValidationUUID(tempObj));
	};

	const handleDelete = (key: string) => {
		let tempObj: FormDefinition = duplicate(fieldDefinitionMap);
		delete tempObj[key];
		Object.entries(tempObj)
			.sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0))
			.map(([key, obj], index) => (tempObj[key].order = index));
		setFormData(tempObj);
	};

	return (
		<div className="_editor" onDrop={e => handleDrop(e)} onDragOver={handleDragOver}>
			<Accordion
				data={Object.values(fieldDefinitionMap ?? {}).sort(
					(a, b) => (a.order ?? 0) - (b.order ?? 0),
				)}
				handleDrop={handleDrop}
				handleDelete={handleDelete}
				handleDragStart={handleDragStart}
				handleFieldDefMapChanges={handleFieldDefMapChanges}
			/>
		</div>
	);
}
