import { duplicate } from '@fincity/kirun-js';
import { PageDefinition } from '../../../types/common';
import { shortUUID } from '../../../util/shortUUID';

interface buttonDef {
	key: string;
	name: string;
	type: string;
	properties: {
		[key: string]: any;
	};
	styleProperties: {
		[key: string]: {
			resolutions: {
				ALL: {
					width: {
						value: string;
					};
				};
			};
		};
	};
	override: boolean;
	displayOrder: number;
}

export const generateFormEvents = (
	pageDefinition: PageDefinition,
	formName: string,
	eachFormDef: any,
	submitButtonKey: string,
	clearButtonKey: string,
	selectedFormComponent: Array<string>,
	addSubmitButton: boolean,
	addClearButton: boolean,
	clickedComponent: string,
) => {
	let newPageDef = duplicate(pageDefinition) as PageDefinition;

	let pathName = 'Page.' + formName;

	let eventFunctions: any = newPageDef?.eventFunctions ?? {};

	let eachChildrenObject: any = newPageDef.componentDefinition[clickedComponent]?.children ?? {};

	selectedFormComponent.forEach(each => {
		const newComponentKey = shortUUID();
		eachFormDef[each].key = newComponentKey;
		newPageDef.componentDefinition[newComponentKey] = eachFormDef[each];
		eachChildrenObject[newComponentKey] = true;
	});

	const eventFunctionsKeys = Object.keys(eventFunctions);

	if (addSubmitButton) {
		let saveEventCount = 0;

		eventFunctionsKeys.forEach(each => {
			const functionName: string = newPageDef.eventFunctions[each].name;
			if (functionName.length > 3 && functionName.substring(0, 4) == 'save') {
				saveEventCount += 1;
			}
		});

		let submitFunctionName = 'save' + (saveEventCount > 0 ? `_${saveEventCount}` : '');

		let submitEventKey = shortUUID();
		let submitStylePropertiesKey = shortUUID();

		let dataObjectKey = shortUUID();
		let storageNameKey = shortUUID();
		let eagerFieldsKey = shortUUID();

		let submitEventDefString = `{
			"name": "${submitFunctionName}",
			"steps": {
			  "create": {
				"statementName": "create",
				"name": "Create",
				"namespace": "CoreServices.Storage",
				"position": {
				  "left": 409.953125,
				  "top": 55.59375
				},
				"parameterMap": {
				  "dataObject": {
					"${dataObjectKey}": {
					  "key": "${dataObjectKey}",
					  "type": "EXPRESSION",
					  "expression": "${pathName}",
					  "order": 1
					}
				  },
				  "storageName": {
					"${storageNameKey}": {
					  "key": "${storageNameKey}",
					  "type": "EXPRESSION",
					  "expression": "${formName}",
					  "order": 1
					}
				  },
				  "eagerFields": {
					"${eagerFieldsKey}": {
					  "key": "${eagerFieldsKey}",
					  "type": "EXPRESSION",
					  "order": 1
					}
				  }
				}
			  }
			},
			"namespace": ""
		  }
		`;

		let submitButtonDef: buttonDef = {
			key: submitButtonKey,
			name: 'button',
			type: 'Button',
			properties: {
				label: {
					value: 'Submit',
				},
				colorScheme: {
					value: '_quinary',
				},
				onClick: {
					value: submitEventKey,
				},
			},
			styleProperties: {
				[submitStylePropertiesKey]: {
					resolutions: {
						ALL: {
							width: {
								value: '100px',
							},
						},
					},
				},
			},
			override: false,
			displayOrder: selectedFormComponent.length,
		};

		eachChildrenObject[submitButtonKey] = true;

		eventFunctions[submitEventKey] = JSON.parse(submitEventDefString);

		newPageDef.componentDefinition[submitButtonKey] = submitButtonDef;
	}

	if (addClearButton) {
		let clearEventCount = 0;

		eventFunctionsKeys.forEach(each => {
			const functionName: string = newPageDef.eventFunctions[each].name;
			if (functionName.length > 3 && functionName.substring(0, 5) == 'clear') {
				clearEventCount += 1;
			}
		});

		let clearFunctionName = 'clear' + (clearEventCount > 0 ? `_${clearEventCount}` : '');

		let clearEventKey = shortUUID();
		let clearStylePropertiesKey = shortUUID();

		let pathParmKey = shortUUID();
		let valueParmKey = shortUUID();

		let clearEventDefString = `{
			"name": "${clearFunctionName}",
			"steps": {
			  "setStore": {
				"statementName": "setStore",
				"name": "SetStore",
				"namespace": "UIEngine",
				"position": {
				  "left": 462.203125,
				  "top": 275.203125
				},
				"parameterMap": {
				  "path": {
					"${pathParmKey}": {
					  "key": "${pathParmKey}",
					  "type": "VALUE",
					  "order": 1,
					  "value": "${pathName}"
					}
				  },
				  "value": {
					"${valueParmKey}": {
					  "key": "${valueParmKey}",
					  "type": "VALUE",
					  "expression": "",
					  "order": 1,
					  "value": {}
					}
				  }
				}
			  }
			},
			"namespace": ""
		  }
		`;

		let clearButtonDef: buttonDef = {
			key: clearButtonKey,
			name: 'button',
			type: 'Button',
			properties: {
				label: {
					value: 'Clear',
				},
				onClick: {
					value: clearEventKey,
				},
			},
			styleProperties: {
				[clearStylePropertiesKey]: {
					resolutions: {
						ALL: {
							width: {
								value: '100px',
							},
						},
					},
				},
			},
			override: false,
			displayOrder: selectedFormComponent.length,
		};

		eachChildrenObject[clearButtonKey] = true;
		eventFunctions[clearEventKey] = JSON.parse(clearEventDefString);
		newPageDef.componentDefinition[clearButtonKey] = clearButtonDef;
	}

	newPageDef.componentDefinition[clickedComponent].children = { ...eachChildrenObject };

	newPageDef.eventFunctions = { ...newPageDef.eventFunctions, ...eventFunctions };

	return newPageDef;
};

