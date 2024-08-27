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
	allowedChildrenType: new Map<string, number>([['', -1]]),
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
			name: 'rightArrow',
			displayName: 'Right Arrow',
			description: 'Right Arrow',
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
