import React, { useEffect, useState } from 'react';
import {
	compDefinitionMap,
	CustomSchema,
	FormCompDefinition,
	formDefinition,
	FormSchema,
	FormStorageEditorDefinition,
} from './formDefinitions';
import Accordion from './Accordion';
import { duplicate } from '@fincity/kirun-js';
import { PageStoreExtractor, setData } from '../../../context/StoreContext';

export default function FormEditor({
	value,
	defPath,
	pageExtractor,
}: {
	value: FormStorageEditorDefinition;
	defPath: string | undefined;
	pageExtractor: PageStoreExtractor;
}) {
	const [compDefData, setCompDefData] = useState<formDefinition>({});
	const [formSchema, setFormSchema] = useState<FormSchema>();

	useEffect(() => {
		setCompDefData(value!.formDefinition);
		setFormSchema(value!.formSchema);
	}, [value]);

	const generateFormSchema = (compDefData: formDefinition) => {
		const schemaProps: { [key: string]: CustomSchema } = {};
		const required: Array<string> = [];
		Object.entries(compDefData).forEach(([key, value]) => {
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

	const setFormData = (tempObj: formDefinition) => {
		let tempData: FormStorageEditorDefinition = {
			formDefinition: tempObj,
			formSchema: generateFormSchema(tempObj)!,
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
				let newData = duplicate(compDefData);
				let temp = newData[key!].order;
				newData[key!].order = newData[dragData.key].order;
				newData[dragData.key].order = temp;
				setFormData(newData);
			} else {
				let tempObj = duplicate(compDefData);

				if (compDefinitionMap.has(dragData.key)) {
					if (compDefData[dragData.key]) {
						let flag = true;
						let i = 1;
						let newKey: string = dragData.key;
						while (flag) {
							newKey = dragData.key + i;
							if (!!compDefData[newKey]) {
								i++;
							} else {
								flag = false;
							}
						}
						tempObj[newKey] = {
							...compDefinitionMap.get(dragData.key)!,
							order: Object.entries(compDefData).length,
							key: newKey,
						};
					} else {
						tempObj[dragData.key] = {
							...compDefinitionMap.get(dragData.key)!,
							order: Object.entries(compDefData).length,
							key: dragData.key,
						};
					}
				}
				setFormData(tempObj);
			}
		} catch (error) {}
	};

	const handleCompDefChanges = (key: string, data: FormCompDefinition) => {
		let tempObj = duplicate(compDefData);
		tempObj[key] = data;
		setFormData(tempObj);
	};

	const handleDelete = (key: string) => {
		let tempObj: formDefinition = duplicate(compDefData);
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
				data={Object.values(compDefData).sort(
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
