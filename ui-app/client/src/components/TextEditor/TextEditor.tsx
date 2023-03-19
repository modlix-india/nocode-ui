import { deepEqual, Schema } from '@fincity/kirun-js';
import React, { useEffect, useRef, useState } from 'react';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import {
	addListenerAndCallImmediately,
	getData,
	setData,
	getDataFromLocation,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import {
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentProps,
	DataLocation,
	RenderContext,
	Translations,
} from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { propertiesDefinition, stylePropertiesDefinition } from './textEditorProperties';
import { Component } from '../../types/common';
import TextEditorStyle from './TextEditorStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Editor from '@monaco-editor/react';

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

	useEffect(() => {
		if (!bindingPathPath) return;

		return addListenerAndCallImmediately(
			(_, fromStore) => {
				if (documentType === 'json') {
					if (!deepEqual(fromStore, data)) {
						setDataInState(fromStore);
						setText(JSON.stringify(fromStore, undefined, 2));
					}
				} else {
					if (text != fromStore) {
						setText(fromStore);
					}
				}
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

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

	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);
	return (
		<div className="comp compTextEditor" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			<Editor language={documentType} height="100%" value={text} onChange={handleChange} />
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
};

export default component;
