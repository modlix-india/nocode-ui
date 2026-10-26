import { deepEqual } from '@fincity/kirun-js';
import Editor from '@monaco-editor/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { APP_THEME_NAME, readAppTheme, watchHostStyles } from './appMonacoTheme';
import { propertiesDefinition, stylePropertiesDefinition } from './textEditorProperties';

export default function LazyTextEditor(props: Readonly<ComponentProps>) {
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
		properties: { documentType, editorTheme = 'light', readOnly } = {},
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
	const monacoRef = useRef<any>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const isAppTheme = editorTheme === 'app';

	// The app theme is rebuilt from the Editor Palette variables now and whenever the page's
	// styles change; Monaco cannot follow CSS variables on its own.
	const applyAppTheme = useCallback(() => {
		const monaco = monacoRef.current;
		if (!monaco || !rootRef.current) return;
		const { theme, fontFamily } = readAppTheme(rootRef.current);
		monaco.editor.defineTheme(APP_THEME_NAME, theme);
		monaco.editor.setTheme(APP_THEME_NAME);
		if (fontFamily) editorRef.current?.updateOptions({ fontFamily });
	}, []);
	useEffect(() => {
		if (!isAppTheme) return;
		applyAppTheme();
		return watchHostStyles(applyAppTheme);
	}, [isAppTheme, applyAppTheme]);
	const editorJSONTextRef = useRef<string>('');
	const [_, setNow] = useState(Date.now());
	const datInStoreRef = useRef<any>(undefined);
	// The last text this component itself pushed into the model. setValue fires
	// onDidChangeModelContent, so without this the initial load writes straight back
	// to the store: an editor over a path that does not exist yet would CREATE it as
	// an empty string just by being looked at, marking the object dirty and, for
	// something like a notification channel, switching a feature on. Only a change
	// that differs from what we pushed is a real edit.
	const pushedTextRef = useRef<string | undefined>(undefined);

	useEffect(() => {
		if (!bindingPathPath) return;

		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, fromStore) => {
				const editorModel = editorRef.current?.getModel().getValue();
				// Monaco's setValue throws "Illegal argument" on undefined, so an editor
				// bound to a path that does not exist yet - a template part for a channel
				// nobody has filled in, say - has to start from an empty document rather
				// than from the missing value. JSON.stringify(undefined) is undefined too,
				// so both branches need it.
				if (documentType === 'json') {
					const tJSON = JSON.stringify(fromStore, undefined, 2) ?? '';
					const notEqual = !deepEqual(fromStore, datInStoreRef.current);
					if (notEqual && editorRef.current) {
						datInStoreRef.current = fromStore;
						editorJSONTextRef.current = tJSON;
						pushedTextRef.current = tJSON;
						editorRef.current?.getModel().setValue(tJSON);
					}
				} else {
					const next = fromStore ?? '';
					if (editorModel != next) {
						pushedTextRef.current = next;
						editorRef.current?.getModel().setValue(next);
					}
				}
			},
			bindingPathPath,
		);
	}, [bindingPathPath, editorRef.current, editorJSONTextRef, documentType, datInStoreRef]);

	const handleChange = (ev: any) => {
		if (!bindingPathPath) return;

		// Echo of our own setValue, not something the user typed.
		if (ev === pushedTextRef.current) {
			pushedTextRef.current = undefined;
			return;
		}

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
		<div
			ref={rootRef}
			className={`comp compTextEditor${isAppTheme ? ' _appTheme' : ''}`}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={definition} />
			<Editor
				language={documentType}
				height="100%"
				defaultValue={''}
				theme={isAppTheme ? APP_THEME_NAME : editorTheme}
				options={{ readOnly: !!readOnly }}
				onChange={handleChange}
				onMount={(editor, monaco) => {
					editorRef.current = editor;
					monacoRef.current = monaco;
					if (isAppTheme) applyAppTheme();
					setNow(Date.now());
				}}
			/>
		</div>
	);
}
