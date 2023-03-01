import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
    {
        name: 'displayProperties',
        cssProperty: 'display',
        displayName: 'upload container display properties',
        description: 'The Upload Container Display Properties.',
        defaultValue: 'grid',
        selector: '.uploadContainer',
    },
    {
        name: 'displayPropertiesAlignHorizontal',
        cssProperty: 'justify-content',
        displayName: 'upload container horizontal align properties',
        description: 'The Upload Container Horizontal Align Properties.',
        defaultValue: 'center',
        selector: '.uploadContainer',
    },
    {
        name: 'displayPropertiesAlignItemsHorizontal',
        cssProperty: 'justify-items',
        displayName: 'upload container horizontal items align properties',
        description: 'The Upload Container Horizontal Items Align Properties.',
        defaultValue: 'center',
        selector: '.uploadContainer',
    },
    {
        name: 'displayPropertiesAlignItemsVertical',
        cssProperty: 'align-items',
        displayName: 'upload container vertical items align properties',
        description: 'The Upload Container Vertical Items Align Properties.',
        defaultValue: 'center',
        selector: '.uploadContainer',
    },
    {
        name: 'displayFlowProperties',
        cssProperty: 'grid-auto-flow',
        displayName: 'upload container display flow properties',
        description: 'The Upload Container Display flow Properties.',
        defaultValue: 'row',
        selector: '.uploadContainer',
    },
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
        selector: '.labelText',
    },
    {
        name: 'fontColorForUploadLabelText',
        cssProperty: 'color',
        displayName: 'upload container font color properties',
        description: 'The Upload Container font color Properties.',
        selector: '.labelText',
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
        defaultValue: "320px",
        selector: '.uploadContainer',
    },
    {
        name: 'uploadComponentHeight',
        cssProperty: 'height',
        displayName: 'upload container height style',
        description: 'The Upload Container height style.',
        defaultValue: '160px',
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
        name: 'uploadComponentPaddingSelected',
        cssProperty: 'padding',
        displayName: 'upload container mid view padding style',
        description: 'The Upload Container mid view padding style.',
        defaultValue: '40px 40px 0px 40px',
        selector: '.uploadContainer.fixed.selected',
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
        defaultValue: '280px',
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
        name: 'uploadComponentInputContainerBorder',
        cssProperty: 'border',
        displayName: 'upload container input box border style',
        description: 'The Upload Container input box border style.',
        defaultValue: '1px solid <form-input-border-color>',
        selector: '.inputContainer',
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
        name: 'uploadComponentInputContainerPadding',
        cssProperty: 'padding',
        displayName: 'upload container input box padding style',
        description: 'The Upload Container input box padding style.',
        defaultValue: '4px 6px 4px 6px',
        selector: '.inputContainer',
    },
    {
        name: 'uploadComponentInputContainerBackgroundColor',
        cssProperty: 'padding',
        displayName: 'upload container input box padding style',
        description: 'The Upload Container input box padding style.',
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
        name: 'uploadComponentInputContainerIconCursor',
        cssProperty: 'cursor',
        displayName: 'upload container input box cursor style',
        description: 'The Upload Container input box cursor style.',
        selector: '.uploadContainer',
        defaultValue: 'pointer'
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
        defaultValue: '0.8'
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
        name: 'uploadComponentWidthMid',
        cssProperty: 'width',
        displayName: 'upload container width',
        description: 'The Upload Container width style.',
        selector: '.uploadContainer.fixed',
        defaultValue: '120px'
    },
    {
        name: 'uploadComponentHeightMid',
        cssProperty: 'height',
        displayName: 'upload container height',
        description: 'The Upload Container height style.',
        selector: '.uploadContainer.fixed',
        defaultValue: '120px'
    },
    {
        name: 'uploadComponentMidBackgroundColor',
        cssProperty: 'background-color',
        displayName: 'upload container background color mid component',
        description: 'The Upload Container background style for mid component.',
        selector: '.uploadContainer.fixed',
    },
    {
        name: 'uploadComponentOnAddFontStyle',
        cssProperty: 'font-size',
        displayName: 'upload container font style selected style',
        description: 'The Upload Container font style for selected.',
        selector: '.selectedDetails',
        defaultValue: '12px'
    },
    {
        name: 'uploadComponentOnAddFontStyle',
        cssProperty: 'color',
        displayName: 'upload container font color style selected',
        description: 'The Upload Container font color style for selected.',
        selector: '.selectedDetails'
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
        name: 'errorTextSize',
        cssProperty: 'font-size',
        displayName: 'upload container error font size style',
        description: 'The Upload Container error font size style.',
        selector: '.errors',
        defaultValue: '12px'
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
        name: 'selectedMainDivDisplayStyle',
        cssProperty: 'display',
        displayName: 'upload container selected main display style',
        description: 'The Upload Container selected main display style.',
        selector: '.selectedMain',
        defaultValue: 'flex'
    },
    {
        name: 'selectedMainDivContainerStyle',
        cssProperty: 'overflow',
        displayName: 'upload container selected main overflow style',
        description: 'The Upload Container selected main overflow style.',
        selector: '.selectedMain',
        defaultValue: 'auto'
    },
    {
        name: 'selectedMainDivDisplayWidth',
        cssProperty: 'width',
        displayName: 'upload container selected main width style',
        description: 'The Upload Container selected main width style.',
        selector: '.selectedMain',
        defaultValue: '100%'
    },
    {
        name: 'selectedMainDivDisplayHeight',
        cssProperty: 'height',
        displayName: 'upload container selected main height style',
        description: 'The Upload Container selected main height style.',
        selector: '.selectedMain',
        defaultValue: '100%'
    },
    {
        name: 'selectedMainDivDisplayGap',
        cssProperty: 'gap',
        displayName: 'upload container selected main space between',
        description: 'The Upload Container selected main space between.',
        selector: '.selectedMain',
        defaultValue: '4px'
    },
    {
        name: 'selectedMainDivDisplayFlexDirection',
        cssProperty: 'flex-direction',
        displayName: 'upload container selected main flex direction',
        description: 'The Upload Container selected main flex direction.',
        selector: '.selectedMain'
    },

    {
        name: 'selectedMainDivDisplayFlexAlign',
        cssProperty: 'margin',
        displayName: 'upload container selected main flex align',
        description: 'The Upload Container selected main flex align.',
        selector: '.selectedDetails',
        defaultValue: 'auto'
    },
];

export const styleDefaults = new Map<string, string>(
    styleProperties
        .filter(e => !!e.defaultValue)
        .map(({ name, defaultValue }) => [name, defaultValue!]),
);