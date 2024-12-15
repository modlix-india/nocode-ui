import { duplicate } from '@fincity/kirun-js';
import { useCallback, useEffect, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { FormStorageEditorDefinition } from './components/formCommons';
import FormComponents from './components/FormComponents';
import FormEditor from './components/FormEditor';
import FormPreview from './components/FormPreview';
import { propertiesDefinition, stylePropertiesDefinition } from './formStorageEditorProperties';

export default function FormStorageEditor(props: Readonly<ComponentProps>) {
	const [formStorage, setFormStorage] = useState<FormStorageEditorDefinition>({
		name: 'form',
		fieldDefinitionMap: {},
		schema: { type: 'OBJECT', additionalProperties: false },
		readAuth: 'Authorities.Logged_IN',
		deleteAuth: 'Authorities.Logged_IN',
		updateAuth: 'Authorities.Logged_IN',
	});
	const {
		definition,
		definition: { bindingPath },
		pageDefinition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);

	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { theme, onSave, onPublish } = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const storagePath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	useEffect(() => {
		if (!storagePath) return;
		addListenerAndCallImmediately(
			(_, value) => {
				setFormStorage(
					value ?? {
						name: 'form',
						fieldDefinitionMap: {},
						schema: { type: 'OBJECT', additionalProperties: false },
						readAuth: 'Authorities.Logged_IN',
						deleteAuth: 'Authorities.Logged_IN',
						updateAuth: 'Authorities.Logged_IN',
					},
				);
			},
			pageExtractor,
			storagePath,
		);
	}, [storagePath]);

	const saveFunction = useCallback(() => {
		if (!onSave || !pageDefinition.eventFunctions?.[onSave]) return;
		(async () =>
			await runEvent(
				pageDefinition.eventFunctions[onSave],
				'formStorageEditorSave',
				context.pageName,
				locationHistory,
				pageDefinition,
			))();
	}, [onSave]);
	const onCancel = () => {
		let temp = {
			...duplicate(formStorage),
			fieldDefinitionMap: {},
			schema: { type: 'OBJECT', additionalProperties: false },
		};
		setData(storagePath!, temp, pageExtractor.getPageName());
	};

	return (
		<div className={`comp compFormStorageEditor`} style={resolvedStyles.comp ?? {}}>
			<HelperComponent key={`${key}_hlp`} definition={definition} context={context} />
			<div className="_main">
				<div className="_compSection">
					<div className="_sectionHeader">
						<span>Components</span>
						<p>Edit by dragging any component</p>
					</div>
					<FormComponents />
				</div>
				<div className="_editorSection">
					<div className="_sectionHeader">
						<span>Editor</span>
						<p>Click on any field to edit</p>
					</div>
					<FormEditor
						formStorage={formStorage}
						storagePath={storagePath!}
						pageExtractor={pageExtractor}
						locationHistory={locationHistory}
					/>
				</div>
				<div className="_previewSection">
					<div className="_sectionHeader">
						<span>Preview</span>
						<p>You can view a basic form and make edits in the editor</p>
					</div>
					<FormPreview
						fieldDefinitionMap={formStorage.fieldDefinitionMap}
						formName={formStorage.name}
						context={context}
						locationHistory={locationHistory}
					/>
				</div>
			</div>
			<div className="_footer">
				<button className="_cancel" onClick={onCancel}>
					Cancel
				</button>
				<button className="_save" onClick={saveFunction}>
					Save changes
				</button>
			</div>
		</div>
	);
}
