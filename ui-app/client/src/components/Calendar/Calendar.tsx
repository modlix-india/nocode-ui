import { isNullValue } from "@fincity/kirun-js";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CommonInputText from "../../commonComponents/CommonInputText";
import {
  PageStoreExtractor,
  addListenerAndCallImmediately,
  getPathFromLocation,
  setData,
} from "../../context/StoreContext";
import {
  Component,
  ComponentPropertyDefinition,
  ComponentProps,
} from "../../types/common";
import { formatString } from "../../util/stringFormat";
import { processComponentStylePseudoClasses } from "../../util/styleProcessor";
import { validate } from "../../util/validationProcessor";
import { SubHelperComponent } from "../HelperComponents/SubHelperComponent";
import { IconHelper } from "../util/IconHelper";
import { days, formatDateTo, months, preprocess } from "../util/calendarUtil";
import useDefinition from "../util/useDefinition";
import { flattenUUID } from "../util/uuid";
import DropdownStyle from "./CalendarStyle";
import {
  propertiesDefinition,
  stylePropertiesDefinition,
} from "./calendarProperties";
import { styleDefaults } from "./calendarStyleProperties";

const typeOfDate = ["startDate", "endDate"];
const typeOfTemporal = ["_disableFuture"];

function CalendarComponent(props: ComponentProps) {
  const pageExtractor = PageStoreExtractor.getForContext(
    props.context.pageName
  );
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
      readOnly,
      dateFormat,
      placeholder,
      minDate,
      maxDate,
      designType,
      validation,
      noFloat,
      label,
      iconType,
      colorScheme,
      dateType,
      disableDates,
      disbaleDays,
      calendarDesignType,
      arrowButtonsHorizontalPlacement,
      disableTemporalRange,
      onlyDays,
    } = {},
    stylePropertiesWithPseudoStates,
  } = useDefinition(
    definition,
    propertiesDefinition,
    stylePropertiesDefinition,
    locationHistory,
    pageExtractor
  );

  const bindingPathPath = getPathFromLocation(
    bindingPath!,
    locationHistory,
    pageExtractor
  );
  const bindingPathPath1 = getPathFromLocation(
    bindingPath2!,
    locationHistory,
    pageExtractor
  );

  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [focus, setFocus] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [displayType, setDisplayType] = useState("day");
  const inputRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const dateValue = useMemo(
    () => new Date(typeOfDate?.includes(dateType) ? startDate : endDate),
    [dateType, startDate, endDate] // Get the initial date value converted to date object
  );
  const defaultValue = dateValue.setHours(0, 0, 0, 0);
  const DISABLE_TEMPORAL = typeOfTemporal?.includes(disableTemporalRange); // for disabling the future or past days
  const today = new Date().setHours(0, 0, 0, 0); // for getting todays date.
  const year = dateValue.getFullYear(),
    month = dateValue.getMonth(),
    day = dateValue.getDate();
  const disabledNext =
    (disableTemporalRange && DISABLE_TEMPORAL && defaultValue >= today) ||
    (maxDate ? defaultValue >= maxDate : false); // for disabling the next date button
  const disablePrev =
    (disableTemporalRange && !DISABLE_TEMPORAL && today >= defaultValue) ||
    (minDate ? minDate >= defaultValue : false); // fir disabling the previous date button

  function RightIcon({
    angle = 0,
    hideBackground = false,
    onClick,
    disabled,
  }: any) {
    return (
      <svg
        className="svgIcon"
        width="30"
        height="35"
        viewBox="0 0 44 45"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        transform={`rotate(${angle})`}
        onClick={onClick}
      >
        {hideBackground ? null : (
          <g filter="url(#filter0_d_2101_5231)">
            <circle
              cx="22"
              cy="20.5"
              r="20"
              fill={`${disabled ? "#F2F2F2" : "#fff"}`}
            />
            <circle
              cx="22"
              cy="20.5"
              r="19.5"
              stroke="black"
              strokeOpacity="0.05"
            />
          </g>
        )}
        <path
          d="M27.6339 20.1427C28.122 20.6169 28.122 21.3869 27.6339 21.8611L20.1353 29.1444C19.6471 29.6185 18.8543 29.6185 18.3661 29.1444C17.878 28.6702 17.878 27.9001 18.3661 27.426L24.982 21L18.37 14.574C17.8819 14.0999 17.8819 13.3298 18.37 12.8556C18.8582 12.3815 19.651 12.3815 20.1392 12.8556L27.6378 20.1389L27.6339 20.1427Z"
          fill="#333333"
          fillOpacity="0.8"
        />
        <defs>
          <filter
            id="filter0_d_2101_5231"
            x="0"
            y="0.5"
            width="44"
            height="44"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_2101_5231"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_2101_5231"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    );
  }

  function LeftIcon({ onClick, disabled = false }: any) {
    return <RightIcon angle={180} onClick={onClick} disabled={disabled} />;
  }

  function DownIcon({ onClick }: any) {
    return <RightIcon angle={90} hideBackground onClick={onClick} />;
  }

  function toggleState() {
    setDisplayType((prev) =>
      prev === "day" ? "year" : prev === "month" ? "day" : "month"
    );
  } // to toggle between the three calendar display types

  const computedStyles = processComponentStylePseudoClasses(
    props.pageDefinition,
    { focus, readOnly },
    stylePropertiesWithPseudoStates
  ); // computedStyles preprocessor

  const handleClose = useCallback(
    (e: any) => {
      if (calendarRef?.current && calendarRef?.current?.contains(e?.target))
        return;
      setShowCalendar(false);
      setFocus(false);
      inputRef?.current?.blur();
    },
    [showCalendar, setShowCalendar, setFocus, inputRef]
  );

  useEffect(() => {
    if (!showCalendar) return;
    document.addEventListener("mousedown", handleClose);
    return () => {
      document.removeEventListener("mousedown", handleClose);
    };
  }, [showCalendar, handleClose]);

  useEffect(() => {
    if (!bindingPathPath) return;

    addListenerAndCallImmediately(
      (_, value) => {
        if (isNullValue(value)) {
          setStartDate(formatDateTo(new Date()));
          return;
        }
        setStartDate(value);
      },
      pageExtractor,
      bindingPathPath
    );
  }, [pageExtractor, bindingPathPath]);

  useEffect(() => {
    if (!bindingPathPath1) return;

    addListenerAndCallImmediately(
      (_, value) => {
        if (isNullValue(value)) {
          setEndDate(formatDateTo(new Date()));
          return;
        }
        setEndDate(value);
      },
      pageExtractor,
      bindingPathPath1
    );
  }, [pageExtractor, bindingPathPath1]);

  useEffect(() => {
    if (!validation?.length) return;

    const msgs = validate(
      props.definition,
      props.pageDefinition,
      validation,
      dateValue,
      locationHistory,
      pageExtractor
    );
    setValidationMessages(msgs);

    setData(
      `Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
      msgs.length ? msgs : undefined,
      context.pageName,
      true
    );
    return () =>
      setData(
        `Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
        undefined,
        context.pageName,
        true
      );
  }, [startDate, endDate, validation]); // validation

  const handleClick = (value: any) => {
    let newValue = new Date(value);

    setData(
      typeOfDate.includes(dateType) ? bindingPathPath : bindingPathPath1,
      formatDateTo(newValue),
      context.pageName
    );
  }; // for position of calendar to open

  function disableTemporalFunc(currentDate: any) {
    return disableTemporalRange
      ? DISABLE_TEMPORAL
        ? currentDate > today
        : today > currentDate
      : false;
  }

  function isRangeFunc(utcCurrDate: any) {
    return minDate && maxDate
      ? utcCurrDate >= minDate && utcCurrDate <= maxDate
      : minDate
      ? utcCurrDate >= minDate
      : maxDate
      ? utcCurrDate <= maxDate
      : true;
  }

  const calendarRows: any = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let currentWeek: any = [];
  let currentDay = 1;

  for (let i = 0; i < firstDay.getDay(); i++)
    currentWeek.push(
      <td
        key={`empty_${i}`}
        className="date empty"
        style={computedStyles?.date}
      >
        <SubHelperComponent
          definition={props.definition}
          subComponentName="date"
        ></SubHelperComponent>
      </td>
    );

  while (currentDay <= lastDay.getDate()) {
    const isCurrentValue = currentDay === dateValue.getDate();
    const currentDate = new Date(year, month, currentDay);
    const isDisabled = disbaleDays?.includes(currentDate?.getDay()?.toString());
    const utcCurrDate = Date.UTC(year, month, currentDay);
    const isDateRange = isRangeFunc(utcCurrDate);
    const isTemporalDisabled = disableTemporalFunc(currentDate);

    const isDisabledDate = disableDates
      ?.split(", ")
      ?.some((date: any) => utcCurrDate == date);

    currentWeek.push(
      <td
        className={`date day_${currentDay} ${
          isCurrentValue ? "selected" : ""
        } ${
          isDisabled || isDisabledDate || isTemporalDisabled || !isDateRange
            ? "disabled"
            : ""
        }`}
        key={currentDay}
        onClick={() =>
          isDisabled || isDisabledDate || isTemporalDisabled || !isDateRange
            ? null
            : handleClick(currentDate)
        }
        style={computedStyles?.date}
      >
        <SubHelperComponent
          definition={props.definition}
          subComponentName="date"
        ></SubHelperComponent>
        {currentDay}
      </td>
    );

    if (currentWeek.length === 7) {
      calendarRows.push(<tr key={calendarRows.length}>{currentWeek}</tr>);
      currentWeek = [];
    }
    currentDay++;
  }
  while (currentWeek.length < 7) {
    currentWeek.push(
      <td
        key={`empty_${currentWeek.length}`}
        className="date empty"
        style={computedStyles?.date}
      >
        <SubHelperComponent
          definition={props.definition}
          subComponentName="date"
        ></SubHelperComponent>
      </td>
    );
  }

  calendarRows.push(<tr key={calendarRows.length}>{currentWeek}</tr>);

  let currentMonth = 0;
  let monthRow = [];
  const monthRows = [];

  while (currentMonth < months?.length) {
    const currentDate = new Date(year, currentMonth, day);
    const isCurrentValue = currentMonth === dateValue.getMonth();
    const utcCurrDate = Date.UTC(year, currentMonth, day);
    const isDateRange = isRangeFunc(utcCurrDate);
    const isTemporalDisabled = disableTemporalFunc(currentDate);
    monthRow.push(
      <td
        className={`date month_${currentMonth} ${
          isCurrentValue ? "selected" : ""
        } ${isTemporalDisabled || !isDateRange ? "disabled" : ""}`}
        key={currentMonth}
        onClick={() => {
          toggleState();
          handleClick(currentDate);
        }}
        style={computedStyles?.date}
      >
        <SubHelperComponent
          definition={props.definition}
          subComponentName="date"
        ></SubHelperComponent>
        {months[currentMonth]}
      </td>
    );

    if (monthRow.length === 3) {
      monthRows.push(<tr key={monthRows?.length}>{monthRow}</tr>);
      monthRow = [];
    }
    currentMonth++;
  }

  let currentYear = dateValue.getFullYear();
  let endYear = currentYear + 20;
  let yearRow = [];
  const yearRows = [];

  while (currentYear < endYear) {
    const currentDate = new Date(currentYear, month, day);
    const isCurrentValue = currentYear === dateValue.getFullYear();
    const utcCurrDate = Date.UTC(currentYear, month, day);
    const isDateRange = isRangeFunc(utcCurrDate);
    const isTemporalDisabled = disableTemporalFunc(currentDate);

    yearRow.push(
      <td
        className={`date year_${currentDay} ${
          isCurrentValue ? "selected" : ""
        } ${isTemporalDisabled || !isDateRange ? "disabled" : ""}`}
        key={currentYear}
        onClick={() => {
          handleClick(currentDate);
          toggleState();
        }}
        style={computedStyles?.date}
      >
        <SubHelperComponent
          definition={props.definition}
          subComponentName="date"
        ></SubHelperComponent>
        {currentYear}
      </td>
    );

    if (yearRow.length === 5) {
      yearRows.push(<tr key={yearRows.length}>{yearRow}</tr>);
      yearRow = [];
    }
    currentYear++;
  }

  const handleMove = (direction: number, value: Date) => {
    setData(
      typeOfDate.includes(dateType) ? bindingPathPath : bindingPathPath1,
      formatDateTo(
        new Date(
          displayType === "year"
            ? value.setFullYear(
                value.getFullYear() + (direction === -1 ? -19 : 19)
              )
            : direction === -1
            ? value.getMonth() === 0
              ? value.setFullYear(value.getFullYear() - 1, 11)
              : value.setMonth(value.getMonth() - 1)
            : value.getMonth() === 11
            ? value.setFullYear(value.getFullYear() + 1, 0)
            : value.setMonth(value.getMonth() + 1)
        )
      ),
      context.pageName
    );
  };

  const showChildren = (
    <>
      {displayType === "day" ? (
        <thead className="calendarHead" style={computedStyles?.calendarHead}>
          <tr className="calendarRow" style={computedStyles?.calendarRow}>
            {days?.map((e) => (
              <th key={e} className="date" style={computedStyles?.date}>
                <SubHelperComponent
                  definition={props.definition}
                  subComponentName="date"
                ></SubHelperComponent>
                {e}
              </th>
            ))}
          </tr>
        </thead>
      ) : null}
      <tbody className="calendarBody" style={computedStyles?.calendarBody}>
        {displayType === "day"
          ? calendarRows
          : displayType === "month"
          ? monthRows
          : yearRows}
      </tbody>
    </>
  );

  const Calendar = (
    <div className={`calendarPopOver ${calendarDesignType}`} ref={calendarRef}>
      <div
        className={`dateContainer ${arrowButtonsHorizontalPlacement}`}
        style={computedStyles?.dateContainer}
      >
        <SubHelperComponent
          definition={props.definition}
          subComponentName="dateContainer"
        ></SubHelperComponent>
        <span className="dateText" style={computedStyles?.dateText}>
          {formatString(
            preprocess(typeOfDate.includes(dateType) ? startDate : endDate),
            dateFormat
          )}
          {onlyDays ? null : <DownIcon onClick={toggleState} />}
        </span>
        <div
          className={`arrowButton ${arrowButtonsHorizontalPlacement}`}
          style={computedStyles?.arrowButton}
        >
          <SubHelperComponent
            definition={props.definition}
            subComponentName="arrowButton"
          ></SubHelperComponent>
          <LeftIcon
            disabled={disablePrev}
            onClick={() => {
              disablePrev ? null : handleMove(-1, dateValue);
            }}
          />
          <RightIcon
            disabled={disabledNext}
            onClick={() => {
              disabledNext ? null : handleMove(1, dateValue);
            }}
          />
        </div>
      </div>
      <table className="calendar" style={computedStyles?.calendar}>
        {showChildren}
      </table>
    </div>
  );

  const comp1 = (
    <CommonInputText
      id={key}
      key={key}
      cssPrefix="comp compCalendar"
      noFloat={noFloat}
      readOnly={readOnly}
      value={formatString(
        preprocess(typeOfDate.includes(dateType) ? startDate : endDate),
        dateFormat
      )}
      label={label}
      translations={translations}
      rightIcon={`fa-${iconType} fa-calendar`}
      valueType="text"
      isPassword={false}
      placeholder={placeholder}
      hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
      validationMessages={validationMessages}
      context={context}
      hideClearContentIcon={true}
      blurHandler={() => {
        setFocus(false);
      }}
      focusHandler={() => {
        setFocus(true);
        setShowCalendar(true);
      }}
      autoComplete="off"
      styles={computedStyles}
      inputRef={inputRef}
      definition={props.definition}
      designType={designType}
      colorScheme={colorScheme}
    >
      {showCalendar ? Calendar : undefined}
    </CommonInputText>
  );

  return calendarDesignType?.startsWith("_fullCalendar") ? (
    <div className="comp compCalendar">{Calendar}</div>
  ) : (
    comp1
  );
}

