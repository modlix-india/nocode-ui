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

	const [text, setText] = useState('{}');
	const [data, setDataInState] = useState({});
	const editorRef = useRef<any>(null);
	const [_, setNow] = useState(0);

	useEffect(() => {
		if (!bindingPathPath) return;

		return addListenerAndCallImmediately(
			(_, fromStore) => {
				const editorModel = editorRef.current?.getModel().getValue();
				if (documentType === 'json') {
					const tJSON = JSON.stringify(fromStore, undefined, 2);
					if (!deepEqual(fromStore, data) || editorModel != tJSON) {
						setDataInState(fromStore);
						if (tJSON != editorModel) setText(tJSON);
						editorRef.current?.getModel().setValue(tJSON);
					}
				} else {
					if (text != fromStore || editorModel != fromStore) {
						setText(fromStore);
						editorRef.current?.getModel().setValue(fromStore);
					}
				}
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, editorRef.current, documentType, text, data, setText, setData]);

	const handleChange = (ev: any) => {
		if (!bindingPathPath) return;

		if (documentType === 'json') {
			try {
				const toStore = JSON.parse(ev);
				setData(bindingPathPath, toStore, context.pageName);
			} catch (err) {}
		}
		setText(ev);
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
				value={text}
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
	icon: 'fa-solid fa-rectangle-list',
	name: 'TextEditor',
	displayName: 'Text Editor',
	description: 'Text Editor component',
	component: TextEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TextEditorStyle,
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
};

export default component;
