import {
	ComponentDefinition,
	ComponentProperty,
	DataLocation,
	PageDefinition,
} from '../../../types/common';
import {
	FormCompDefinition,
	FormCompValidation,
	FormPreviewCompValidation,
	formDefinition,
	previewCompDefinitionMap,
	previewCompValidationMap,
	previewCompValidationProperties,
} from './formCommons';
import { duplicate } from '@fincity/kirun-js';

const COMP_TYPE: { [key: string]: string } = {
	NameEditor: 'TextBox',
	EmailEditor: 'TextBox',
	PhoneEditor: 'TextBox',
	TextBoxEditor: 'TextBox',
	TextAreaEditor: 'TextArea',
	DropdownEditor: 'Dropdown',
	RadioButtonEditor: 'RadioButton',
	CheckBoxEditor: 'RadioButton',
};

const compValidationGenerator = (val: FormCompValidation) => {
	let tempVal: FormPreviewCompValidation = {
		...(duplicate(previewCompValidationMap.get(val.type)!) as FormPreviewCompValidation),
		key: val.uuid,
		order: val.order,
	};
	let valProps: previewCompValidationProperties = {
		...tempVal.property.value,
		...(val.type ? { type: val.type } : {}),
		...(val?.message ? { message: { value: val?.message } } : {}),
		...(val?.pattern ? { pattern: { value: val?.pattern } } : {}),
		...(val?.minLength ? { minLength: { value: val?.minLength } } : {}),
		...(val?.maxLength ? { maxLength: { value: val?.maxLength } } : {}),
		...(val?.minValue ? { minValue: { value: val?.minValue } } : {}),
		...(val?.maxValue ? { maxValue: { value: val?.maxValue } } : {}),
	};
	tempVal['property']['value'] = valProps;
	return tempVal;
};

const compDefinitionGenerator = (data: FormCompDefinition, compType: string, formName: string) => {
	let compDef: ComponentDefinition = {
		...(duplicate(previewCompDefinitionMap.get(compType)) as ComponentDefinition),
		key: data.uuid,
		displayOrder: data.order,
		name: data.label,
		type: compType,
	};
	let tempBindingPath: DataLocation = {
		...compDef.bindingPath!,
		value: `Page.${formName}.${data.key}`,
	};
	let tempProps: {
		[key: string]: ComponentProperty<any>;
	} = {
		...compDef.properties,
		...(data?.placeholder ? { placeholder: { value: data?.placeholder } } : {}),
		...(data?.maxChars ? { maxChars: { value: data?.maxChars } } : {}),
		...(data?.inputType ? { valueType: { value: data?.inputType } } : {}),
		...(data?.numberType ? { numberType: { value: data?.numberType } } : {}),
		...(data?.isMultiSelect ? { isMultiSelect: { value: data?.isMultiSelect } } : {}),
		...(data.schema?.enums!?.length > 0 ? { data: { value: data.schema?.enums } } : {}),
	};

	if (Object.entries(data.validation).length > 0) {
		let tempValidation: { [key: string]: FormPreviewCompValidation } = {};
		Object.values(data.validation).forEach(each => {
			let tempCompVal = compValidationGenerator(each);
			tempValidation[tempCompVal.key] = tempCompVal;
		});
		tempProps['validation'] = tempValidation;
	}

	compDef['properties'] = tempProps;
	compDef['bindingPath'] = tempBindingPath;

	return compDef;
};

export const generateFormPreview = (fieldDefinitionMap: formDefinition, formName: string) => {
	let pageDef: PageDefinition = {
		name: 'formStoragePreview',
		baseClientCode: '',
		permission: '',
		isFromUndoRedoStack: false,
		eventFunctions: {},
		clientCode: '',
		appCode: '',
		version: 0,
		translations: {},
		properties: {},
		rootComponent: '',
		componentDefinition: {},
	};
	let children: { [key: string]: boolean } = {};

	for (const v of Object.values(fieldDefinitionMap)) {
		let tempCompDef = compDefinitionGenerator(v, COMP_TYPE[v.editorType], formName);
		pageDef.componentDefinition[tempCompDef.key] = tempCompDef;
		children[tempCompDef.key] = true;
	}
	console.log('compDef', pageDef.componentDefinition);

	return { children: children, pageDef: pageDef };
};
