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
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import {
	Component,
	ComponentDefinition,
	ComponentPropertyDefinition,
	ComponentProps,
	LocationHistory,
} from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { IconHelper } from '../util/IconHelper';
import { makePropertiesObject } from '../util/make';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import CalendarStyle from './CalendarStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './calendarProperties';
import { styleDefaults } from './calendarStyleProperties';
import { CalendarMap } from './components/CalendarMap';
import {
	getValidDate,
	toFormat,
	validateRangesAndSetData,
	validateWithProps,
	zeroHourDate,
} from './components/calendarFunctions';
import { CalendarValidationProps } from './components/calendarTypes';

function CalendarComponent(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const {
		definition: { bindingPath, bindingPath2, bindingPath3 },
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
			minDate,
			maxDate,
			displayDateFormat,
			storageFormat,
			validation,
			readOnly,
			designType,
			colorScheme,
			dateType,
			disableDates,
			disableTemporalRanges,
			disableDays,
			componentDesignType,
			calendarDesignType,
			hourIntervalFrom,
			hourInterval,
			minuteIntervalFrom,
			minuteInterval,
			secondIntervalFrom,
			secondInterval,
			isMultiSelect,
			multipleDateSeparator,
			disableTextEntry,
			onChange,
			onMonthChange,
			leftIcon,
			weekEndDays,
			lowLightWeekEnd,
			maxNumberOfDaysInRange,
			minNumberOfDaysInRange,
		} = {},
		properties: computedProperties,
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const changeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;
	const monthChangeEnvet = onMonthChange
		? props.pageDefinition.eventFunctions?.[onMonthChange]
		: undefined;

	const bindingPathPath1 = getPathFromLocation(bindingPath!, locationHistory, pageExtractor);
	const bindingPathPath2 = getPathFromLocation(bindingPath2!, locationHistory, pageExtractor);
	const bindingPathPath3 = getPathFromLocation(bindingPath3!, locationHistory, pageExtractor);

	const isRangeType = !!bindingPathPath2;

	// This date is from date if the date type is startDate and to date if the date type is endDate
	const [thisDate, setThisDate] = useState<string | undefined>();
	// That date is from date if the date type is endDate and to date if the date type is startDate
	const [thatDate, setThatDate] = useState<string | undefined>();

	const [showDropdown, setShowDropdown] = useState(false);
	const [mouseIsInside, setMouseIsInside] = useState(false);
	const [focus, setFocus] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);

	const [browsingMonthYear, setBrowsingMonthYear] = useState<string>('');

	useEffect(() => {
		if (!bindingPathPath3) return;
		addListenerAndCallImmediately(
			(_, value) => {
				setBrowsingMonthYear(value);
			},
			pageExtractor,
			bindingPathPath3,
		);
	}, [bindingPathPath3, setBrowsingMonthYear]);

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

	const disabledComputedStyles = useMemo(
		() =>
			processComponentStylePseudoClasses(
				props.pageDefinition,
				{ disabled: true },
				stylePropertiesWithPseudoStates,
			),
		[focus, stylePropertiesWithPseudoStates, readOnly],
	);

	useEffect(() => {
		if (!bindingPathPath1) return;
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
						toFormat(
							value,
							storageFormat ?? displayDateFormat,
							displayDateFormat,
						)?.toString(),
					);
				}
			},
			pageExtractor,
			bindingPathPath1,
		);
	}, [bindingPathPath1, setThisDate, storageFormat, displayDateFormat, setThatDate, dateType]);

	useEffect(() => {
		if (!bindingPathPath2) return;
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
						toFormat(
							value,
							storageFormat ?? displayDateFormat,
							displayDateFormat,
						)?.toString(),
					);
				}
			},
			pageExtractor,
			bindingPathPath2,
		);
	}, [bindingPathPath2, setThisDate, storageFormat, displayDateFormat, setThatDate, dateType]);

	const validationProps = useMemo(() => {
		return {
			storageFormat,
			displayDateFormat,
			isMultiSelect,
			isRangeType,
			minDate,
			maxDate,
			disableDates,
			disableTemporalRanges,
			disableDays,
			hourIntervalFrom,
			hourInterval,
			secondIntervalFrom,
			secondInterval,
			minuteIntervalFrom,
			minuteInterval,
			multipleDateSeparator,
			weekEndDays,
		} as CalendarValidationProps;
	}, [
		storageFormat,
		displayDateFormat,
		isMultiSelect,
		isRangeType,
		minDate,
		maxDate,
		disableDates,
		disableTemporalRanges,
		disableDays,
		hourIntervalFrom,
		hourInterval,
		secondIntervalFrom,
		secondInterval,
		minuteIntervalFrom,
		minuteInterval,
		multipleDateSeparator,
		weekEndDays,
	]);

	const clearOtherDate = () => {
		if (!isRangeType) return;

		const currentBindingPath = dateType === 'startDate' ? bindingPathPath2 : bindingPathPath1;
		if (!currentBindingPath) return;

		validateRangesAndSetData(currentBindingPath, undefined, context.pageName, validationProps);
	};

	const handleChange = (e: any, close: boolean) => {
		let currentBindingPath = dateType === 'startDate' ? bindingPathPath1 : bindingPathPath2;
		if (!currentBindingPath) return;

		const typeofE = typeof e;
		const value: string =
			(typeofE === 'string' || typeofE === 'number' || typeofE === 'undefined'
				? e
				: e?.target?.value
			).toString() ?? '';

		if (value.trim() === '') {
			if (!thisDate) return;
			const validatedAndSet = validateRangesAndSetData(
				currentBindingPath,
				undefined,
				context.pageName,
				validationProps,
			);
			if (!validatedAndSet && close) {
				setShowDropdown(false);
				return;
			}
		} else {
			if (isMultiSelect || bindingPathPath2) {
				const values = value.split(multipleDateSeparator);
				let dates = values
					.map(e => e.trim())
					.map(v => toFormat(v, displayDateFormat, storageFormat ?? displayDateFormat));

				if (dates?.indexOf(undefined) != -1) {
					setThisDate(value);
					return;
				}

				let validatedAndSet = false;
				if (isMultiSelect) {
					validatedAndSet = validateRangesAndSetData(
						currentBindingPath,
						dates.length ? dates.join(multipleDateSeparator) : undefined,
						context.pageName,
						validationProps,
					);
				} else {
					if (dates.length === 1) {
						validatedAndSet = validateRangesAndSetData(
							currentBindingPath,
							dates[0],
							context.pageName,
							validationProps,
						);
					} else if (dates.length > 1) {
						if (minNumberOfDaysInRange || maxNumberOfDaysInRange) {
							let start = zeroHourDate(
								getValidDate(dates[0], storageFormat ?? displayDateFormat),
							);
							let end = zeroHourDate(
								getValidDate(dates[1], storageFormat ?? displayDateFormat),
							);
							if (!start || !end) return;
							if (start > end) {
								[start, end] = [end, start];
							}

							const diff = Math.abs(end.getTime() - start.getTime());
							const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
							if (minNumberOfDaysInRange && days < minNumberOfDaysInRange) {
								end = new Date(
									start.getTime() + minNumberOfDaysInRange * 24 * 60 * 60 * 1000,
								);
							}

							if (maxNumberOfDaysInRange && days > maxNumberOfDaysInRange) {
								end = new Date(
									start.getTime() + maxNumberOfDaysInRange * 24 * 60 * 60 * 1000,
								);
							}
							dates = [
								toFormat(start, 'Date', storageFormat ?? displayDateFormat),
								toFormat(end, 'Date', storageFormat ?? displayDateFormat),
							];
						}
						validatedAndSet = validateRangesAndSetData(
							dateType === 'startDate' ? bindingPathPath1 : bindingPathPath2,
							dates[0],
							context.pageName,
							validationProps,
						);
						validatedAndSet = validateRangesAndSetData(
							dateType === 'startDate' ? bindingPathPath2 : bindingPathPath1,
							dates[1],
							context.pageName,
							validationProps,
						);
					}
				}

				if (validatedAndSet && close) {
					setShowDropdown(false);
					return;
				}
			} else {
				const date = toFormat(value, displayDateFormat, storageFormat ?? displayDateFormat);
				if (isNullValue(date)) {
					setThisDate(value);
					return;
				}

				const validatedAndSet = validateRangesAndSetData(
					currentBindingPath,
					date,
					context.pageName,
					validationProps,
				);

				if (validatedAndSet && close) {
					setShowDropdown(false);
					return;
				}
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
		if (mouseIsInside) return;

		setShowDropdown(false);
		setFocus(false);

		if (disableTextEntry || readOnly) return;

		const storable = toFormat(
			e.target.value,
			displayDateFormat,
			storageFormat ?? displayDateFormat,
		);

		if (thisDate !== storable || storable === undefined) {
			validateRangesAndSetData(
				dateType === 'endDate' ? bindingPathPath2 : bindingPathPath1,
				storable,
				context.pageName,
				validationProps,
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
	}, [thisDate, validation, validationProps]);

	const calendar =
		componentDesignType === 'fullCalendar' || showDropdown ? (
			<CalendarMap
				{...computedProperties}
				thisDate={thisDate}
				isRangeType={isRangeType}
				thatDate={thatDate}
				browsingMonthYear={browsingMonthYear}
				onBrowsingMonthYearChange={async my => {
					setBrowsingMonthYear(my);
					if (bindingPathPath3) setData(bindingPathPath3, my, context.pageName);
					if (!monthChangeEnvet) return;
					await runEvent(
						monthChangeEnvet,
						key,
						context.pageName,
						props.locationHistory,
						props.pageDefinition,
					);
				}}
				onChange={readOnly ? undefined : handleChange}
				onClearOtherDate={readOnly ? undefined : clearOtherDate}
				styles={computedStyles}
				hoverStyles={hoverComputedStyles}
				disabledStyles={disabledComputedStyles}
				definition={definition}
			/>
		) : undefined;

	if (componentDesignType === 'fullCalendar') {
		return (
			<div
				className={`comp compCalendar fullCalendar ${calendarDesignType} ${colorScheme} ${lowLightWeekEnd ? '_lowLightWeekend' : ''}`}
				style={computedStyles?.comp ?? {}}
			>
				<HelperComponent context={context} definition={definition} />
				{calendar}
			</div>
		);
	}

	return (
		<CommonInputText
			id={key}
			cssPrefix={`comp compCalendar ${calendarDesignType} ${lowLightWeekEnd ? '_lowLightWeekend' : ''}`}
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
			handleChange={disableTextEntry || readOnly ? undefined : e => handleChange(e, true)}
			onMouseEnter={() => setMouseIsInside(true)}
			onMouseLeave={() => {
				setMouseIsInside(false);
				if (closeOnMouseLeave) handleClose();
			}}
			showMandatoryAsterisk={
				showMandatoryAsterisk &&
				(validation ?? []).find((e: any) => e.type === undefined || e.type === 'MANDATORY')
			}
		>
			{calendar && (
				<div className="_dropdownContainer" style={computedStyles.dropDownContainer ?? {}}>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="dropDownContainer"
					/>
					{calendar}
				</div>
			)}
		</CommonInputText>
	);
}

const component: Component = {
	order: 17,
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
		bindingPath3: { name: 'Browsing month-year (mm-yyyy) Binding ' },
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
				<IconHelper viewBox="0 0 30 30">
					<path
						className="_calenderValues"
						d="M0 11.25H26.25V27.1875C26.25 28.7402 24.9902 30 23.4375 30H2.8125C1.25977 30 0 28.7402 0 27.1875V11.25ZM3.75 15.9375V17.8125C3.75 18.3281 4.17188 18.75 4.6875 18.75H6.5625C7.07812 18.75 7.5 18.3281 7.5 17.8125V15.9375C7.5 15.4219 7.07812 15 6.5625 15H4.6875C4.17188 15 3.75 15.4219 3.75 15.9375ZM12.1875 15C11.6719 15 11.25 15.4219 11.25 15.9375V17.8125C11.25 18.3281 11.6719 18.75 12.1875 18.75H14.0625C14.5781 18.75 15 18.3281 15 17.8125V15.9375C15 15.4219 14.5781 15 14.0625 15H12.1875ZM18.75 15.9375V17.8125C18.75 18.3281 19.1719 18.75 19.6875 18.75H21.5625C22.0781 18.75 22.5 18.3281 22.5 17.8125V15.9375C22.5 15.4219 22.0781 15 21.5625 15H19.6875C19.1719 15 18.75 15.4219 18.75 15.9375ZM4.6875 22.5C4.17188 22.5 3.75 22.9219 3.75 23.4375V25.3125C3.75 25.8281 4.17188 26.25 4.6875 26.25H6.5625C7.07812 26.25 7.5 25.8281 7.5 25.3125V23.4375C7.5 22.9219 7.07812 22.5 6.5625 22.5H4.6875ZM11.25 23.4375V25.3125C11.25 25.8281 11.6719 26.25 12.1875 26.25H14.0625C14.5781 26.25 15 25.8281 15 25.3125V23.4375C15 22.9219 14.5781 22.5 14.0625 22.5H12.1875C11.6719 22.5 11.25 22.9219 11.25 23.4375ZM19.6875 22.5C19.1719 22.5 18.75 22.9219 18.75 23.4375V25.3125C18.75 25.8281 19.1719 26.25 19.6875 26.25H21.5625C22.0781 26.25 22.5 25.8281 22.5 25.3125V23.4375C22.5 22.9219 22.0781 22.5 21.5625 22.5H19.6875Z"
						fill="url(#paint0_linear_3214_9469)"
					/>
					<path
						className="_calenderValue1"
						d="M0 11.25H26.25V27.1875C26.25 28.7402 24.9902 30 23.4375 30H2.8125C1.25977 30 0 28.7402 0 27.1875V11.25ZM3.75 15.9375V17.8125C3.75 18.3281 4.17188 18.75 4.6875 18.75H6.5625C7.07812 18.75 7.5 18.3281 7.5 17.8125V15.9375C7.5 15.4219 7.07812 15 6.5625 15H4.6875C4.17188 15 3.75 15.4219 3.75 15.9375ZM12.1875 15C11.6719 15 11.25 15.4219 11.25 15.9375V17.8125C11.25 18.3281 11.6719 18.75 12.1875 18.75H14.0625C14.5781 18.75 15 18.3281 15 17.8125V15.9375C15 15.4219 14.5781 15 14.0625 15H12.1875ZM18.75 15.9375V17.8125C18.75 18.3281 19.1719 18.75 19.6875 18.75H21.5625C22.0781 18.75 22.5 18.3281 22.5 17.8125V15.9375C22.5 15.4219 22.0781 15 21.5625 15H19.6875C19.1719 15 18.75 15.4219 18.75 15.9375ZM4.6875 22.5C4.17188 22.5 3.75 22.9219 3.75 23.4375V25.3125C3.75 25.8281 4.17188 26.25 4.6875 26.25H6.5625C7.07812 26.25 7.5 25.8281 7.5 25.3125V23.4375C7.5 22.9219 7.07812 22.5 6.5625 22.5H4.6875ZM11.25 23.4375V25.3125C11.25 25.8281 11.6719 26.25 12.1875 26.25H14.0625C14.5781 26.25 15 25.8281 15 25.3125V23.4375C15 22.9219 14.5781 22.5 14.0625 22.5H12.1875C11.6719 22.5 11.25 22.9219 11.25 23.4375ZM19.6875 22.5C19.1719 22.5 18.75 22.9219 18.75 23.4375V25.3125C18.75 25.8281 19.1719 26.25 19.6875 26.25H21.5625C22.0781 26.25 22.5 25.8281 22.5 25.3125V23.4375C22.5 22.9219 22.0781 22.5 21.5625 22.5H19.6875Z"
						fill="url(#paint0_linear_3214_9469)"
					/>
					<path
						className="_calendarboard"
						d="M9.375 1.875C9.375 0.837891 8.53711 0 7.5 0C6.46289 0 5.625 0.837891 5.625 1.875V3.75H2.8125C1.25977 3.75 0 5.00977 0 6.5625V11.25H26.25V6.5625C26.25 5.00977 24.9902 3.75 23.4375 3.75H20.625V1.875C20.625 0.837891 19.7871 0 18.75 0C17.7129 0 16.875 0.837891 16.875 1.875V3.75H9.375V1.875Z"
						fill="url(#paint1_linear_3214_9469)"
						z-index={-2}
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9469"
							x1="13.125"
							y1="11.25"
							x2="13.125"
							y2="30"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#99D1FA" />
							<stop offset="1" stopColor="#1D96F1" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9469"
							x1="13.125"
							y1="0"
							x2="13.125"
							y2="11.25"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'calendarHeader',
			displayName: 'Calendar Header',
			description: 'Calendar Header',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarBodyMonths',
			displayName: 'Calendar Body Months',
			description: 'Calendar Body Months',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarBodyBrowseYears',
			displayName: 'Calendar Body Browse Years',
			description: 'Calendar Body Browse Years',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarBodyBrowseMonths',
			displayName: 'Calendar Body Browse Months',
			description: 'Calendar Body Browse Months',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarHeaderTitle',
			displayName: 'Calendar Header Title',
			description: 'Calendar Header Title',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarHeaderMonthsContainer',
			displayName: 'Calendar Months Container Above Month',
			description: 'Calendar Months Container Above Month',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarHeaderMonths',
			displayName: 'Calendar Month Above Month',
			description: 'Calendar Month Above Month',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendar',
			displayName: 'Calendar Body Container',
			description: 'Calendar Body Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftArrow',
			displayName: 'Left Arrow',
			description: 'Left Arrow',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftArrowImage',
			displayName: 'Left Arrow Image',
			description: 'Left Arrow Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightArrow',
			displayName: 'Right Arrow',
			description: 'Right Arrow',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightArrowImage',
			displayName: 'Right Arrow Image',
			description: 'Right Arrow Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'weekName',
			displayName: 'Week Name',
			description: 'Week Name',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'month',
			displayName: 'Month',
			description: 'Month',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'date',
			displayName: 'Date',
			description: 'Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'monthName',
			displayName: 'Month Name',
			description: 'Month Name',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'yearNumber',
			displayName: 'Year Number',
			description: 'Year Number',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'prevNextMonthDate',
			displayName: 'Prev Next Month Date',
			description: 'Prev Next Month Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'todayDate',
			displayName: 'Today Date',
			description: 'Today Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedDate',
			displayName: 'Selected Date',
			description: 'Selected Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'emptyDate',
			displayName: 'Empty Date',
			description: 'Empty Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'weekendLowLightDate',
			displayName: 'Weekend Low Light Date',
			description: 'Weekend Low Light Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'weekNumber',
			displayName: 'Week Number',
			description: 'Week Number',
			icon: 'fa-solid fa-box',
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
			displayName: 'Asterisk',
			description: 'Asterisk',
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

			let props = makePropertiesObject(
				propertiesDefinition,
				def.properties,
				locationHistory,
				pageExtractor ? [pageExtractor] : [],
			);

			let { storageFormat, displayDateFormat, multipleDateSeparator } = props;

			if (!storageFormat) storageFormat = displayDateFormat;

			let dates = ('' + value)
				.split(multipleDateSeparator)
				.map(e => getValidDate(e, storageFormat!))
				.map(e => validateWithProps(e, props as CalendarValidationProps));

			if (dates.findIndex(e => isNullValue(e)) != -1) return [validation.message];

			return [];
		},
	},
};

export default component;
