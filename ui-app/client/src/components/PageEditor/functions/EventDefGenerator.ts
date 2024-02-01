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
	componentKey: string | undefined,
	formName: string,
	eachFormDef: any,
	submitButtonKey: string,
	clearButtonKey: string,
	selectedFormComponent: Array<string>,
	buttonName: Array<number>,
	clickedComponent: string,
) => {
	let newPageDef = duplicate(pageDefinition) as PageDefinition;

	let submitEventKey = shortUUID();
	let clearEventKey = shortUUID();

	let submitStylePropertiesKey = shortUUID();
	let clearStylePropertiesKey = shortUUID();

	let dataObjectKey = shortUUID();
	let storageNameKey = shortUUID();
	let eagerFieldsKey = shortUUID();
	let pathParmKey = shortUUID();
	let valueParmKey = shortUUID();
	let pathName = 'Page.' + formName;

	let submitEventDefString = `{
		"name": "save",
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

	let clearEventDefString = `{
			"name": "clear",
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

	let eventFunctions: any = {};

	let helperObject: any = {};
	selectedFormComponent.forEach(each => {
		newPageDef.componentDefinition[each] = eachFormDef[each];
		helperObject[each] = true;
	});

	if (buttonName.length == 2) {
		helperObject[submitButtonKey] = true;
		helperObject[clearButtonKey] = true;

		eventFunctions[submitEventKey] = JSON.parse(submitEventDefString);
		eventFunctions[clearEventKey] = JSON.parse(clearEventDefString);

		newPageDef.componentDefinition[submitButtonKey] = submitButtonDef;
		newPageDef.componentDefinition[clearButtonKey] = clearButtonDef;
	} else if (buttonName.length == 1) {
		if (buttonName[0] == 1) {
			helperObject[clearButtonKey] = true;
			eventFunctions[clearEventKey] = JSON.parse(clearEventDefString);
			newPageDef.componentDefinition[clearButtonKey] = clearButtonDef;
		} else {
			helperObject[submitButtonKey] = true;
			eventFunctions[submitEventKey] = JSON.parse(submitEventDefString);
			newPageDef.componentDefinition[submitButtonKey] = submitButtonDef;
		}
	}

	newPageDef.componentDefinition[clickedComponent]['children'] = helperObject;

	newPageDef['eventFunctions'] = eventFunctions;

	return newPageDef;
};
