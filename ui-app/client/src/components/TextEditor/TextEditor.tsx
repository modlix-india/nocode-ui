import { deepEqual } from '@fincity/kirun-js';
import Editor from '@monaco-editor/react';
import React, { useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './textEditorProperties';
import TextEditorStyle from './TextEditorStyle';
import { styleProperties, styleDefaults } from './textEditorStyleProperies';
import { IconHelper } from '../util/IconHelper';

function TextEditor(props: Readonly<ComponentProps>) {
	const {
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
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
		urlExtractor,
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
					<rect width="28" height="30" rx="3" fill="#9B82F3" />
					<path
						d="M22.5 14H5.5C5.22386 14 5 14.2239 5 14.5V15.5C5 15.7761 5.22386 16 5.5 16H22.5C22.7761 16 23 15.7761 23 15.5V14.5C23 14.2239 22.7761 14 22.5 14Z"
						fill="white"
						className="_TextEditorLine2"
					/>
					<path
						d="M22.5 8H11.5C11.2239 8 11 8.22386 11 8.5V9.5C11 9.77614 11.2239 10 11.5 10H22.5C22.7761 10 23 9.77614 23 9.5V8.5C23 8.22386 22.7761 8 22.5 8Z"
						fill="white"
						className="_TextEditorLine1"
					/>
					<path
						d="M22.5 20H11.5C11.2239 20 11 20.2239 11 20.5V21.5C11 21.7761 11.2239 22 11.5 22H22.5C22.7761 22 23 21.7761 23 21.5V20.5C23 20.2239 22.7761 20 22.5 20Z"
						fill="white"
						className="_TextEditorLine3"
					/>
				</IconHelper>
			),
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
