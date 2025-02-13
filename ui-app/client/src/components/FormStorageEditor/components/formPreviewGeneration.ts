import {
	ComponentDefinition,
	ComponentProperty,
	DataLocation,
	PageDefinition,
} from '../../../types/common';
import {
	FormCompDefinition,
	FormCompValidation,
	FormDefinition,
	FormPreviewCompValidation,
	PREVIEW_COMP_DEFINITION_MAP,
	PREVIEW_COMP_VALIDATION_MAP,
	PreviewCompValidationProperties,
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

function compValidationGenerator(val: FormCompValidation) {
	let tempVal: FormPreviewCompValidation = {
		...(duplicate(PREVIEW_COMP_VALIDATION_MAP.get(val.type)!) as FormPreviewCompValidation),
		key: val.uuid,
		order: val.order,
	};
	let valProps: PreviewCompValidationProperties = {
		...tempVal.property.value,
	};

	valProps['type'] = val.type;
	if (val?.message) valProps['message'] = { value: val?.message };
	if (val?.pattern) valProps['pattern'] = { value: val?.pattern };
	if (val?.minLength) valProps['minLength'] = { value: val?.minLength };
	if (val?.maxLength) valProps['maxLength'] = { value: val?.maxLength };
	if (val?.minValue) valProps['minValue'] = { value: val?.minValue };
	if (val?.maxValue) valProps['maxValue'] = { value: val?.maxValue };

	tempVal['property']['value'] = valProps;
	return tempVal;
}

function compDefinitionGenerator(data: FormCompDefinition, compType: string, formName: string) {
	let compDef: ComponentDefinition = {
		...(duplicate(PREVIEW_COMP_DEFINITION_MAP.get(compType)) as ComponentDefinition),
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
	};

	if (data?.placeholder) tempProps['placeholder'] = { value: data?.placeholder };
	if (data?.maxChars) tempProps['maxChars'] = { value: data?.maxChars };
	if (data?.inputType) tempProps['valueType'] = { value: data?.inputType };
	if (data?.numberType) tempProps['numberType'] = { value: data?.numberType };
	if (data?.isMultiSelect) tempProps['isMultiSelect'] = { value: data?.isMultiSelect };
	if (data.schema?.enums!?.length > 0) tempProps['data'] = { value: data.schema?.enums };

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
}

export function generateFormPreview(fieldDefinitionMap: FormDefinition, formName: string) {
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

	for (const v of Object.values(fieldDefinitionMap ?? {})) {
		let tempCompDef = compDefinitionGenerator(v, COMP_TYPE[v.editorType], formName);
		pageDef.componentDefinition[tempCompDef.key] = tempCompDef;
		children[tempCompDef.key] = true;
	}

	return { children, pageDef };
}
