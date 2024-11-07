import { deepEqual } from '@fincity/kirun-js';
import Editor from '@monaco-editor/react';
import React, { useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './textEditorProperties';
import TextEditorStyle from './TextEditorStyle';
import { styleDefaults } from './textEditorStyleProperies';
import { IconHelper } from '../util/IconHelper';

function TextEditor(props: ComponentProps) {
	const {
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: { documentType } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const editorRef = useRef<any>(null);
	const editorJSONTextRef = useRef<string>('');
	const [_, setNow] = useState(Date.now());
	const datInStoreRef = useRef<any>(undefined);

	useEffect(() => {
		if (!bindingPathPath) return;

		return addListenerAndCallImmediately(
			(_, fromStore) => {
				const editorModel = editorRef.current?.getModel().getValue();
				if (documentType === 'json') {
					const tJSON = JSON.stringify(fromStore, undefined, 2);
					const notEqual = !deepEqual(fromStore, datInStoreRef.current);
					if (notEqual && editorRef.current) {
						datInStoreRef.current = fromStore;
						editorJSONTextRef.current = tJSON;
						editorRef.current?.getModel().setValue(tJSON);
					}
				} else {
					if (editorModel != fromStore) {
						editorRef.current?.getModel().setValue(fromStore);
					}
				}
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, editorRef.current, editorJSONTextRef, documentType, datInStoreRef]);

	const handleChange = (ev: any) => {
		if (!bindingPathPath) return;

		if (documentType === 'json') {
			try {
				editorJSONTextRef.current = ev;
				const toStore = JSON.parse(ev);
				datInStoreRef.current = toStore;
				setData(bindingPathPath, toStore, context.pageName);
			} catch (err) {}
		} else {
			setData(bindingPathPath, ev, context.pageName);
		}
	};

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	return (
		<div className="comp compTextEditor" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			<Editor
				language={documentType}
				height="100%"
				defaultValue={''}
				onChange={handleChange}
				onMount={editor => {
					editorRef.current = editor;
					setNow(Date.now());
				}}
			/>
		</div>
	);
}

const component: Component = {
	name: 'TextEditor',
	displayName: 'Text Editor',
	description: 'Text Editor component',
	component: TextEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TextEditorStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		type: 'TextEditor',
		name: 'TextEditor',
		properties: {},
	},
	bindingPaths: {
		bindingPath: { name: 'Text binding' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						className="_TextEditorBubble"
						d="M0 15C0 6.71573 6.71573 0 15 0C23.2843 0 30 6.71573 30 15V30H15C6.71573 30 0 23.2843 0 15Z"
						fill="url(#paint0_linear_3818_9735)"
					/>
					<path
						className="_TextEditorBubbleLine1"
						d="M16 12C16 11.4477 16.4477 11 17 11H24C24.5523 11 25 11.4477 25 12C25 12.5523 24.5523 13 24 13H17C16.4477 13 16 12.5523 16 12Z"
						fill="white"
					/>
					<path
						className="_TextEditorBubbleLine2"
						d="M16 17C16 16.4477 16.4477 16 17 16H24C24.5523 16 25 16.4477 25 17C25 17.5523 24.5523 18 24 18H17C16.4477 18 16 17.5523 16 17Z"
						fill="white"
					/>
					<path
						className="_TextEditorBubbleLine3"
						d="M5 22C5 21.4477 5.44772 21 6 21H24C24.5523 21 25 21.4477 25 22C25 22.5523 24.5523 23 24 23H6C5.44772 23 5 22.5523 5 22Z"
						fill="white"
					/>
					<path
						className="_TextEditorT"
						d="M14.832 8.73047V11.2393H14.5859C14.4401 10.6605 14.2783 10.2458 14.1006 9.99512C13.9229 9.73991 13.679 9.53711 13.3691 9.38672C13.196 9.30469 12.8929 9.26367 12.46 9.26367H11.7695V16.4141C11.7695 16.888 11.7946 17.1842 11.8447 17.3027C11.8994 17.4212 12.002 17.526 12.1523 17.6172C12.3073 17.7038 12.5169 17.7471 12.7812 17.7471H13.0889V18H8.23535V17.7471H8.54297C8.81185 17.7471 9.02832 17.6992 9.19238 17.6035C9.31087 17.5397 9.4043 17.4303 9.47266 17.2754C9.52279 17.166 9.54785 16.8789 9.54785 16.4141V9.26367H8.87793C8.25358 9.26367 7.80013 9.39583 7.51758 9.66016C7.12109 10.0293 6.87044 10.5557 6.76562 11.2393H6.50586V8.73047H14.832Z"
						fill="#333333"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3818_9735"
							x1="15"
							y1="0"
							x2="15"
							y2="30"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FEEFDF" />
							<stop offset="1" stopColor="#ECCEAE" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
	],
};

export default component;
