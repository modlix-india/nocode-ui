import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
    {
        name: 'gridGapProperties',
        cssProperty: 'gap',
        displayName: 'upload container display grid gap properties',
        description: 'The Upload Container Display Grid Gap Properties.',
        defaultValue: '8px',
        selector: '.uploadContainer',
    },
    {
        name: 'fontSizeForUploadIcon',
        cssProperty: 'font-size',
        displayName: 'upload icon font size properties',
        description: 'The Upload Icon font size Properties.',
        defaultValue: '18px',
        selector: '.uploadIcon',
    },
    {
        name: 'fontColorForUploadIcon',
        cssProperty: 'color',
        displayName: 'upload container font color properties',
        description: 'The Upload Container font color Properties.',
        defaultValue: '<form-input-border-color-hover>',
        selector: '.uploadIcon',
    },
    {
        name: 'fontSizeForUploadMainText',
        cssProperty: 'font-size',
        displayName: 'upload Main Text font size properties',
        description: 'The Main Text font size Properties.',
        defaultValue: '14px',
        selector: '.mainText',
    },
    {
        name: 'fontColorForUploadIcon',
        cssProperty: 'color',
        displayName: 'upload container font color properties',
        description: 'The Upload Container font color Properties.',
        defaultValue: '<form-input-border-color-hover>',
        selector: '.mainText',
    },
    {
        name: 'fontSizeForUploadLabelText',
        cssProperty: 'font-size',
        displayName: 'upload label text font size properties',
        description: 'The Upload Label Text font size Properties.',
        defaultValue: '11px',
        selector: '.labelText, .selectedDetails, errorTextSize',
    },
    {
        name: 'fontColorForUploadLabelText',
        cssProperty: 'color',
        displayName: 'upload container font color properties',
        description: 'The Upload Container font color Properties.',
        defaultValue: '<main-font-color>',
        selector: '.labelText, .selectedDetails',
    },
    {
        name: 'uploadComponentBorder',
        cssProperty: 'border',
        displayName: 'upload container border properties',
        description: 'The Upload Container border Properties.',
        defaultValue: '1px solid <form-input-border-color>',
        selector: '.uploadContainer',
    },
    {
        name: 'uploadComponentBorderRadius',
        cssProperty: 'border-radius',
        displayName: 'upload container border radius properties',
        description: 'The Upload Container border radius Properties.',
        defaultValue: '4px',
        selector: '.uploadContainer',
    },
    {
        name: 'uploadComponentWidth',
        cssProperty: 'width',
        displayName: 'upload container wdith style',
        description: 'The Upload Container width style.',
        selector: '.uploadContainer',
    },
    {
        name: 'uploadComponentHeight',
        cssProperty: 'height',
        displayName: 'upload container height style',
        description: 'The Upload Container height style.',
        selector: '.uploadContainer',
    },
    {
        name: 'uploadComponentPadding',
        cssProperty: 'padding',
        displayName: 'upload container padding style',
        description: 'The Upload Container padding style.',
        defaultValue: '40px 40px 40px 40px',
        selector: '.uploadContainer',
    },
    {
        name: 'uploadComponentPaddingHorizontal',
        cssProperty: 'padding',
        displayName: 'upload container padding style',
        description: 'The Upload Container padding style.',
        defaultValue: '6px 8px 6px 8px',
        selector: '.uploadContainer.horizontal',
    },
    {
        name: 'uploadComponentWidthHorizontal',
        cssProperty: 'width',
        displayName: 'upload container width horizontal style',
        description: 'The Upload Container width horizontal style.',
        selector: '.uploadContainer.horizontal',
    },
    {
        name: 'uploadComponentHeightHorizontal',
        cssProperty: 'height',
        displayName: 'upload container height horizontal style',
        description: 'The Upload Container height horizontal style.',
        defaultValue: '50px',
        selector: '.uploadContainer.horizontal',
    },
    {
        name: 'uploadComponentInputContainerPadding',
        cssProperty: 'padding',
        displayName: 'upload container input box padding style',
        description: 'The Upload Container input box padding style.',
        defaultValue: '4px 6px 4px 6px',
        selector: '.inputContainer',
    },
    {
        name: 'uploadComponentInputContainerBackgroundColor',
        cssProperty: 'background-color',
        displayName: 'upload container input box background style',
        description: 'The Upload Container input box background style.',
        selector: '.inputContainer',
    },
    {
        name: 'uploadComponentInputContainerIconGap',
        cssProperty: 'gap',
        displayName: 'upload container input box if icon then gap',
        description: 'The Upload Container input box if icon then gap style.',
        selector: '.inputContainer',
        defaultValue: '4px'
    },
    {
        name: 'uploadComponentInputContainerBorderColor',
        cssProperty: 'border',
        displayName: 'upload container input box border color',
        description: 'The Upload Container input box border color style.',
        selector: '.inputContainer',
        defaultValue: '1px solid <form-input-border-color>'
    },
    {
        name: 'uploadComponentInputContainerBorderRadius',
        cssProperty: 'border-radius',
        displayName: 'upload container input box border style',
        description: 'The Upload Container input box border style.',
        defaultValue: '4px',
        selector: '.inputContainer',
    },
    {
        name: 'uploadComponentHoverBorderColor',
        cssProperty: 'border',
        displayName: 'upload container border color on hover border style',
        description: 'The Upload Container oon hover border style.',
        selector: '.uploadContainer:hover',
        defaultValue: '1px solid <form-input-border-color-hover>'
    },
    {
        name: 'uploadComponentDisabledBorderColor',
        cssProperty: 'border',
        displayName: 'upload container border color on disabled style',
        description: 'The Upload Container oon hover disabled style.',
        selector: '.uploadContainer.disabled',
        defaultValue: '1px solid <form-input-border-color-when-disabled>'
    },
    {
        name: 'uploadComponentDisabledOpacityColor',
        cssProperty: 'opacity',
        displayName: 'upload container opacity style',
        description: 'The Upload Container opacity style.',
        selector: '.uploadContainer.disabled',
        defaultValue: '0.7'
    },
    {
        name: 'uploadComponentDisabledCursorStyle',
        cssProperty: 'cursor',
        displayName: 'upload container disabled cursor style',
        description: 'The Upload Container disabled cursor style.',
        selector: '.uploadContainer.disabled',
        defaultValue: 'not-allowed'
    },
    {
        name: 'uploadComponentErrorBorderColor',
        cssProperty: 'border',
        displayName: 'upload container border color on hover border style',
        description: 'The Upload Container oon hover border style.',
        selector: '.uploadContainer.error',
        defaultValue: '1px solid <form-input-border-color-when-error>'
    },
    {
        name: 'errorTextColor',
        cssProperty: 'color',
        displayName: 'upload container error font color',
        description: 'The Upload Container error font color style.',
        selector: '.errors',
        defaultValue: '<form-input-border-color-when-error>'
    },
    {
        name: 'errorTextDivWidth',
        cssProperty: 'width',
        displayName: 'upload container error div width style',
        description: 'The Upload Container error div width style.',
        selector: '.errors',
        defaultValue: '320px'
    },
    {
        name: 'errorTextDivWidthSmall',
        cssProperty: 'width',
        displayName: 'upload container error div width for horizontal',
        description: 'The Upload Container error div width for horizontal',
        selector: '.errors.horizontal',
        defaultValue: '280px'
    },
    {
        name: 'selectedMainDivDisplayWidth',
        cssProperty: 'width',
        displayName: 'upload container selected main width style',
        description: 'The Upload Container selected main width style.',
        selector: '.selectedFileContainer',
        defaultValue: '100%'
    },
    {
        name: 'selectedMainDivDisplayHeight',
        cssProperty: 'height',
        displayName: 'upload container selected main height style',
        description: 'The Upload Container selected main height style.',
        selector: '.selectedFileContainer',
        defaultValue: '100%'
    },
    {
        name: 'selectedMainDivDisplayGap',
        cssProperty: 'gap',
        displayName: 'upload container selected main space between',
        description: 'The Upload Container selected main space between.',
        selector: '.selectedFileContainer',
        defaultValue: '4px'
    },
    {
        name: 'selectedMainDivDisplayFlexDirection',
        cssProperty: 'flex-direction',
        displayName: 'upload container selected main flex direction',
        description: 'The Upload Container selected main flex direction.',
        defaultValue: 'column',
        selector: '.selectedFileContainer'
    },
    {
        name: 'selectedMainDivDisplayFlexMargin',
        cssProperty: 'margin',
        displayName: 'upload container selected main margin',
        description: 'The Upload Container selected main margin.',
        selector: '.selectedDetails',
        defaultValue: 'auto'
    },
    {
        name: 'displayForSelectedFileSizeAndName',
        cssProperty: 'display',
        displayName: 'selected file display style',
        description: 'The display style for selected file.',
        selector: '.selectedDetails',
        defaultValue: 'flex'
    },
    {
        name: 'displayForSelectedFileSizeAndNameGap',
        cssProperty: 'gap',
        displayName: 'selected file display style gap',
        description: 'The display style for selected file gap.',
        selector: '.selectedDetails',
        defaultValue: '4px'
    },
    {
        name: 'displayForSelectedFileSizeAndNameAlign',
        cssProperty: 'align-items',
        displayName: 'selected file align style',
        description: 'The align style for selected file.',
        selector: '.selectedDetails',
        defaultValue: 'center'
    },
    {
        name: 'closeIconFontSize',
        cssProperty: 'font-size',
        displayName: 'selected close icon font style',
        description: 'The font size is for selected close icon font style.',
        selector: '.closeIcon'
    },
    {
        name: 'closeIconFontColor',
        cssProperty: 'color',
        displayName: 'selected file font color style',
        description: 'The color is used for selected icon font color.',
        selector: '.closeIcon'
    }
];

export const styleDefaults = new Map<string, string>(
    styleProperties
        .filter(e => !!e.defaultValue)
        .map(({ name, defaultValue }) => [name, defaultValue!]),
);