const component: Component = {
  name: "Calendar",
  displayName: "Calendar",
  description: "Calendar component",
  component: CalendarComponent,
  styleComponent: DropdownStyle,
  styleDefaults: styleDefaults,
  propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
  properties: propertiesDefinition,
  stylePseudoStates: ["hover", "focus", "disabled"],
  styleProperties: stylePropertiesDefinition,
  bindingPaths: {
    bindingPath: { name: "Start Date Binding" },
    bindingPath2: { name: "End Date Binding" },
  },
  defaultTemplate: {
    key: "",
    name: "Calendar",
    type: "Calendar",
    properties: {
      label: { value: "Calendar" },
    },
  },
  sections: [],
  subComponentDefinition: [
    {
      name: "",
      displayName: "Component",
      description: "Component",
      icon: (
        <IconHelper viewBox="0 0 24 24">
          <path
            d="M19.5289 1H4.49556C2.56444 1 1 2.56444 1 4.49556V19.5289C1 21.4356 2.56444 23 4.49556 23H19.5289C21.4356 23 23 21.4356 23 19.5289V4.49556C23 2.56444 21.4356 1 19.5289 1ZM18.4044 9.77556L11.2667 16.9133C11.0222 17.1578 10.7044 17.28 10.4111 17.28C10.1178 17.28 9.77556 17.1578 9.55556 16.9133L5.59556 12.9533C5.10667 12.4644 5.10667 17.2067 5.59556 16.7178C6.08444 16.2289 6.84222 16.2289 7.33111 16.7178L10.4356 19.8222L20.25 8.5625C20.7389 8.07361 17.9644 7.55111 18.4533 8.04C18.8933 8.52889 18.8933 9.31111 18.4044 9.77556Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M15.9746 6.13324C16.3155 6.13324 16.5002 6.53232 16.2795 6.79215L12.1219 11.6882C11.9633 11.8751 11.6754 11.8766 11.5148 11.6914L7.2681 6.79534C7.04346 6.53634 7.22743 6.13324 7.57027 6.13324L15.9746 6.13324Z"
            fill="currentColor"
          />
          <rect
            x="7.10938"
            y="15.5444"
            width="9.77778"
            height="1.22222"
            rx="0.611111"
            fill="currentColor"
          />
          <rect
            x="4.66797"
            y="18.1113"
            width="14.6667"
            height="1.22222"
            rx="0.611111"
            fill="currentColor"
          />
        </IconHelper>
      ),
      mainComponent: true,
    },
    {
      name: "dateContainer",
      displayName: "Calendar Container",
      description: "Calendar Container",
      icon: "fa-solid fa-box",
    },
    {
      name: "arrowButton",
      displayName: "Arrow Button Container",
      description: "Arrow Button Container",
      icon: "fa-solid fa-box",
    },
    {
      name: "date",
      displayName: "Calendar Column Container",
      description: "Calendar Column Container",
      icon: "fa-solid fa-box",
    },
  ],
};

export default component;
