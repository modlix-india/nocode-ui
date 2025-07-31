import { isNullValue } from '@fincity/kirun-js';
import React, { FocusEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CommonInputText from '../../commonComponents/CommonInputText';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './calendarProperties';
import { CalendarMap } from './components/CalendarMap';
import {
	getValidDate,
	toFormat,
	validateRangesAndSetData,
	zeroHourDate,
} from './components/calendarFunctions';
import { CalendarValidationProps } from './components/calendarTypes';

export default function CalendarComponent(props: Readonly<ComponentProps>) {
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
			supportingText,
			editRequestIcon,
			editConfirmIcon,
			editCancelIcon,
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
	const [thisDate, setThisDateOriginal] = useState<string | undefined>();
	// That date is from date if the date type is endDate and to date if the date type is startDate
	const [thatDate, setThatDate] = useState<string | undefined>();

	const setThisDate = useCallback(
		(v: string | undefined) => {
			// console.log('setThisDate', v);
			setThisDateOriginal(v);
		},
		[setThisDateOriginal],
	);

	const [showDropdown, setShowDropdown] = useState(false);
	const [mouseIsInside, setMouseIsInside] = useState(false);
	const [focus, setFocus] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);

	const [browsingMonthYear, setBrowsingMonthYear] = useState<string>('');

	const editOn = calendarDesignType === '_defaultCalendar' && designType === '_editOnReq';
	const [editOnThisDate, setEditOnThisDate] = useState<string | undefined>();
	const [editOnThatDate, setEditOnThatDate] = useState<string | undefined>();

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
				// console.log('bindingPathPath1', value);

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
		const typeofE = typeof e;
		const value: string =
			(typeofE === 'string' || typeofE === 'number' || typeofE === 'undefined'
				? e
				: e?.target?.value
			).toString() ?? '';

		let validatedAndSet = false;
		let shouldCloseDropdown = false;

		if (editOn) {
			if (value.trim() === '') {
				setThisDate(undefined);
				setThatDate(undefined);
			} else {
				if (isMultiSelect || bindingPathPath2) {
					const values = value.split(multipleDateSeparator);
					let dates = values
						.map(e => e.trim())
						.map(v =>
							toFormat(v, displayDateFormat, storageFormat ?? displayDateFormat),
						);

					if (dates?.indexOf(undefined) != -1) {
						setThisDate(value);
						return;
					}
					if (isMultiSelect && dates.length === 1) {
						setThisDate(dates[0]?.toString());
						shouldCloseDropdown = true;
					} else {
						if (dates.length === 1) {
							(dateType === 'startDate' ? setThisDate : setThatDate)(
								dates[0]?.toString(),
							);
						} else if (dates.length > 1) {
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
							(dateType === 'startDate' ? setThisDate : setThatDate)(
								dates[0]?.toString(),
							);
							(dateType === 'startDate' ? setThatDate : setThisDate)(
								dates[1]?.toString(),
							);
						}
						shouldCloseDropdown = true;
					}
				} else {
					const date = toFormat(
						value,
						displayDateFormat,
						storageFormat ?? displayDateFormat,
					);

					setThisDate(value);
					shouldCloseDropdown = true;
				}
			}
		} else {
			let currentBindingPath = dateType === 'startDate' ? bindingPathPath1 : bindingPathPath2;
			if (!currentBindingPath) return;

			if (value.trim() === '') {
				if (!thisDate) return;
				validatedAndSet = validateRangesAndSetData(
					currentBindingPath,
					undefined,
					context.pageName,
					validationProps,
				);
				if (validatedAndSet && close) {
					shouldCloseDropdown = true;
				}
			} else {
				if (isMultiSelect || bindingPathPath2) {
					const values = value.split(multipleDateSeparator);
					let dates = values
						.map(e => e.trim())
						.map(v =>
							toFormat(v, displayDateFormat, storageFormat ?? displayDateFormat),
						);

					if (dates?.indexOf(undefined) != -1) {
						setThisDate(value);
						return;
					}
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
										start.getTime() +
											minNumberOfDaysInRange * 24 * 60 * 60 * 1000,
									);
								}

								if (maxNumberOfDaysInRange && days > maxNumberOfDaysInRange) {
									end = new Date(
										start.getTime() +
											maxNumberOfDaysInRange * 24 * 60 * 60 * 1000,
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
						shouldCloseDropdown = true;
					}
				} else {
					const date = toFormat(
						value,
						displayDateFormat,
						storageFormat ?? displayDateFormat,
					);
					if (isNullValue(date)) {
						setThisDate(value);
						return;
					}

					validatedAndSet = validateRangesAndSetData(
						currentBindingPath,
						date,
						context.pageName,
						validationProps,
					);

					if (validatedAndSet && close) {
						shouldCloseDropdown = true;
					}
				}
			}
		}

		if (validatedAndSet && changeEvent) {
			(async () =>
				await runEvent(
					changeEvent,
					key,
					context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		}
		if (shouldCloseDropdown) {
			setShowDropdown(false);
			setFocus(false);
		}
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
				className={`comp compCalendar fullCalendar ${calendarDesignType} ${designType} ${colorScheme} ${lowLightWeekEnd ? '_lowLightWeekend' : ''}`}
				style={computedStyles?.comp ?? {}}
			>
				<HelperComponent context={context} definition={definition} />
				{calendar}
			</div>
		);
	}

	// console.log(thisDate, thatDate);
	// console.log(editOnThisDate, editOnThatDate);

	return (
		<CommonInputText
			id={key}
			cssPrefix={`comp compCalendar ${calendarDesignType} ${lowLightWeekEnd ? '_lowLightWeekend' : ''}`}
			noFloat={noFloat}
			readOnly={readOnly}
			value={thisDate ?? ''}
			label={editOn ? undefined : label}
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
			handleChange={
				disableTextEntry || readOnly || editOn ? undefined : e => handleChange(e, true)
			}
			onMouseEnter={() => setMouseIsInside(true)}
			onMouseLeave={() => {
				setMouseIsInside(false);
				if (closeOnMouseLeave) handleClose();
			}}
			showMandatoryAsterisk={
				showMandatoryAsterisk &&
				(validation ?? []).find((e: any) => e.type === undefined || e.type === 'MANDATORY')
			}
			supportingText={supportingText}
			editRequestIcon={editRequestIcon}
			editConfirmIcon={editConfirmIcon}
			editCancelIcon={editCancelIcon}
			showEditRequest={editOn}
			onEditRequest={(editMode, canceled) => {
				if (editMode) {
					setEditOnThisDate(thisDate);
					setEditOnThatDate(thatDate);
				} else {
					if (canceled) {
						setThisDate(editOnThisDate);
						setThatDate(editOnThatDate);
					} else {
						if (!bindingPathPath2 && bindingPathPath1) {
							validateRangesAndSetData(
								bindingPathPath1,
								thisDate,
								context.pageName,
								validationProps,
							);
						} else if (bindingPathPath2 && bindingPathPath1) {
							validateRangesAndSetData(
								bindingPathPath1,
								dateType === 'startDate' ? thisDate : thatDate,
								context.pageName,
								validationProps,
							);
							validateRangesAndSetData(
								bindingPathPath2,
								dateType === 'startDate' ? thatDate : thisDate,
								context.pageName,
								validationProps,
							);
						}
					}
				}
			}}
			editOnValueStoredInParent={true}
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
