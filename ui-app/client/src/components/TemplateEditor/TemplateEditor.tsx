import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { Suspense, useCallback, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { runEvent } from '../util/runEvent';
import TemplateEditorStyle from './TemplateEditorStyle';
import { styleProperties, styleDefaults } from './TemplateEditorStyleProperties';
import { propertiesDefinition, stylePropertiesDefinition } from './templateEditorProperties';

const LazyTemplateEditor = React.lazy(
	() => import(/* webpackChunkName: "TemplateEditor" */ './LazyTemplateEditor'),
);

function TemplateEditor(props: Readonly<ComponentProps>) {
	const {
		definition,
		definition: { bindingPath, bindingPath2 },
		pageDefinition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		properties: {
			templateType,
			aiEndpoint,
			editorLook,
			previewRecords,
			previewRecordData,
			onPreviewOpen,
			onPreviewRecord,
			compareTemplate,
			compareLabel,
			onCompareOpen,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [template, setTemplate] = useState<any>(undefined);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, value) => {
				if (isNullValue(value)) {
					setTemplate(undefined);
					return;
				}
				setTemplate(duplicate(value));
			},
			bindingPathPath,
		);
	}, [bindingPathPath]);

	// Document look: the record the preview uses (second binding path), and the page's events that
	// load the list of records and the picked record's data.
	const recordPath = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;
	const [recordId, setRecordId] = useState<string | undefined>(undefined);
	React.useEffect(() => {
		if (!recordPath) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, value) => setRecordId(isNullValue(value) || value === '' ? undefined : `${value}`),
			recordPath,
		);
	}, [recordPath]);
	const fire = (eventKey?: string) => {
		const ev = eventKey ? pageDefinition.eventFunctions?.[eventKey] : undefined;
		if (!ev) return;
		(async () =>
			await runEvent(ev, eventKey!, context.pageName, locationHistory, pageDefinition))();
	};
	const records = {
		records: Array.isArray(previewRecords) ? previewRecords : undefined,
		recordId,
		recordData: recordId ? previewRecordData : undefined,
		onPick: onPreviewRecord
			? (id: string | undefined) => {
					setRecordId(id);
					if (recordPath) setData(recordPath, id ?? '', context.pageName);
					if (id) fire(onPreviewRecord);
				}
			: undefined,
		onOpen: onPreviewOpen ? () => fire(onPreviewOpen) : undefined,
	};

	// Another template opened with a record picked: load that record's data for it.
	const templateName = template?.name;
	const lastName = React.useRef(templateName);
	React.useEffect(() => {
		if (lastName.current === templateName) return;
		lastName.current = templateName;
		if (recordId && templateName) fire(onPreviewRecord);
	}, [templateName]); // eslint-disable-line react-hooks/exhaustive-deps

	const onChange = useCallback(
		(next: any) => {
			if (!bindingPathPath) return;
			setData(bindingPathPath, next, context.pageName);
		},
		[bindingPathPath, context.pageName],
	);

	return (
		<div className="comp compTemplateEditor" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			<Suspense fallback={<div className="_templateEditorLoading">Loading editor…</div>}>
				<LazyTemplateEditor
					template={template}
					onChange={onChange}
					lockedType={templateType}
					aiEndpoint={aiEndpoint}
					editorLook={editorLook}
					records={records}
					compare={
						compareTemplate || onCompareOpen
							? {
									// false from the page: there is nothing to compare with
									template:
										compareTemplate === false
											? null
											: compareTemplate && typeof compareTemplate === 'object'
												? compareTemplate
												: undefined,
									label: compareLabel,
									onOpen: onCompareOpen ? () => fire(onCompareOpen) : undefined,
								}
							: undefined
					}
					context={context}
					pageDefinition={pageDefinition}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
				/>
			</Suspense>
		</div>
	);
}

const component: Component = {
	name: 'TemplateEditor',
	displayName: 'Template Editor',
	description: 'Drag-and-drop / code editor for email, PDF, in-app and messaging templates',
	component: TemplateEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TemplateEditorStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Template' },
		bindingPath2: { name: 'Preview record id (Document look)' },
	},
	defaultTemplate: {
		key: '',
		type: 'TemplateEditor',
		name: 'Template Editor',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
