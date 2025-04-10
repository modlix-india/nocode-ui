import React, { Suspense, useEffect, useState } from 'react';
import CommonCheckbox from '../../commonComponents/CommonCheckbox';
import {
    PageStoreExtractor,
    addListenerAndCallImmediately,
    getPathFromLocation,
    setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import ThemeEditorStyle from './ThemeEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './themeEditorProperties';
import { styleProperties, styleDefaults } from './themeEditorStyleProperties';
import { IconHelper } from '../util/IconHelper';

const LazyThemeEditor = React.lazy(
    () => import(/* webpackChunkName: "ThemeEditor" */ './LazyThemeEditor'),
);
function LoadLazyThemeEditor(props: Readonly<ComponentProps>) {
    return (
        <Suspense fallback={<>...</>}>
            <LazyThemeEditor {...props} />
        </Suspense>
    );
}

const component: Component = {
    name: 'ThemeEditor',
    displayName: 'Theme Editor',
    description: 'Theme component',
    styleComponent: ThemeEditorStyle,
    styleDefaults: styleDefaults,
    component: LoadLazyThemeEditor,
    propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
    properties: propertiesDefinition,
    styleProperties: stylePropertiesDefinition,
    bindingPaths: {
        bindingPath: { name: 'Theme Binding' }
    },
    stylePseudoStates: [],
    defaultTemplate: {
        key: '',
        name: 'Theme Editor',
        type: 'ThemeEditor',
        properties: {},
    },
    subComponentDefinition: [
        {
            name: '',
            displayName: 'Component',
            description: 'Component',
            icon: (
                <IconHelper viewBox="0 0 30 30">
                    <path
                        d="M25.2667 0H4.76667C2.13333 0 0 2.13333 0 4.76667V25.2667C0 27.8667 2.13333 30 4.76667 30H25.2667C27.8667 30 30 27.8667 30 25.2667V4.76667C30 2.13333 27.8667 0 25.2667 0ZM23.7333 11.9667L14 21.7C13.6667 22.0333 13.2333 22.2 12.8333 22.2C12.4333 22.2 11.9667 22.0333 11.6667 21.7L6.26667 16.3C5.6 15.6333 5.6 22.1 6.26667 21.4333C6.93333 20.7667 7.96667 20.7667 8.63333 21.4333L12.8667 25.6667L26.25 10.3125C26.9167 9.64583 23.1333 8.93333 23.8 9.6C24.4 10.2667 24.4 11.3333 23.7333 11.9667Z"
                        fill="#02B694"
                    />
                    <path
                        d="M21.6216 12.1883L14.2559 19.6183C14.0288 19.8728 13.6757 20 13.373 20C13.0703 20 12.7423 19.8728 12.4901 19.6183L8.37838 15.5216C7.87387 15.0127 7.87387 14.2239 8.37838 13.715C8.88288 13.2061 9.66486 13.2061 10.1694 13.715L13.373 16.9211L19.8306 10.3817C20.3351 9.87277 21.1171 9.87277 21.6216 10.3817C22.1261 10.8906 22.1261 11.6794 21.6216 12.1883Z"
                        fill="white"
                        className="_checkboxTick"
                    />
                    <rect
                        className="_checkboxbox"
                        x={0}
                        y={0}
                        width="15"
                        height="15"
                        fill="#02B694"
                        opacity="0"
                    />
                </IconHelper>
            ),
            mainComponent: true,
        },
    ],
    stylePropertiesForTheme: styleProperties,
};

export default component;