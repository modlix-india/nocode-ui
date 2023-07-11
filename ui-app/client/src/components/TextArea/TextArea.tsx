import { isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import {
	PageStoreExtractor,
	addListener,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { HelperComponent } from '../HelperComponent';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import TextAreaStyle from './TextAreaStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './textAreaProperties';
import { SubHelperComponent } from '../SubHelperComponent';

interface mapType {
	[key: string]: any;
}

function TextArea(props: ComponentProps) {
	const [focus, setFocus] = React.useState(false);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);
	const [isDirty, setIsDirty] = React.useState(false);
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
			updateStoreImmediately: upStoreImm,
			removeKeyWhenEmpty,
			emptyValue,
			supportingText,
			readOnly,
			defaultValue,
			label,
			noFloat,
			onChange,
			validation,
			placeholder,
			messageDisplay,
			autoComplete,
			onClear,
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
	const effectivePlaceholder = noFloat ? (placeholder ? placeholder : '') : label;
	const computedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
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

	const spinnerPath1 = onChange
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onChange,
		  )}.isRunning`
		: undefined;

	const [isLoading, setIsLoading] = useState(
		getDataFromPath(spinnerPath1, props.locationHistory, pageExtractor),
	);

	useEffect(() => {
		if (!spinnerPath1?.length) return;
		return addListener((_, value) => setIsLoading(value), pageExtractor, spinnerPath1);
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

	const hasErrorMessages =
		validationMessages?.length && (value || isDirty || context.showValidationMessages);
	const validationMessagesComp = hasErrorMessages ? (
		<div
			className={`_validationMessages ${messageDisplay}`}
			style={computedStyles.errorTextContainer ?? {}}
		>
			<SubHelperComponent definition={definition} subComponentName="errorTextContainer" />
			{validationMessages.map(msg => (
				<div
					className={`_eachValidationMessage`}
					style={computedStyles.errorText ?? {}}
					key={msg}
				>
					<SubHelperComponent definition={definition} subComponentName="errorText" />
					{msg}
				</div>
			))}
		</div>
	) : messageDisplay === '_fixedMessages' ? (
		<div className={`_validationMessages ${messageDisplay}`}></div>
	) : null;

	const supportText =
		supportingText && !hasErrorMessages ? (
			<span
				style={computedStyles.supportText ?? {}}
				className={`supportText ${readOnly ? 'disabled' : ''}`}
			>
				<SubHelperComponent definition={definition} subComponentName="supportText" />
				{supportingText}
			</span>
		) : null;

	const updateStoreImmediately = upStoreImm || autoComplete === 'on';

	const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
		let temp = value === '' && emptyValue ? mapValue[emptyValue] : value;
		if (!updateStoreImmediately && bindingPathPath) {
			if (event?.target.value === '' && removeKeyWhenEmpty) {
				setData(bindingPathPath, undefined, context?.pageName, true);
			} else {
				setData(bindingPathPath, temp, context?.pageName);
			}
		}
		setFocus(false);
		setIsDirty(true);
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
	const changeEvent = onChange ? props.pageDefinition.eventFunctions[onChange] : undefined;
	const handleChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setIsDirty(true);
		handleTextChange(event.target.value);
		if (!changeEvent || isLoading) return;
		await runEvent(
			changeEvent,
			onChange,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		);
	};

	return (
		<div className="comp compTextArea" style={computedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />

			{noFloat && label && (
				<label
					style={computedStyles.noFloatLabel ?? {}}
					htmlFor={key}
					className={`noFloatTextAreaLabel ${readOnly ? 'disabled' : ''}${
						value?.length ? `hasText` : ``
					}`}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="noFloatLabel"
					></SubHelperComponent>
					{getTranslations(label, translations)}
				</label>
			)}
			<div
				className={`inputContainer ${hasErrorMessages ? 'error' : ''} ${
					focus && !hasErrorMessages && !value?.length ? 'focussed' : ''
				} ${value?.length ? 'hasText' : ''} ${
					readOnly && !hasErrorMessages ? 'disabled' : ''
				}`}
			>
				<textarea
					style={computedStyles.inputBox ?? {}}
					className={`textArea ${noFloat ? '' : 'float'} `}
					value={value}
					onChange={event => handleChange(event)}
					placeholder={getTranslations(effectivePlaceholder, translations)}
					onFocus={() => setFocus(true)}
					onBlur={event => handleBlur(event)}
					name={key}
					id={key}
					disabled={readOnly}
					autoComplete={autoComplete}
				></textarea>
				{!noFloat ? (
					<label
						style={computedStyles.floatingLabel ?? {}}
						htmlFor={key}
						className={`textAreaLabel ${readOnly ? 'disabled' : ''} ${
							value?.length ? `hasText` : ``
						}`}
					>
						<SubHelperComponent
							definition={definition}
							subComponentName="floatingLabel"
						></SubHelperComponent>
						{getTranslations(label, translations)}
					</label>
				) : null}
				{hasErrorMessages ? (
					<i
						style={computedStyles.rightIcon ?? {}}
						className={`errorIcon rightIcon ${
							value?.length ? `hasText` : ``
						} fa fa-solid fa-circle-exclamation`}
					>
						<SubHelperComponent definition={definition} subComponentName="rightIcon" />
					</i>
				) : null}
			</div>
			<div>
				{validationMessagesComp}
				{supportText}
			</div>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-i-cursor',
	name: 'TextArea',
	displayName: 'TextArea',
	description: 'TextArea component',
	component: TextArea,
	styleComponent: TextAreaStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['focus', 'disabled'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Text Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'TextArea',
		name: 'TextArea',
		properties: {
			placeholder: { value: 'placeholder' },
			label: { value: 'TextArea' },
		},
	},
};

export default component;
