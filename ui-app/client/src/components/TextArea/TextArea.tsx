import { isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect } from 'react';
import CommonInputText from '../../commonComponents/CommonInputText';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { IconHelper } from '../util/IconHelper';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import TextAreaStyle from './TextAreaStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './textAreaProperties';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './textAreaStyleProperties';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';
import { makeTempPath } from '../../context/TempStore';

interface mapType {
	[key: string]: any;
}

function TextArea(props: Readonly<ComponentProps>) {
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
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
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
			autoFocus,
			designType,
			colorScheme,
			onFocus,
			onBlur,
			showMandatoryAsterisk,
			hideClearButton,
			maxChars,
			rows,
			editRequestIcon,
			editConfirmIcon,
			editCancelIcon,
		} = {},
		stylePropertiesWithPseudoStates,
		key,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);
	const computedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, readOnly },
		stylePropertiesWithPseudoStates,
	);

	const editOn = designType === '_editOnReq';

	const [value, setValue] = React.useState(defaultValue ?? '');

	let bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const originalBindingPathPath = bindingPathPath;

	if (editOn && bindingPathPath) {
		bindingPathPath = makeTempPath(bindingPathPath, context.pageName);
	}

	React.useEffect(() => {
		if (!originalBindingPathPath) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, value) => {
				if (isNullValue(value)) {
					setValue('');
					return;
				}
				setValue(value);
			},
			originalBindingPathPath,
		);
	}, [originalBindingPathPath]);

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

	const updateStoreImmediately = upStoreImm || autoComplete === 'on';

	const changeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;
	const blurEvent = onBlur ? props.pageDefinition.eventFunctions?.[onBlur] : undefined;
	const focusEvent = onFocus ? props.pageDefinition.eventFunctions?.[onFocus] : undefined;

	const callChangeEvent = useCallback(
		(force: boolean = false) => {
			if (!changeEvent || (editOn && !force)) return;
			(async () =>
				await runEvent(
					changeEvent,
					onChange,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		},
		[changeEvent, editOn],
	);

	const callBlurEvent = useCallback(
		(force: boolean = false) => {
			if (!blurEvent || (editOn && !force)) return;
			(async () =>
				await runEvent(
					blurEvent,
					onBlur,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		},
		[blurEvent, editOn],
	);

	const callFocusEvent = useCallback(() => {
		if (!focusEvent) return;
		(async () =>
			await runEvent(
				focusEvent,
				onFocus,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	}, [focusEvent]);

	const handleClickClose = async () => {
		let temp = mapValue[emptyValue];
		if (removeKeyWhenEmpty && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			callChangeEvent();
		} else if (bindingPathPath) {
			setData(bindingPathPath, temp, context?.pageName);
			callChangeEvent();
		}
		if (!onClear) return;
		const clearEvent = props.pageDefinition.eventFunctions?.[onClear];
		if (!clearEvent) return;
		await runEvent(
			clearEvent,
			onClear,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		);
	};

	const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		let temp = value === '' && emptyValue ? mapValue[emptyValue] : value;
		if (!updateStoreImmediately && bindingPathPath) {
			if (event?.target.value === '' && removeKeyWhenEmpty) {
				setData(bindingPathPath, undefined, context?.pageName, true);
			} else {
				setData(bindingPathPath, temp, context?.pageName);
			}
			callChangeEvent();
		}
		callBlurEvent();
		setFocus(false);
		setIsDirty(true);
	};

	const handleInputFocus = () => {
		setFocus(true);
		callFocusEvent();
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const text = event.target.value;
		if (removeKeyWhenEmpty && text === '' && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			callChangeEvent();
			return;
		}
		let temp = text === '' && emptyValue ? mapValue[emptyValue] : text;
		if (updateStoreImmediately && bindingPathPath) {
			setData(bindingPathPath, temp, context?.pageName);
			callChangeEvent();
		}
		if (!updateStoreImmediately) setValue(text);
	};

	return (
		<CommonInputText
			cssPrefix="comp compTextArea"
			id={key}
			noFloat={noFloat}
			readOnly={readOnly}
			value={value}
			label={editOn ? '' : label}
			maxChars={maxChars}
			translations={translations}
			placeholder={placeholder}
			hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
			validationMessages={validationMessages}
			context={context}
			handleChange={handleChange}
			clearContentHandler={handleClickClose}
			blurHandler={handleBlur}
			focusHandler={() => handleInputFocus()}
			supportingText={supportingText}
			messageDisplay={messageDisplay}
			styles={computedStyles}
			designType={designType}
			colorScheme={colorScheme}
			definition={props.definition}
			autoComplete={autoComplete}
			autoFocus={autoFocus}
			hasValidationCheck={validation?.length > 0}
			hideClearContentIcon={editOn ? true : hideClearButton}
			inputType="TextArea"
			rows={rows}
			showMandatoryAsterisk={
				(validation ?? []).find(
					(e: any) => e.type === undefined || e.type === 'MANDATORY',
				) && showMandatoryAsterisk
					? true
					: false
			}
			showEditRequest={editOn}
			editRequestIcon={editRequestIcon}
			editConfirmIcon={editConfirmIcon}
			editCancelIcon={editCancelIcon}
			onEditRequest={(editMode, cancel) => {
				if (!originalBindingPathPath || editMode) return;
				if (cancel) {
					setValue(
						getDataFromPath(originalBindingPathPath, locationHistory, pageExtractor),
					);
				} else {
					setData(originalBindingPathPath, value, context?.pageName);
					callChangeEvent(true);
					callBlurEvent(true);
				}
			}}
		/>
	);
}

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

const component: Component = {
	order: 13,
	name: 'TextArea',
	displayName: 'Text Area',
	description: 'TextArea component',
	component: TextArea,
	styleComponent: TextAreaStyle,
	styleDefaults: styleDefaults,
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
			label: { value: 'TextArea' },
		},
	},
	sections: [{ name: 'Text Area', pageName: 'textArea' }],
		propertiesForTheme: [designType, colorScheme],
	stylePropertiesForTheme: stylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
};

export default component;
