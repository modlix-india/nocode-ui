import React, { useEffect, useState } from 'react';
import {
	addListener,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './textBoxProperties';
import TextBoxStyle from './TextBoxStyle';
import useDefinition from '../util/useDefinition';
import { isNullValue } from '@fincity/kirun-js';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { flattenUUID } from '../util/uuid';
import { runEvent } from '../util/runEvent';
import { validate } from '../../util/validationProcessor';
import CommonInputText from '../../commonComponents/CommonInputText';

interface mapType {
	[key: string]: any;
}

function TextBox(props: ComponentProps) {
	const [focus, setFocus] = React.useState(false);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);
	const mapValue: mapType = {
		UNDEFINED: undefined,
		NULL: null,
		ENMPTYSTRING: '',
		ZERO: 0,
	};
	const {
		definition: { bindingPath },
		definition,
		pageDefinition: { translations },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			updateStoreImmediately,
			removeKeyWhenEmpty,
			valueType,
			emptyValue,
			supportingText,
			readOnly,
			defaultValue,
			rightIcon,
			leftIcon,
			label,
			noFloat,
			numberType,
			isPassword,
			onEnter,
			validation,
			placeholder,
			messageDisplay,
		} = {},
		stylePropertiesWithPseudoStates,
		key,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const effectivePlaceholder = noFloat ? (placeholder ? placeholder : label) : label;
	const computedStyles = processComponentStylePseudoClasses(
		{ focus, readOnly },
		stylePropertiesWithPseudoStates,
	);
	const [value, setValue] = React.useState(defaultValue ?? '');

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				if (isNullValue(value)) {
					setValue('');
					return;
				}
				setValue(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const spinnerPath = onEnter
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onEnter,
		  )}.isRunning`
		: undefined;

	const [isLoading, setIsLoading] = useState(
		onEnter
			? getDataFromPath(spinnerPath, props.locationHistory, pageExtractor) ?? false
			: false,
	);

	useEffect(() => {
		if (spinnerPath) {
			return addListener((_, value) => setIsLoading(value), pageExtractor, spinnerPath);
		}
	}, []);

	useEffect(() => {
		if (!validation?.length) return;

		const msgs = validate(
			props.definition,
			props.pageDefinition,
			validation,
			value,
			locationHistory,
			pageExtractor,
		);
		setValidationMessages(msgs);

		setData(
			`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
			msgs.length ? msgs : undefined,
			context.pageName,
			true,
		);
		return () =>
			setData(
				`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
				undefined,
				context.pageName,
				true,
			);
	}, [value, validation]);

	const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		let temp = value === '' && emptyValue ? mapValue[emptyValue] : value;
		if (valueType === 'number') {
			const tempNumber =
				value !== ''
					? numberType === 'DECIMAL'
						? parseFloat(value)
						: parseInt(value)
					: temp;
			temp = isNaN(tempNumber) ? temp : tempNumber;
		}
		if (!updateStoreImmediately && bindingPathPath) {
			if (event?.target.value === '' && removeKeyWhenEmpty) {
				setData(bindingPathPath, undefined, context?.pageName, true);
			} else {
				setData(bindingPathPath, temp, context?.pageName);
			}
		}
		setFocus(false);
	};
	const handleTextChange = (text: string) => {
		if (removeKeyWhenEmpty && text === '' && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			return;
		}
		let temp = text === '' && emptyValue ? mapValue[emptyValue] : text;
		if (updateStoreImmediately && bindingPathPath)
			setData(bindingPathPath, temp, context?.pageName);
		if (!updateStoreImmediately) setValue(text);
	};

	const handleNumberChange = (text: string) => {
		if (removeKeyWhenEmpty && text === '' && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			return;
		}
		let temp = text === '' && emptyValue ? mapValue[emptyValue] : text;
		let tempNumber = numberType === 'DECIMAL' ? parseFloat(temp) : parseInt(temp);
		temp = !isNaN(tempNumber) ? tempNumber : temp;
		if (updateStoreImmediately && bindingPathPath)
			setData(bindingPathPath, temp, context?.pageName);
		if (!updateStoreImmediately) setValue(!isNaN(tempNumber) ? temp?.toString() : '');
	};
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (valueType === 'text') handleTextChange(event.target.value);
		else handleNumberChange(event.target.value);
	};
	const handleClickClose = () => {
		let temp = mapValue[emptyValue];
		if (removeKeyWhenEmpty && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
		} else if (bindingPathPath) {
			setData(bindingPathPath, temp, context?.pageName);
		}
	};
	const clickEvent = onEnter ? props.pageDefinition.eventFunctions[onEnter] : undefined;
	const handleKeyUp = async (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!clickEvent || isLoading || e.key !== 'Enter') return;
		if (!updateStoreImmediately) {
			handleBlur(e as unknown as React.FocusEvent<HTMLInputElement>);
		}
		await runEvent(
			clickEvent,
			onEnter,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		);
	};

	return (
		<div className="comp compTextBox" style={computedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />

			<CommonInputText
				id={key}
				noFloat={noFloat}
				readOnly={readOnly}
				value={value}
				label={label}
				translations={translations}
				leftIcon={leftIcon}
				rightIcon={rightIcon}
				valueType={valueType}
				isPassword={isPassword}
				placeholder={effectivePlaceholder}
				hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
				validationMessages={validationMessages}
				context={context}
				handleChange={handleChange}
				clearContentHandler={handleClickClose}
				blurHandler={handleBlur}
				keyUpHandler={handleKeyUp}
				focusHandler={() => setFocus(true)}
				supportingText={supportingText}
				messageDisplay={messageDisplay}
				styles={computedStyles}
			/>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-i-cursor',
	name: 'TextBox',
	displayName: 'TextBox',
	description: 'TextBox component',
	component: TextBox,
	styleComponent: TextBoxStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['focus', 'disabled'],
	bindingPaths: {
		bindingPath: { name: 'Text Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'TextBox',
		name: 'TextBox',
		properties: {
			placeholder: { value: 'placeholder' },
			label: { value: 'TextBox' },
		},
	},
};

export default component;
