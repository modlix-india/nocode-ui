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
import { HelperComponent } from '../HelperComponent';
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
			<HelperComponent definition={definition} />
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
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M16.4316 6.93066V9.43945H16.1855C16.0397 8.86068 15.8779 8.44596 15.7002 8.19531C15.5225 7.9401 15.2786 7.7373 14.9688 7.58691C14.7956 7.50488 14.4925 7.46387 14.0596 7.46387H13.3691V14.6143C13.3691 15.0882 13.3942 15.3844 13.4443 15.5029C13.499 15.6214 13.6016 15.7262 13.752 15.8174C13.9069 15.904 14.1165 15.9473 14.3809 15.9473H14.6885V16.2002H9.83496V15.9473H10.1426C10.4115 15.9473 10.6279 15.8994 10.792 15.8037C10.9105 15.7399 11.0039 15.6305 11.0723 15.4756C11.1224 15.3662 11.1475 15.0791 11.1475 14.6143V7.46387H10.4775C9.85319 7.46387 9.39974 7.59603 9.11719 7.86035C8.7207 8.22949 8.47005 8.75586 8.36523 9.43945H8.10547V6.93066H16.4316Z"
						fill="currentColor"
					/>
					<rect
						x="3.94922"
						y="3.9502"
						width="16.1"
						height="16.1"
						stroke="currentColor"
						strokeOpacity="0.2"
						strokeWidth="1.5"
						fill="transparent"
					/>
					<rect x="1" y="1" width="4.4" height="4.4" rx="0.4" fill="currentColor" />
					<rect x="1" y="18.6001" width="4.4" height="4.4" rx="0.4" fill="currentColor" />
					<rect x="18.5996" y="1" width="4.4" height="4.4" rx="0.4" fill="currentColor" />
					<rect
						x="18.5996"
						y="18.6001"
						width="4.4"
						height="4.4"
						rx="0.4"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
