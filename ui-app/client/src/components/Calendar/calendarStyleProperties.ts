import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'textBoxBorderErrorColor',
		cssProperty: 'border',
		displayName: "CalendarDiv's border color on error",
		description: "This color is used for calendarDiv's error border color.",
		defaultValue: '1px solid <form-input-border-error-color>',
		selector: '.calendarDiv.error',
	},
	{
		name: 'inputTextFontSize',
		cssProperty: 'font-size',
		displayName: 'textbox input text font size',
		description: "This textbox's font size is used for textbox's input text.",
		defaultValue: '13px',
		selector:
			'.calendarDiv .inputContainer .inputbox, .calendarDiv .calendarPopOver .calendarPopupDiv .buttonAndTimePicker .timePicker .container, .timePicker .container',
	},
	{
		name: 'inputTextFontSizeDropDown',
		cssProperty: 'font-size',
		displayName: 'textbox drop down input text font size',
		description: "This textbox's font size is used for textbox's input drop down text.",
		selector: '.timePicker .container .labelContainer .label',
	},
	{
		name: 'inputTextDropDownFontWeight',
		cssProperty: 'font-weight',
		displayName: 'textbox input text font weight',
		description: "This textbox's font weight is used for textbox's input font weight.",
		defaultValue: '400',
		selector: '.timePicker .container .dropdowncontainer .dropdownItem',
	},
	{
		name: 'textBoxBorderColorOnFocus',
		cssProperty: 'border',
		displayName: "textbox's border color on focus",
		description: "This color is used for textbox's focus border color.",
		selector:
			'.calendarDiv.focussed, .calendarDiv .calendarPopOver .calendarPopupDiv .buttonAndTimePicker .timePicker .container.focussed, .timePicker .container.focussed',
	},
	{
		name: 'calendarDivWidth',
		cssProperty: 'width',
		displayName: 'date and time input box width',
		description: 'This is used to indicate the width of the calendar input box',
		defaultValue: '100%',
		selector: '.calendarDiv',
	},
	{
		name: 'calendarDivBorderColor',
		cssProperty: 'border',
		displayName: "Calendar Input's border color",
		description: "This color is used for Calendar input's border color.",
		defaultValue: '1px solid <form-input-border-color>',
		selector: '.calendarDiv',
	},
	{
		name: 'calendarDivHeight',
		cssProperty: 'height',
		displayName: "Calendar Div's height",
		description: "This is for Calendar Div's height",
		defaultValue: '56px',
		selector: '.calendarDiv',
	},
	{
		name: 'calendarDivBorderRadius',
		cssProperty: 'border-radius',
		displayName: "Calendar Div's border radius",
		description: "This is for Calendar Div's border radius",
		defaultValue: '4px',
		selector: '.calendarDiv',
	},
	{
		name: 'textBox left icon self align',
		cssProperty: 'justify-self',
		displayName: "textbox's left icon self align",
		description: "This is for textbox's left icon self align",
		defaultValue: 'center',
		selector: '.calendarDiv .calendarIcon',
	},
	{
		name: 'calendarDiv Calendar icon padding',
		cssProperty: 'padding',
		displayName: 'CalendarDiv Calendar icon padding',
		description: "This is for Calendar icons's padding",
		defaultValue: '0',
		selector: '.calendarDiv .calendarIcon',
	},
	{
		name: 'calendarInputBoxContainerContentAlign',
		cssProperty: 'align-items',
		displayName: 'calendar input Container Content Align in the grid',
		description: "This align items is used for Calendar InoutBox's conatiner content align.",
		defaultValue: 'center',
		selector: '.calendarDiv',
	},
	{
		name: 'calendarPopupContainerPositionRight',
		cssProperty: 'right',
		displayName: 'calendar popup Container position right in the grid',
		description: 'This position right is used for Calendar popup conatiner positon right.',
		defaultValue: '0',
		selector: '.calendarDiv .calendarPopOver',
	},
	{
		name: 'calendarPopupContainerHeight',
		cssProperty: 'height',
		displayName: 'calendar popup Container height in the grid',
		description: 'This height is used for Calendar popup conatiner height.',
		defaultValue: '380px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv',
	},
	{
		name: 'calendarPopupContainerHeightForDateRange',
		cssProperty: 'height',
		displayName: 'calendar popup Container height in the grid',
		description: 'This height is used for Calendar popup conatiner height date range.',
		defaultValue: '400px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv.range',
	},
	{
		name: 'calendarPopupContainerWidth',
		cssProperty: 'width',
		displayName: 'calendar popup Container width in the grid',
		description: 'This width is used for Calendar popup conatiner width.',
		defaultValue: 'fit-content',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv',
	},
	{
		name: 'calendarPopupContainerDisplayGap',
		cssProperty: 'column-gap',
		displayName: 'calendar popup Container Display style in the grid',
		description: 'This display is used for Calendar popup conatiner display style.',
		defaultValue: '4px',
		selector: '.calendarDiv .calendarPopOver',
	},
	{
		name: 'calendarPopupContainerTimerContainerBorderRadius',
		cssProperty: 'border-radius',
		displayName: 'calendar popup timer Container border radius',
		description: 'This display is used for Calendar popup timer container border radius.',
		defaultValue: '4px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .buttonAndTimePicker .timePicker .container, .timePicker .container',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownZIndex',
		cssProperty: 'z-index',
		displayName: 'calendar popup Container Timer container dropdown z-index',
		description: 'This display is used for Calendar popup conatiner timer dropdown z-index.',
		defaultValue: '2',
		selector: '.timePicker .container .dropdowncontainer',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownItemAlign',
		cssProperty: 'text-align',
		displayName: 'calendar popup timer Container dropdown item align',
		description: 'This display is used for Calendar popup timer items align.',
		defaultValue: 'center',
		selector: '.timePicker .container .dropdowncontainer .dropdownItem',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownItemCursor',
		cssProperty: 'cursor',
		displayName: 'calendar popup Container timer dropdown items pointer',
		description:
			'This display is used for Calendar popup conatiner dropdown items cursor style.',
		defaultValue: 'pointer',
		selector: '.timePicker .container .dropdowncontainer .dropdownItem',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownItemPadding',
		cssProperty: 'padding',
		displayName: 'calendar popup Container dropdown items padding',
		description: 'This display is used for Calendar popup conatiner timer items padding.',
		defaultValue: '8px 0',
		selector: '.timePicker .container .dropdowncontainer .dropdownItem',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownItemHoverBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'calendar popup Container timer dropdown hover background color',
		description: 'This display is used for Calendar popup dropdown hover background color.',
		defaultValue: '#f5f5f5',
		selector: '.timePicker .container .dropdowncontainer .dropdownItem:hover',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownItemHoverFontColor',
		cssProperty: 'color',
		displayName: 'calendar popup Container timer dropdown hover font color',
		description: 'This display is used for Calendar popup dropdown hover font color.',
		selector: '.timePicker .container .dropdowncontainer .dropdownItem:hover',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownPositonFromTop',
		cssProperty: 'top',
		displayName: 'calendar popup Container Timer container position from top',
		description: 'This display is used for Calendar popup conatiner timer position from top.',
		defaultValue: '36px',
		selector: '.timePicker .container .dropdowncontainer',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownBorderColor',
		cssProperty: 'border',
		displayName: 'calendar popup Container timer dropdown border color',
		description:
			'This display is used for Calendar popup conatiner timer dropdown border color.',
		selector: '.timePicker .container .dropdowncontainer',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownBoxShadow',
		cssProperty: 'box-shadow',
		displayName: 'calendar popup Container timer dropdown box shadow',
		description: 'This display is used for Calendar popup conatiner timer dropdown box shadow.',
		defaultValue: '0 4px 6px 1px rgba(0, 0, 0, 0.1)',
		selector: '.timePicker .container .dropdowncontainer',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownWidth',
		cssProperty: 'width',
		displayName: 'calendar popup Container timer dropdown width',
		description: 'This display is used for Calendar popup timer dropdown width.',
		defaultValue: '60px',
		selector: '.timePicker .container .dropdowncontainer',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownBorderRadius',
		cssProperty: 'border-radius',
		displayName: 'calendar popup Container timer dropdown border radius',
		description:
			'This display is used for Calendar popup conatiner timer dropdown border radius.',
		defaultValue: '6px',
		selector: '.timePicker .container .dropdowncontainer',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'calendar popup Container Display style in the grid',
		description: 'This display is used for Calendar popup conatiner display style.',
		defaultValue: 'white',
		selector: '.timePicker .container .dropdowncontainer',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownFontColor',
		cssProperty: 'color',
		displayName: 'calendar popup Container Timer container font color',
		description: 'This display is used for Calendar popup timer container font color.',
		selector: '.timePicker .container .dropdowncontainer',
	},
	{
		name: 'calendarPopupContainerTimerContainerDropDownHeight',
		cssProperty: 'max-height',
		displayName: 'calendar popup Container popup timer dropdown max height',
		description: 'This display is used for Calendar popup conatiner timer max height.',
		defaultValue: '200px',
		selector: '.timePicker .container .dropdowncontainer',
	},
	{
		name: 'calendarPopupContainerTimerContainerBorder',
		cssProperty: 'border',
		displayName: 'calendar popup Container timer conatiner border',
		description: 'This display is used for Calendar popup timer container border style.',
		defaultValue: '1px solid <form-input-border-color>',
		selector: '.timePicker .container',
	},
	{
		name: 'calendarPopupContainerTimerContainerPaddinglabelContainer',
		cssProperty: 'padding',
		displayName: 'calendar popup Container timer dropdown label padding',
		description:
			'This display is used for Calendar popup conatiner timer dropdown label padding.',
		selector: '.timePicker .container .labelContainer',
	},
	{
		name: 'calendarPopupContainerTimerContainerPadding',
		cssProperty: 'padding',
		displayName: 'calendar popup Container timer container padding',
		description: 'This display is used for Calendar popup conatiner timer dropdown padding.',
		defaultValue: '0 16px',
		selector: '.timePicker .container',
	},
	{
		name: 'calendarPopupContainerTimerContainerGap',
		cssProperty: 'gap',
		displayName: 'calendar popup Container timer dropdown gap in flex',
		description: 'This display is used for Calendar popup timer dropdown flex gap style.',
		defaultValue: '4px',
		selector: '.timePicker',
	},
	{
		name: 'calendarPopupContainerTimerContainerDisabledBorderColor',
		cssProperty: 'border',
		displayName: 'calendar popup Container disabled border color',
		description: 'This display is used for Calendar popup disabled border style.',
		defaultValue: '1px solid <form-input-border-color>',
		selector: '.timePicker .container.disabled:hover',
	},
	{
		name: 'calendarPopupContainerTimerContainerDisabledBorderColorOnHover',
		cssProperty: 'border',
		displayName: 'calendar popup Container Timer container border color on hover',
		description: 'This display is used for Calendar timer container border color on hover.',
		selector: '.timePicker .container:hover',
	},
	{
		name: 'calendarPopupContainerTimerContainerDisabledBackgroundOpacity',
		cssProperty: 'opacity',
		displayName: 'calendar popup Container timer dropdown disabled background opacity',
		description:
			'This display is used for Calendar popup conatiner timer dropdown background opacity.',
		defaultValue: '.5',
		selector: '.timePicker .container .labelContainer.disabled',
	},
	{
		name: 'calendarPopupContainerTimerContainerDisabledCursor',
		cssProperty: 'cursor',
		displayName: 'calendar popup Container timer container disabled cursor',
		description: 'This display is used for Calendar popup timer container disabled style.',
		defaultValue: 'not-allowed',
		selector: '.timePicker .container .labelContainer.disabled',
	},
	{
		name: 'calendarPopupContainerTimerContainerHeight',
		cssProperty: 'height',
		displayName: 'calendar popup Container timer container height',
		description: 'This display is used for Calendar popup conatiner timer dropdown height.',
		defaultValue: '32px',
		selector: '.timePicker .container',
	},
	{
		name: 'calendarPopupContainerTimerContainerCursor',
		cssProperty: 'cursor',
		displayName: 'calendar popup Container timer cursor',
		description: 'This display is used for Calendar popup timer dropdown cursor style.',
		defaultValue: 'pointer',
		selector: '.timePicker .container .labelContainer .label',
	},
	{
		name: 'calendarPopupContainerTimerContainerLabelCursorDisabled',
		cssProperty: 'cursor',
		displayName: 'calendar popup Container timer dropdown label cursor on disabled.',
		description:
			'This display is used for Calendar container timer dropdown label cursor style when disabled.',
		defaultValue: 'not-allowed',
		selector: '.timePicker .container .labelContainer.disabled',
	},
	{
		name: 'calendarPopupContainerTimerContainerLabelOpacityDisabled',
		cssProperty: 'opacity',
		displayName: 'calendar popup Container timer container label opacity on disabled',
		description:
			'This display is used for Calendar popup conatiner timer dropdown label opacity when disabled.',
		defaultValue: '0.6',
		selector: '.timePicker .container .labelContainer.disabled',
	},
	{
		name: 'calendarPopupContainerDisplayZIndex',
		cssProperty: 'z-index',
		displayName: 'calendar popup Container Display z-index in the grid',
		description: 'This display is used for Calendar popup conatiner z index.',
		defaultValue: '1',
		selector: '.calendarDiv .calendarPopOver',
	},
	{
		name: 'calendarPopupContainerPositionLeft',
		cssProperty: 'left',
		displayName: 'calendar popup Container position Left in the grid',
		description: 'This position left is used for Calendar popup conatiner positon Left.',
		defaultValue: '',
		selector: '.calendarDiv .calendarPopOver',
	},
	{
		name: 'calendarPopupContainerPositionBottom',
		cssProperty: 'bottom',
		displayName: 'calendar popup Container position bottom in the grid',
		description: 'This position bottom is used for Calendar popup conatiner positon bottom.',
		selector: '.calendarDiv .calendarPopOver',
	},
	{
		name: 'calendarPopupContainerPositionTop',
		cssProperty: 'top',
		displayName: 'calendar popup Container position Top in the grid',
		description: 'This position top is used for Calendar popup conatiner positon Top.',
		defaultValue: '0',
		selector: '.calendarDiv .calendarPopOver',
	},
	{
		name: 'calendarPopupContainerMarginRight',
		cssProperty: 'margin-right',
		displayName: 'calendar popup Container margin right in the grid',
		description: 'This margin right is used for Calendar popup conatiner margin right.',
		selector: '.calendarDiv .calendarPopOver',
		defaultValue: '-600px',
	},
	{
		name: 'calendarPopupContainerMarginLeft',
		cssProperty: 'margin-left',
		displayName: 'calendar popup Container margin left in the grid',
		description: 'This margin left is used for Calendar popup conatiner margin left.',
		selector: '.calendarDiv .calendarPopOver',
	},
	{
		name: 'calendarPopupContainerMarginTop',
		cssProperty: 'margin-top',
		displayName: 'calendar popup Container margin top in the grid',
		description: 'This margin top is used for Calendar popup conatiner margin top.',
		defaultValue: '60px',
		selector: '.calendarDiv .calendarPopOver',
	},
	{
		name: 'calendarPopupContainerMarginBottom',
		cssProperty: 'margin-bottom',
		displayName: 'calendar popup Container margin left in the grid',
		description: 'This margin bottom is used for Calendar popup conatiner margin bottom.',
		selector: '.calendarDiv .calendarPopOver',
	},
	{
		name: 'calendarPopupContainerBoxShadow',
		cssProperty: 'box-shadow',
		displayName: 'calendar popup Container box shadow in the grid',
		description: 'This box shadow is used for Calendar popup conatiner box shadow style.',
		defaultValue: '1px 2px 8px hsl(0deg 0% 0% / 0.5)',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv',
	},
	{
		name: 'calendarPopupContainerBorderColor',
		cssProperty: 'border',
		displayName: 'calendar popup Container border style',
		description: 'This border is used for Calendar popup conatiner border style.',
		selector: '.calendarDiv .calendarPopOver',
	},
	{
		name: 'calendarPopupContainerBorderRadius',
		cssProperty: 'border-radius',
		displayName: 'calendar popup Container border radius in the grid',
		description: 'This border radius is used for Calendar popup conatiner border radius.',
		defaultValue: '10px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv',
	},
	{
		name: 'calendarPopupContainerwidth',
		cssProperty: 'width',
		displayName: 'calendar popup Container border width',
		description: 'This border radius is used for Calendar popup conatiner width.',
		defaultValue: '100%',
		selector: '.calendarDiv .calendarPopOver',
	},
	{
		name: 'calendarCurrentDateDisplayModuleJustifyzItems',
		cssProperty: 'justify-items',
		displayName: 'calendar popup Container justify items',
		description: 'This justify items is used for Calendar popup conatiner justify in flex.',
		defaultValue: 'flex-end',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv',
	},
	{
		name: 'calendarCurrentDateDisplayModuleBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'calendar popup Container background color',
		description:
			'This background color is used for Calendar popup conatiner background color style.',
		defaultValue: 'white',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv',
	},
	{
		name: 'calendarCurrentDateDisplayModuleHeaderBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'calendar popup Container background color of header in the grid',
		description: 'This background color is used for Calendar popup conatiner background color.',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarHeader',
	},
	{
		name: 'calendarCurrentDateDisplayModuleHeaderCursor',
		cssProperty: 'cursor',
		displayName: 'calendar popup Container cursor style of header in the grid',
		description: 'This cursor is used for Calendar popup conatiner cursor style for header.',
		selector: '.currentDateText',
		defaultValue: 'pointer',
	},
	{
		name: 'calendarCurrentDateDisplayModuleHeaderWidth',
		cssProperty: 'width',
		displayName: 'calendar popup Container Date Display header width',
		description: 'This width is used for Calendar popup date display header width.',
		defaultValue: '100%',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarHeader',
	},
	{
		name: 'calendarCurrentDateMainCardWidth',
		cssProperty: 'width',
		displayName: 'calendar popup Container Date Main Card width',
		description: 'This width is used for Calendar popup date Main Card width.',
		defaultValue: '100%',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarMainData',
	},
	{
		name: 'calendarCurrentDateMainCardHeight',
		cssProperty: 'height',
		displayName: 'calendar popup Container Date Main Card height',
		description: 'This height is used for Calendar popup date Main Card height.',
		defaultValue: '248px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarMainData',
	},
	{
		name: 'calendarCurrentDateDisplayModuleHeaderPaddingTop',
		cssProperty: 'padding-top',
		displayName: 'calendar popup Container Header pading top',
		description: 'This padding top is used for Calendar popup conatiner padding from top.',
		defaultValue: '10px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarHeader',
	},
	{
		name: 'calendarCurrentDateDisplayModuleHeaderPaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: 'calendar popup Container padding from bottom for header',
		description:
			'This margin left is used for Calendar popup conatiner padding from bottom for header.',
		defaultValue: '10px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarHeader',
	},
	{
		name: 'calendarCurrentDateDisplayModuleHeaderPaddingLeft',
		cssProperty: 'padding-left',
		displayName: 'calendar popup Container padding from left',
		description: 'This padding left is used for Calendar popup conatiner padding left.',
		defaultValue: '4px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarHeader',
	},
	{
		name: 'calendarCurrentDateDisplayModuleHeaderPaddingRight',
		cssProperty: 'padding-right',
		displayName: 'calendar popup Container padding right for header',
		description: 'This padding right is used for Calendar popup conatiner padding right.',
		defaultValue: '4px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarHeader',
	},
	{
		name: 'calendarCurrentDateDisplayModuleLeftHeaderIconPadding',
		cssProperty: 'padding',
		displayName: 'calendar popup Container padding for icon for header',
		description:
			'This padding is used for Calendar popup conatiner padding for icon for header.',
		defaultValue: '4px 0px 0px 4px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarHeader .iconLeft',
	},
	{
		name: 'calendarCurrentDateDisplayModuleRightIconPadding',
		cssProperty: 'padding',
		displayName: 'calendar popup Container padding right icon',
		description: 'This padding is used for Calendar popup conatiner right icon padding.',
		defaultValue: '4px 4px 0px 0px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarHeader .iconRight',
	},
	{
		name: 'calendarCurrentDateDisplayModuleLeftHeaderIconCuror',
		cssProperty: 'cursor',
		displayName: 'calendar popup Container cursor style for icon for header',
		description:
			'This padding is used for Calendar popup conatiner cursor style for icon for header.',
		defaultValue: 'pointer',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarHeader .iconLeft, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarHeader .iconRight',
	},
	{
		name: 'calendarCurrentDateDisplayModuleHeaderAlignContent',
		cssProperty: 'align-items',
		displayName: 'calendar popup Container header align content',
		description: 'This align items is used for Calendar popup conatiner header align content.',
		defaultValue: 'center',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarHeader',
	},
	{
		name: 'calendarPopupCalendarSelectedDateWidth',
		cssProperty: 'width',
		displayName: 'calendar popup Container selected date width',
		description: 'This wdith is used for Calendar popup conatiner selected date width.',
		defaultValue: '100%',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarSelectedDate',
	},
	{
		name: 'calendarPopupCalendarSelectedHeight',
		cssProperty: 'height',
		displayName: 'calendar popup Container selected date height',
		description: 'This height is used for Calendar popup conatiner selected date height.',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarSelectedDate',
	},
	{
		name: 'calendarPopupCalendarSelectedDateBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'calendar popup Container selected date background color',
		description:
			'This background is used for Calendar popup conatiner selected date background color.',
		defaultValue: '<main-font-color>',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarSelectedDate',
	},
	{
		name: 'calendarPopupCalendarSelectedDateFontColor',
		cssProperty: 'color',
		displayName: 'calendar popup Container selected date font color',
		description: 'This color is used for Calendar popup conatiner selected date font color.',
		defaultValue: '<light-font-color>',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarSelectedDate',
	},
	{
		name: 'calendarPopupCalendarSelectedDatepaddingTop',
		cssProperty: 'padding-top',
		displayName: 'calendar popup Container selected date padding from top',
		description:
			'This padding top is used for Calendar popup conatiner selected date padding from top.',
		defaultValue: '25px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarSelectedDate',
	},
	{
		name: 'calendarPopupCalendarSelectedDatepaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: 'calendar popup Container selected date padding from bottom',
		description:
			'This padding bottom is used for Calendar popup conatiner selected date padding from bottom.',
		defaultValue: '25px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarSelectedDate',
	},
	{
		name: 'calendarPopupContainerCalendarSelectedDate',
		cssProperty: 'text-align',
		displayName: 'calendar popup Container selected date align text',
		description:
			'This align text is used for Calendar popup conatiner selected date align text.',
		defaultValue: 'center',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarSelectedDate',
	},
	{
		name: 'calendarPopupMainCardPadding',
		cssProperty: 'padding',
		displayName: 'calendar popup Container main card padding',
		description: 'This padding is used for Calendar popup conatiner main card padding.',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard',
		defaultValue: '20px 20px 0px 20px',
	},
	{
		name: 'calendarPopupContainerMainCalendarPadding',
		cssProperty: 'padding',
		displayName: 'calendar popup Container main calendar compoenent padding',
		description:
			'This padding is used for Calendar popup conatiner main calendar component padding.',
		defaultValue: '8px 8px 8px 8px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol',
	},
	{
		name: 'calendarPopupContainerMainCalendarFontSize',
		cssProperty: 'font-size',
		displayName: 'calendar popup Container main conatiner font size',
		description:
			'This border radius is used for Calendar popup conatiner main calendar font size.',
		defaultValue: '13px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol, .calendarDiv .calendarPopOver .timePicker .items, .timePicker .items, .calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons',
	},
	{
		name: 'calendarPopupContainerMainCalendarFontColorHead',
		cssProperty: 'color',
		displayName: 'calendar popup Container header font color in the grid',
		description:
			'This header font colot is used for Calendar popup conatiner header font color.',
		defaultValue: '<main-font-color>',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard thead .calendarCol',
	},
	{
		name: 'calendarPopupContainerMainCalendarDatesWidth',
		cssProperty: 'width',
		displayName: 'calendar popup Container Main Calendar Dates Width',
		description: 'This header font colot is used for Calendar popup conatiner Dates Width.',
		defaultValue: '36px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol:not(.selectedDays):not(.selectedDayStart):not(.selectedDayEnd):not(.notAllowed), .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarRow .calendarCol.notAllowed',
	},
	{
		name: 'calendarPopupContainerMainCalendarDatesWidthForYear',
		cssProperty: 'width',
		displayName: 'calendar popup Container Main Calendar Dates Width for year',
		description:
			'This header font colot is used for Calendar popup conatiner Dates Width for year.',
		defaultValue: '50px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .yearSubDiv .calendarCol:not(.selectedDays):not(.selectedDayStart):not(.selectedDayEnd)',
	},
	{
		name: 'calendarPopupContainerMainCalendarDatesWidthForMonth',
		cssProperty: 'width',
		displayName: 'calendar popup Container Main Calendar Dates Width for year',
		description:
			'This header font colot is used for Calendar popup conatiner Dates Width for year.',
		defaultValue: '80px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .monthSubDiv .calendarCol:not(.selectedDays):not(.selectedDayStart):not(.selectedDayEnd)',
	},
	{
		name: 'calendarPopupContainerMainCalendarDatesBorderRadius',
		cssProperty: 'border-radius',
		displayName: 'calendar popup Container Main Calendar Dates border radius',
		description:
			'This header font colot is used for Calendar popup conatiner Dates border radius.',
		defaultValue: '24px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol:not(.selectedDays):not(.selectedDayStart):not(.selectedDayEnd):not(.notAllowed), .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarRow .calendarCol.notAllowed',
	},
	{
		name: 'calendarPopupContainerMainCalendarDatesBorderRadiusForYear',
		cssProperty: 'border-radius',
		displayName: 'calendar popup Container Main Calendar Dates border radius for year',
		description:
			'This header font colot is used for Calendar popup conatiner Dates border radius for year.',
		defaultValue: '12px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .yearSubDiv .calendarCol:not(.selectedDays):not(.selectedDayStart):not(.selectedDayEnd), .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .monthSubDiv',
	},
	{
		name: 'calendarPopupContainerMainCalendarDatesBorderTopRightRadius',
		cssProperty: 'border-top-right-radius',
		displayName: 'calendar popup Container Main Calendar Dates border top right radius',
		description:
			'This header font colot is used for Calendar popup conatiner Dates border top right radius.',
		defaultValue: '24px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol:not(.selectedDays).selectedDayEnd',
	},
	{
		name: 'calendarPopupContainerMainCalendarDatesBorderBottomRightRadius',
		cssProperty: 'border-bottom-right-radius',
		displayName: 'calendar popup Container Main Calendar Dates border bottom right radius',
		description:
			'This header font colot is used for Calendar popup conatiner Dates border bottom right radius.',
		defaultValue: '24px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol:not(.selectedDays).selectedDayEnd',
	},
	{
		name: 'calendarPopupContainerMainCalendarDatesBorderTopLeftRadius',
		cssProperty: 'border-top-left-radius',
		displayName: 'calendar popup Container Main Calendar Dates border top right radius',
		description:
			'This header font colot is used for Calendar popup conatiner Dates border top right radius.',
		defaultValue: '24px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol:not(.selectedDays).selectedDayStart',
	},
	{
		name: 'calendarPopupContainerMainCalendarDatesBorderBottomLeftRadius',
		cssProperty: 'border-bottom-left-radius',
		displayName: 'calendar popup Container Main Calendar Dates border bottom right radius',
		description:
			'This header font colot is used for Calendar popup conatiner Dates border bottom right radius.',
		defaultValue: '24px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol:not(.selectedDays).selectedDayStart',
	},
	{
		name: 'calendarPopupContainerMainCalendarDatesCursor',
		cssProperty: 'cursor',
		displayName: 'calendar popup Container Main Calendar Dates cursor',
		description: 'This header font colot is used for Calendar popup conatiner Dates cursor.',
		defaultValue: 'pointer',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol:not(.selectedDays):not(.selectedDayStart):not(.selectedDayEnd):not(.notAllowed), .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .yearSubDiv .calendarCol:not(.selectedDays):not(.selectedDayStart):not(.selectedDayEnd), .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol.selectedDays:not(.selectedDayStart):not(.selectedDayEnd), .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol:not(.selectedDays).selectedDayStart, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol:not(.selectedDays).selectedDayEnd, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .monthSubDiv ',
	},
	{
		name: 'calendarPopupContainerMainCalendarDatesTextAlign',
		cssProperty: 'text-align',
		displayName: 'calendar popup Container Main Calendar Dates text align',
		description:
			'This header font colot is used for Calendar popup conatiner Dates text align.',
		defaultValue: 'center',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol:not(.selectedDays):not(.selectedDayStart):not(.selectedDayEnd):not(.notAllowed), .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .yearSubDiv .calendarCol:not(.selectedDays):not(.selectedDayStart):not(.selectedDayEnd), .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol.selectedDays:not(.selectedDayStart):not(.selectedDayEnd), .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol:not(.selectedDays).selectedDayStart, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol:not(.selectedDays).selectedDayEnd, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarRow .calendarCol.notAllowed, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .monthSubDiv ',
	},
	{
		name: 'calendarPopupContainerMainCalendarFontColor',
		cssProperty: 'color',
		displayName: 'calendar popup Container main calendar font color in the grid',
		description:
			'This header font colot is used for Calendar popup conatiner main calendar font color.',
		defaultValue: '<main-font-color>',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard tbody .calendarCol:not(.selectedDayStart):not(.selectedDayEnd):not(.selectedDay), .calendarDiv .calendarPopOver .timePicker .items',
	},
	{
		name: 'calendarPopupContainerMainCalendarSelectedDayBackgroundColorStartEnddDate',
		cssProperty: 'background-color',
		displayName:
			'calendar popup Container background color for selected start date and end date',
		description:
			'This backgroun color is used for Calendar popup conatiner selected start date and end date background Color.',
		defaultValue: '<main-font-color>',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol.selectedDayStart, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol.selectedDayEnd, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol.selectedDay',
	},
	{
		name: 'calendarPopupContainerMainCalendarSelectedDayBackgroundColorMiddleDate',
		cssProperty: 'background-color',
		displayName:
			'calendar popup Container background color for selected middle date in date range',
		description:
			'This background color is used for Calendar popup conatiner selected middle color in date range.',
		defaultValue: '#f5f5f5',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol.selectedDays',
	},
	{
		name: 'calendarPopupContainerMainCalendarSelectedDayFontColorStartEndDate',
		cssProperty: 'color',
		displayName: 'calendar popup Container selected font color for start date and end date',
		description:
			'This font color is used for Calendar popup conatiner start date and end date.',
		defaultValue: '<light-font-color>',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol.selectedDayStart, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol.selectedDayEnd, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol.selectedDay',
	},
	{
		name: 'calendarPopupContainerMainCalendarSelectedDayBackgroundColorOnHover',
		cssProperty: 'background-color',
		displayName: 'calendar popup Container background color on hover for not selected days',
		description:
			'This background olor is used for Calendar popup conatiner background color for non selected days.',
		defaultValue: '#f5f5f5',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarRow td:hover:not(.selectedDays):hover:not(.selectedDayStart):not(.selectedDayEnd):not(.selectedDay):not(.notVisible):not(.notAllowed)',
	},
	{
		name: 'calendarPopupContainerTimePickerContentWidth',
		cssProperty: 'width',
		displayName: 'calendar popup Container timer picker width',
		description: 'This width is used for Calendar popup conatiner timer picker width.',
		defaultValue: '100%',
		selector: '.calendarDiv .calendarPopOver .buttonAndTimePicker',
	},
	{
		name: 'calendarPopupContainerTimePickerFlexDirection',
		cssProperty: 'flex-direction',
		displayName: 'calendar popup Container timer picker flex direction',
		description:
			'This flex direction is used for Calendar popup conatiner flex direction for time picker.',
		selector: '.calendarDiv .calendarPopOver .buttonAndTimePicker',
	},
	{
		name: 'calendarPopupContainerTimePickerContentJustify',
		cssProperty: 'justify-content',
		displayName: 'calendar popup Container content place in flex',
		description:
			'This justify content is used for Calendar popup conatiner content justify in flex.',
		defaultValue: 'space-between',
		selector: '.calendarDiv .calendarPopOver .buttonAndTimePicker',
	},
	{
		name: 'calendarPopupContainerCursorDisabled',
		cssProperty: 'cursor',
		displayName: 'calendar popup Container cursor when disabled',
		description:
			'This justify content is used for Calendar popup conatiner cursor when disabled.',
		defaultValue: 'not-allowed',
		selector:
			'.calendarDiv.disabled, .calendarDiv input:disabled, .calendarDiv .calendarIcon.disabled, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarRow .calendarCol.notAllowed',
	},
	{
		name: 'calendarPopupContainerTimePickerGap',
		cssProperty: 'gap',
		displayName: 'calendar popup Container gap in flex',
		description: 'This justify content is used for Calendar popup conatiner gap in flex.',
		defaultValue: '20px',
		selector: '.calendarDiv .calendarPopOver .buttonAndTimePicker',
	},
	{
		name: 'calendarPopupContainerTimePickerMainContainerPadding',
		cssProperty: 'padding',
		displayName: 'calendar popup Container border time picker container padding',
		description: 'This padding is used for Calendar popup conatiner timer picker padding.',
		defaultValue: '0px 20px 12px 20px',
		selector: '.calendarDiv .calendarPopOver .buttonAndTimePicker',
	},
	{
		name: 'calendarPopupContainerTimePickerContentWidthRange',
		cssProperty: 'width',
		displayName: 'calendar popup Container time picker content width for range',
		description:
			'This width is used for Calendar popup conatiner timer picker width for range date.',
		defaultValue: '100%',
		selector: '.calendarDiv .calendarPopOver .buttonAndTimePickerRange',
	},
	{
		name: 'calendarPopupContainerTimePickerFlexDirectionRange',
		cssProperty: 'flex-direction',
		displayName: 'calendar popup Container date range flex diretion',
		description:
			'This flex direction is used for Calendar popup conatiner date range flex direction.',
		selector: '.calendarDiv .calendarPopOver .buttonAndTimePickerRange',
	},
	{
		name: 'calendarPopupContainerTimePickerContentJustifyRange',
		cssProperty: 'justify-content',
		displayName: 'calendar popup Container time picker justify for range',
		description: 'This justfiy content is used for Calendar popup conatiner justify content.',
		defaultValue: 'flex-end',
		selector: '.calendarDiv .calendarPopOver .buttonAndTimePickerRange',
	},
	{
		name: 'calendarPopupContainerTimePickerMainContainerPaddingRange',
		cssProperty: 'padding',
		displayName: 'calendar popup Container main container padding for range',
		description:
			'This padding is used for Calendar popup conatiner main padding for date range.',
		defaultValue: '0px 20px 12px 20px',
		selector: '.calendarDiv .calendarPopOver .buttonAndTimePickerRange',
	},
	{
		name: 'calendarPopupContainerTimePickerPadding',
		cssProperty: 'padding',
		displayName: 'calendar popup Container timer picker padding',
		description: 'This padding is used for Calendar popup conatiner time picker padding.',
		defaultValue: '0px 0px 0px 0px',
		selector: '.calendarDiv .calendarPopOver .timePicker, .timePicker',
	},
	{
		name: 'calendarPopupContainerTimePickerPaddingEach',
		cssProperty: 'padding',
		displayName: 'calendar popup Container padding for each label',
		description:
			'This padding is used for Calendar popup conatiner time picker padding for each label.',
		defaultValue: '8px 8px 8px 8px',
		selector: '.calendarDiv .calendarPopOver .timePicker .items, .timePicker .items',
	},
	{
		name: 'calendarPopupContainerTimePickerPaddingEachHover',
		cssProperty: 'background-color',
		displayName: 'calendar popup Container time picker padding each on hover',
		description: 'This background is used for Calendar popup conatiner padding each on hover.',
		defaultValue: '#f5f5f5',
		selector:
			'.calendarDiv .calendarPopOver .timePicker .items:hover, .timePicker .items:hover',
	},
	{
		name: 'calendarPopupContainerTimePickerBorderRadius',
		cssProperty: 'border-radius',
		displayName: 'calendar popup Container time picker border radius in the grid',
		description:
			'This border radius is used for Calendar popup conatiner border radius for time picker.',
		defaultValue: '10px',
		selector: '.calendarDiv .calendarPopOver .timePicker, .timePicker',
	},
	{
		name: 'calendarPopupContainerTimePickerBorderPadding',
		cssProperty: 'padding',
		displayName: 'calendar popup Container timer picker body padding',
		description: 'This padding is used for Calendar popup conatiner body padding.',
		defaultValue: '10px 0px 10px 0px',
		selector:
			'.calendarDiv .calendarPopOver .timePicker .timePickerBody, .timePicker .timePickerBody',
	},
	{
		name: 'calendarPopupBottomButton',
		cssProperty: 'display',
		displayName: 'calendar popup Container bottom button dislpay',
		description:
			'This display is used for Calendar popup conatiner bottom button display style.',
		defaultValue: 'flex',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons',
	},
	{
		name: 'calendarPopupBottomButtonGap',
		cssProperty: 'gap',
		displayName: 'calendar popup Container flex fap for button',
		description: 'This gap is used for Calendar popup conatiner flex gap for bottom button.',
		defaultValue: '2px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons',
	},
	{
		name: 'calendarPopupBottomButtonAlignItems',
		cssProperty: 'align-items',
		displayName: 'calendar popup Container bottom button align',
		description:
			'This align items is used for Calendar popup conatiner bottombutton align items in flex.',
		defaultValue: 'center',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons',
	},
	{
		name: 'calendarPopupBottomButtonPadding',
		cssProperty: 'padding',
		displayName: 'calendar popup Container bottom button padding',
		description: 'This padding is used for Calendar popup conatiner bottom button padding.',
		defaultValue: '0px 0px 0px 0px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons',
	},
	{
		name: 'calendarPopupBottomButtonFontColorCancel',
		cssProperty: 'color',
		displayName: 'calendar popup Container bottom buttton cancel font color',
		description:
			'This color is used for Calendar popup conatiner bottom button cancel font color.',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons ,buttonCancel',
		defaultValue: '<light-font-color>',
	},
	{
		name: 'calendarPopupBottomButtonFontColorConfirm',
		cssProperty: 'color',
		displayName: 'calendar popup Container bottom button confitm font color',
		description: 'This color is used for Calendar popup conatiner bottom button font color.',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonConfirm',
		defaultValue: '<light-font-color>',
	},
	{
		name: 'calendarPopupBottomButtonFontBackgroundColorConfirm',
		cssProperty: 'background-color',
		displayName: 'calendar popup Container backgrounc color for confirm button',
		description:
			'This background color is used for Calendar popup conatiner confirm button background color.',
		defaultValue: '<main-font-color>',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonConfirm',
	},
	{
		name: 'calendarPopupBottomButtonFontBackgroundColorCancel',
		cssProperty: 'background-color',
		displayName: 'calendar popup Container background color for cancel button',
		description:
			'This bacjkground color is used for Calendar popup conatiner bottom button cancel background color.',
		defaultValue: '#631222',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonCancel',
	},
	{
		name: 'calendarPopupBottomEachButtonPaddingCancel',
		cssProperty: 'padding',
		displayName: 'calendar popup Container padding for bottom button cancel padding',
		description:
			'This padding is used for Calendar popup conatiner bottom button padding for cancel.',
		defaultValue: '4px 12px 4px 12px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonCancel',
	},
	{
		name: 'calendarPopupBottomEachButtonPaddingConfirm',
		cssProperty: 'padding',
		displayName: 'calendar popup Container bottom button confitm padding',
		description:
			'This padding is used for Calendar popup conatiner bottom button padding for confirm.',
		defaultValue: '4px 12px 4px 12px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonConfirm',
	},
	{
		name: 'calendarPopupBottomEachButtonHover',
		cssProperty: 'opacity',
		displayName: 'calendar popup Container bottom button on hover opacity',
		description:
			'This opacity is used for Calendar popup conatiner on hover opacoty for each button.',
		defaultValue: '0.8',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonConfirm:hover, .calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonCancel:hover',
	},
	{
		name: 'calendarPopupBottomEachButtonBorderRadius',
		cssProperty: 'border-radius',
		displayName: 'calendar popup Container border radius for each bottom button border',
		description:
			'This border radius is used for Calendar popup conatiner each bottom button border radius.',
		defaultValue: '4px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonConfirm, .calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonCancel',
	},
	{
		name: 'calendarPopupBottomEachButtonBorderCursor',
		cssProperty: 'cursor',
		displayName: 'calendar popup Container each bottom button cursor',
		description:
			'This cursor is used for Calendar popup conatiner each bottom button cursor style.',
		defaultValue: 'pointer',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonConfirm, .calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonCancel',
	},
	{
		name: 'calendarPopupBottomEachButtonHoverOnClick',
		cssProperty: 'background-color',
		displayName:
			'calendar popup Container botttom buttton background color on active for confirm',
		description:
			'This background color is used for Calendar popup conatiner bottom button background on active for confirm.',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonConfirm:active',
	},
	{
		name: 'calendarPopupBottomEachButtonHoverOnClick',
		cssProperty: 'background-color',
		displayName: 'calendar popup Container bottom button background color on active for cancel',
		description:
			'This background color is used for Calendar popup conatiner background color on active for cancel.',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonCancel:active',
	},
	{
		name: 'calendarPopupBottomEachButtonConfirmBorderColor',
		cssProperty: 'border',
		displayName: 'calendar popup Container bottom button border color for confirm',
		description: 'This border is used for Calendar popup conatiner border color for confirm.',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonConfirm',
	},
	{
		name: 'calendarPopupBottomEachButtonCancelBorderColor',
		cssProperty: 'border',
		displayName: 'calendar popup Container bottom button border color for cancel',
		description: 'This border is used for Calendar popup conatiner border color for cancel.',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .bottomButtons .buttonCancel',
	},
	{
		name: 'calendarPopupInputContainerGap',
		cssProperty: 'gap',
		displayName: 'calendar popup Container flex gap',
		description: 'This gap is used for Calendar popup conatiner flex gap.',
		defaultValue: '10px',
		selector: '.calendarDiv .inputContainer',
	},
	{
		name: 'calendarPopupInputContainerCalendarIcon',
		cssProperty: 'cursor',
		displayName: 'calendar popup Container Calendar Icon Cursor pointer',
		description: 'This calendar icon is used for Calendar popup conatiner icon cursor style.',
		defaultValue: 'pointer',
		selector: '.calendarDiv .calendarIcon:not(.disabled)',
	},
	{
		name: 'calendarPopupInputContainerCalendarDisabled',
		cssProperty: 'color',
		displayName: 'calendar popup Container Calendar Disabled color when disabled',
		description: 'This color is used for Calendar popup conatiner color when disabled.',
		defaultValue: '<form-input-text-color-when-disabled>',
		selector:
			'.calendarDiv.disabled, .calendarDiv input:disabled, .calendarDiv .calendarIcon.disabled',
	},
	{
		name: 'calendarPopupInputContainerCalendarMainCardWrapperGridGap',
		cssProperty: 'gap',
		displayName: 'calendar popup Container Calendar main card wrapper grid gap',
		description: 'This gap is used for Calendar popup conatiner wrapper grid gap.',
		defaultValue: '20px',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .caldendarMainCardWrapper',
	},
	{
		name: 'calendarPopupInputContainerCalendarTimePickerItemsAlign',
		cssProperty: 'text-align',
		displayName: 'calendar popup Container Calendar main card time picker items item align',
		description: 'This text align is used for Calendar popup conatiner time picker item align.',
		defaultValue: 'center',
		selector: '.calendarDiv .calendarPopOver .timePicker .items, .timePicker .items',
	},
	{
		name: 'calendarPopupInputContainerCalendarYearPickerGridArrangment',
		cssProperty: 'grid-template-columns',
		displayName: 'calendar popup Container Calendar main card year picker grid arrangment',
		description:
			'This grid template columns is used for Calendar popup conatiner year picker grid arrangment.',
		defaultValue: 'repeat(5, 1fr)',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarRow.yearDropDown',
	},
	{
		name: 'calendarPopupInputContainerCalendarMonthPickerGridArrangment',
		cssProperty: 'grid-template-columns',
		displayName: 'calendar popup Container Calendar main card month picker grid arrangment',
		description:
			'This grid template columns is used for Calendar popup conatiner month picker grid arrangment.',
		defaultValue: 'repeat(3, 1fr)',
		selector:
			'.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarRow.monthDropDown',
	},
	{
		name: 'calendarPopupInputContainerCalendarYearPickerHeight',
		cssProperty: 'height',
		displayName:
			'calendar popup Container Calendar main card year and month picker height arrangment',
		description:
			'This height is used for Calendar popup conatiner month picker and year picker height arrangment.',
		defaultValue: '205px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .yearSubDiv',
	},
	{
		name: 'calendarPopupInputContainerCalendarMonthPickerHeight',
		cssProperty: 'height',
		displayName:
			'calendar popup Container Calendar main card year and month picker height arrangment',
		description:
			'This height is used for Calendar popup conatiner month picker and year picker height arrangment.',
		defaultValue: '205px',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .monthSubDiv',
	},
	{
		name: 'calendarPopupInputContainerCalendarYearPickerDisplay',
		cssProperty: 'display',
		displayName:
			'calendar popup Container Calendar main card year and month picker display arrangment',
		description:
			'This height is used for Calendar popup conatiner month picker and year picker display arrangment.',
		defaultValue: 'grid',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .yearSubDiv',
	},
	{
		name: 'calendarPopupInputContainerCalendarMonthPickerDisplay',
		cssProperty: 'display',
		displayName:
			'calendar popup Container Calendar main card year and month picker display arrangment',
		description:
			'This height is used for Calendar popup conatiner month picker and year picker display arrangment.',
		defaultValue: 'grid',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .monthSubDiv',
	},
	{
		name: 'calendarPopupInputContainerCalendarMainCardDisplay',
		cssProperty: 'display',
		displayName: 'calendar popup Container Calendar main card display',
		description: 'This height is used for Calendar popup conatiner display arrangment.',
		defaultValue: 'grid',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarRow',
	},
	{
		name: 'calendarPopupInputContainerCalendarMainCardGridArrangmet',
		cssProperty: 'grid-template-columns',
		displayName: 'calendar popup Container Calendar main card grid arrangment',
		description: 'This height is used for Calendar popup conatiner grid arrangment.',
		defaultValue: 'repeat(7, 1fr)',
		selector: '.calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarRow',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
