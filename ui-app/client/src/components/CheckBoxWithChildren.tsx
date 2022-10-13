import React, { useEffect, useState } from 'react';
import { Schema } from '@fincity/kirun-js';
import { FUNCTION_EXECUTION_PATH, NAMESPACE_UI_ENGINE } from '../constants';
import { addListener, getData, setData } from '../context/StoreContext';
import { runEvent } from './util/runEvent';
import { getChildrenByType } from './util/getChildrenByType';
import { renderChildren } from './util/renderChildren';
import { HelperComponent } from './HelperComponent';
import { getTranslations } from './util/getTranslations';
export interface CheckBoxProps extends React.ComponentPropsWithoutRef<'input'> {
	definition: {
		key: string;
		name: string;
		children: any;
		properties: {
			label: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			form: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			isDisabled: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
		};
	};
	pageDefinition: {
		eventFunctions: {
			[key: string]: any;
		};
		translations: {
			[key: string]: { [key: string]: string };
		};
	};
}
const findChidrenCheckBoxes = (
	pagedef: any,
	children: any,
	currentPath = '',
	bindingPaths: Array<String> = [],
) => {
	if (!pagedef || !children) return;
	const checkBoxes = getChildrenByType(pagedef, children, 'CheckBox') || [];
	checkBoxes.forEach(e => {
		const formId = getData(e?.properties?.form);
		const bindingPath = currentPath
			? `${currentPath}.${e.name}`
			: formId
			? `Store.${formId}.${e.name}`
			: `Store.${e.name}`;
		if (!e.children) {
			bindingPaths.push(bindingPath);
		}
		if (e.children) {
			findChidrenCheckBoxes(
				pagedef,
				e.children,
				bindingPath,
				bindingPaths,
			);
		}
		console.log(bindingPaths);
	});
	return bindingPaths;
};
function CheckBoxComponentWithChildren(props: CheckBoxProps) {
	const {
		pageDefinition: { eventFunctions, translations },
		definition: {
			key,
			name,
			children,
			properties: { label, isDisabled, form },
		},
		...rest
	} = props;
	const formId = getData(form);
	const bindingPath = formId ? `Store.${formId}.${name}` : `Store.${name}`;
	const childrenCheckBoxPaths = findChidrenCheckBoxes(
		props.pageDefinition,
		children,
		bindingPath,
	);
	console.log(childrenCheckBoxPaths);
	const checkBoxLabel = getData(label);
	const isDisabledCheckbox = getData(isDisabled);

	const [checkBoxdata, setCheckBoxData] = useState(
		getData(bindingPath) || 'UNCHECKED',
	);
	useEffect(() => {
		addListener(bindingPath, (_, value) => {
			setCheckBoxData(value);
		});
	}, [bindingPath, setCheckBoxData]);
	const handleChange = (event: any) => {
		console.log(event.target.checked);
		setData(bindingPath, event.target.checked ? 'CHECKED' : 'UNCHECKED');
	};
	return (
		<div className="comp compCheckBox">
			<HelperComponent />
			<label className=" checkbox" htmlFor={key}>
				<input
					disabled={isDisabledCheckbox}
					type="checkbox"
					id={key}
					name={name}
					onChange={handleChange}
					checked={checkBoxdata === 'CHECKED'}
				/>
				{getTranslations(checkBoxLabel, translations)}
			</label>
			{children && renderChildren(props.pageDefinition, children)}
		</div>
	);
}

CheckBoxComponentWithChildren.propertiesSchema = Schema.ofObject('CheckBox')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['form', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['isDisabled', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export const CheckBoxWithChildren = CheckBoxComponentWithChildren;
