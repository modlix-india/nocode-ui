import { isNullValue } from '@fincity/kirun-js';
import React, {
	ChangeEvent,
	FocusEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import CommonInputText from '../../commonComponents/CommonInputText';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getData,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import {
	Component,
	ComponentDefinition,
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentProps,
	LocationHistory,
} from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { IconHelper } from '../util/IconHelper';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { getValidDate, toFormat } from './CalendarMap';
import CalendarStyle from './CalendarStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './calendarProperties';
import { styleDefaults } from './calendarStyleProperties';
import { makePropertiesObject } from '../util/make';

function CalendarComponent(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const {
		definition: { bindingPath, bindingPath2 },
		locationHistory,
		context,
		definition,
		pageDefinition: { translations },
	} = props;

	const {
		key,
		properties: {
			placeholder,
			showMandatoryAsterisk,
			noFloat,
			label,
			closeOnMouseLeave,
			onChange,
			leftIcon,
			minDate,
			maxDate,
			displayDateFormat,
			storageFormat,
			validation,
			readOnly,
			designType,
			colorScheme,
			dateType,
			numberOfDaysInRange,
			disableDates,
			disableTemporalRange,
			disableDays,
			componentDesignType,
			calendarDesignType,
			arrowButtonsHorizontalPlacement,
			calendarFormat,
			showWeekNumber,
			highlightToday,
			weekStartsOn,
			lowLightWeekEnds,
			showPreviousNextMonthDate,
			secondInterval,
			minuteInterval,
			timeDesignType,
			isMultiSelect,
			multipleDateSeparator,
			disableTextEntry,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const changeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;

	const bindingPathPath = getPathFromLocation(bindingPath!, locationHistory, pageExtractor);
	const bindingPathPath1 = getPathFromLocation(bindingPath2!, locationHistory, pageExtractor);

	// This date is from date if the date type is startDate and to date if the date type is endDate
	const [thisDate, setThisDate] = useState<string | undefined>();
	// That date is from date if the date type is endDate and to date if the date type is startDate
	const [thatDate, setThatDate] = useState<string | undefined>();

	const [showDropdown, setShowDropdown] = useState(false);
	const [focus, setFocus] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);

	const [browsingMonthYear, setBrowsingMonthYear] = useState<string>('');

	const computedStyles = useMemo(
		() =>
			processComponentStylePseudoClasses(
				props.pageDefinition,
				{ focus, disabled: readOnly },
				stylePropertiesWithPseudoStates,
			),
		[focus, stylePropertiesWithPseudoStates, readOnly],
	);

	const hoverComputedStyles = useMemo(
		() =>
			processComponentStylePseudoClasses(
				props.pageDefinition,
				{ hover: true, disabled: readOnly },
				stylePropertiesWithPseudoStates,
			),
		[focus, stylePropertiesWithPseudoStates, readOnly],
	);

	useEffect(() => {
		if (!bindingPathPath) return;
		addListenerAndCallImmediately(
			(_, value) => {
				const setFunction = dateType === 'startDate' ? setThisDate : setThatDate;

				if (!value) {
					setFunction(undefined);
				} else if (Array.isArray(value)) {
					const formatted = value.map(e =>
						toFormat(e, storageFormat ?? displayDateFormat, displayDateFormat),
					);
					setFunction(formatted.join(multipleDateSeparator));
				} else {
					setFunction(
						toFormat(value, storageFormat ?? displayDateFormat, displayDateFormat),
					);
				}
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, setThisDate, storageFormat, displayDateFormat, setThatDate, dateType]);

	useEffect(() => {
		if (!bindingPathPath1) return;
		addListenerAndCallImmediately(
			(_, value) => {
				const setFunction = dateType === 'startDate' ? setThatDate : setThisDate;

				if (!value) {
					setFunction(undefined);
				} else if (Array.isArray(value)) {
					const formatted = value.map(e =>
						toFormat(e, storageFormat ?? displayDateFormat, displayDateFormat),
					);
					setFunction(formatted.join(multipleDateSeparator));
				} else {
					setFunction(
						toFormat(value, storageFormat ?? displayDateFormat, displayDateFormat),
					);
				}
			},
			pageExtractor,
			bindingPathPath1,
		);
	}, [bindingPathPath1, setThisDate, storageFormat, displayDateFormat, setThatDate, dateType]);

	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		let currentBindingPath = dateType === 'startDate' ? bindingPathPath : bindingPathPath1;
		if (!currentBindingPath) return;

		const value = e.target.value;
		if (value.trim() === '') {
			if (thisDate) setData(currentBindingPath, undefined, context.pageName);
			else return;
		} else {
			if (isMultiSelect || bindingPathPath1) {
				const values = value.split(multipleDateSeparator);
				const dates = values
					.map(e => e.trim())
					.map(v => toFormat(v, displayDateFormat, storageFormat ?? displayDateFormat));
				console.log(values, dates);
				if (dates?.indexOf(undefined) != -1) {
					setThisDate(value);
					return;
				}

				if (isMultiSelect) {
					setData(currentBindingPath, dates.length ? dates : undefined, context.pageName);
				} else {
					if (dates.length === 1) {
						setData(currentBindingPath, dates[0], context.pageName);
					} else if (dates.length > 1) {
						setData(bindingPathPath, dates[0], context.pageName);
						setData(bindingPathPath1, dates[1], context.pageName);
					}
				}
			} else {
				const date = toFormat(value, displayDateFormat, storageFormat ?? displayDateFormat);
				if (isNullValue(date)) {
					setThisDate(value);
					return;
				}

				setData(currentBindingPath, date, context.pageName);
			}
		}

		if (!changeEvent) return;
		(async () =>
			await runEvent(
				changeEvent,
				key,
				context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	};

	const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setShowDropdown(false);
		setFocus(false);

		if (thisDate !== e.target.value) {
			setData(
				dateType === 'endDate' ? bindingPathPath1 : bindingPathPath,
				e.target.value,
				context.pageName,
			);
			if (!changeEvent) return;
			(async () =>
				await runEvent(
					changeEvent,
					key,
					context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		}
	};

	const handleClose = useCallback(() => {
		if (!showDropdown) return;
		setShowDropdown(false);
		setFocus(false);
		inputRef?.current?.blur();
	}, [showDropdown, setShowDropdown, setFocus, inputRef]);

	useEffect(() => {
		if (!validation?.length) return;

		const msgs = validate(
			props.definition,
			props.pageDefinition,
			validation,
			thisDate,
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
	}, [thisDate, validation]);

	if (componentDesignType === 'fullCalendar') {
	}

	return (
		<CommonInputText
			id={key}
			cssPrefix="comp compCalendar"
			noFloat={noFloat}
			readOnly={readOnly}
			value={thisDate ?? ''}
			label={label}
			translations={translations}
			rightIcon={showDropdown ? 'fa-solid fa-angle-up' : 'fa-solid fa-angle-down'}
			valueType="text"
			isPassword={false}
			placeholder={placeholder}
			hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
			validationMessages={validationMessages}
			context={context}
			hideClearContentIcon={true}
			blurHandler={handleBlur}
			focusHandler={() => {
				setFocus(true);
				setShowDropdown(true);
			}}
			autoComplete="off"
			styles={computedStyles}
			inputRef={inputRef}
			definition={props.definition}
			designType={designType}
			colorScheme={colorScheme}
			leftIcon={leftIcon}
			showDropdown={showDropdown}
			handleChange={handleChange}
			onMouseLeave={closeOnMouseLeave ? handleClose : undefined}
			showMandatoryAsterisk={
				showMandatoryAsterisk &&
				(validation ?? []).find((e: any) => e.type === undefined || e.type === 'MANDATORY')
					? true
					: false
			}
		>
			{showDropdown && (
				<div className="_dropdownContainer" style={computedStyles.dropDownContainer ?? {}}>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="dropDownContainer"
					/>
				</div>
			)}
		</CommonInputText>
	);
}

const component: Component = {
	name: 'Calendar',
	displayName: 'Calendar',
	description: 'Calendar component',
	component: CalendarComponent,
	styleComponent: CalendarStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'focus', 'disabled'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Start Date Binding' },
		bindingPath2: { name: 'End Date Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'Calendar',
		type: 'Calendar',
		properties: {
			label: { value: 'Calendar' },
		},
	},
	sections: [],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<g
						id="Group_113"
						data-name="Group 113"
						transform="translate(-1115.29 -454.281)"
					>
						<rect
							id="Rectangle_38"
							data-name="Rectangle 38"
							width="22"
							height="22"
							rx="1"
							transform="translate(1116.464 456.215)"
							fill="currentColor"
							fillOpacity="0.2"
						/>
						<path
							id="Path_290"
							data-name="Path 290"
							d="M1,0H21a1,1,0,0,1,1,1s-1.156,13.134-2.325,16.334S17.393,21,16.841,21H-.861c-.552,0-.441-1.235.861-3.666S0,1,0,1A1,1,0,0,1,1,0Z"
							transform="translate(1116.464 456.215)"
							fill="currentColor"
							fillOpacity="0.2"
						/>
						<rect
							id="Rectangle_52"
							data-name="Rectangle 52"
							width="2.437"
							height="2.24"
							rx="0.4"
							transform="translate(1122.24 465.496) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_56"
							data-name="Rectangle 56"
							width="2.437"
							height="2.24"
							rx="0.4"
							transform="translate(1122.24 469.496) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_49"
							data-name="Rectangle 49"
							width="2.437"
							height="2.24"
							rx="0.4"
							transform="translate(1126.24 461.527) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_53"
							data-name="Rectangle 53"
							width="2.437"
							height="2.24"
							rx="0.4"
							transform="translate(1126.24 465.496) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_57"
							data-name="Rectangle 57"
							width="2.437"
							height="2.24"
							rx="0.4"
							transform="translate(1126.24 469.496) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_50"
							data-name="Rectangle 50"
							width="2.437"
							height="2.24"
							rx="0.4"
							transform="translate(1130.24 461.527) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_54"
							data-name="Rectangle 54"
							width="2.437"
							height="2.24"
							rx="0.4"
							transform="translate(1130.24 465.496) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_58"
							data-name="Rectangle 58"
							width="2.437"
							height="2.24"
							rx="0.4"
							transform="translate(1130.24 469.496) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_51"
							data-name="Rectangle 51"
							width="2.437"
							height="2.24"
							rx="0.4"
							transform="translate(1134.24 461.496) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_55"
							data-name="Rectangle 55"
							width="2.437"
							height="2.24"
							rx="0.4"
							transform="translate(1134.24 465.496) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_43"
							data-name="Rectangle 43"
							width="3.867"
							height="1.718"
							rx="0.4"
							transform="translate(1120.824 454.281) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_48"
							data-name="Rectangle 48"
							width="3.867"
							height="1.718"
							rx="0.4"
							transform="translate(1135.964 454.418) rotate(90)"
							fill="currentColor"
						/>
					</g>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'dropDownContainer',
			displayName: 'Drop Down Container',
			description: 'Drop Down Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'asterisk',
			displayName: 'asterisk',
			description: 'asterisk',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
	],
	validations: {
		DATE: function (
			validation: any,
			value: any,
			def: ComponentDefinition,
			locationHistory: Array<LocationHistory>,
			pageExtractor: PageStoreExtractor,
		): Array<string> {
			if (!value) return [];

			let { storageFormat, displayDateFormat, multipleDateSeparator } = makePropertiesObject(
				propertiesDefinition,
				def.properties,
				locationHistory,
				pageExtractor ? [pageExtractor] : [],
			);

			if (!storageFormat) storageFormat = displayDateFormat;

			console.log('Storage Format ', storageFormat);
			console.log('seperator', multipleDateSeparator);

			let dates = ('' + value)
				.split(multipleDateSeparator)
				.map(e => getValidDate(e, storageFormat!));
			console.log(dates);
			if (dates.findIndex(e => isNullValue(e)) != -1) return [validation.message];

			return [];
		},
	},
};

export default component;
