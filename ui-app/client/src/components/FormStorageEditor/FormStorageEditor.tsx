import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
} from '../../context/StoreContext';
import {
	Component,
	ComponentPropertyDefinition,
	ComponentProps,
	LocationHistory,
	PageDefinition,
} from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './formStorageEditorProperties';
import StorageEditorStyle from './FormStorageEditorStyle';
import { allPaths } from '../../util/allPaths';
import { LOCAL_STORE_PREFIX, PAGE_STORE_PREFIX, STORE_PREFIX } from '../../constants';
import ComponentDefinitions from '..';
import { deepEqual, duplicate } from '@fincity/kirun-js';
import { styleDefaults } from './formStorageEditorStyleProperties';
import { IconHelper } from '../util/IconHelper';
import FormComponents from './components/FormComponents';
import FormEditor from './components/FormEditor';
import { FormStorageEditorDefinition } from './components/formDefinitions';
import FormPreview from './components/FormPreview';

function FormStorageEditor(props: ComponentProps) {
	const [value, setValue] = useState<FormStorageEditorDefinition>({
		formDefinition: {},
		formSchema: { type: 'OBJECT', additionalProperties: false },
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
	// binding path for the page definition to load
	const defPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	useEffect(() => {
		if (!defPath) return;
		addListenerAndCallImmediately(
			(_, value) => {
				setValue(
					value || {
						formDefinition: {},
						formSchema: { type: 'OBJECT', additionalProperties: false },
					},
				);
			},
			pageExtractor,
			defPath,
		);
	}, [defPath]);

	const [saveChanges, setSaveChanges] = useState<boolean>(false);
	// console.log('value', value);
	// Function to call save eventFunction
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

	return (
		<div className={`comp compFormStorageEditor`} style={resolvedStyles.comp ?? {}}>
			<HelperComponent key={`${key}_hlp`} definition={definition} />
			<div className="_main">
				<div className="_compSection">
					<div className="_section_header">
						<span>Components</span>
						<p>Edit by dragging any component</p>
					</div>
					<FormComponents />
				</div>
				<div className="_editorSection">
					<div className="_section_header">
						<span>Editor</span>
						<p>Click on any field to edit</p>
					</div>
					<FormEditor value={value} defPath={defPath} pageExtractor={pageExtractor} />
				</div>
				<div className="_previewSection">
					<div className="_section_header">
						<span>Preview</span>
						<p>You can view a basic form and make edits in the editor</p>
					</div>
					<FormPreview
						formDefinition={value.formDefinition}
						bindingPath={defPath}
						pageDefinition={pageDefinition}
						context={context}
						locationHistory={locationHistory}
					/>
				</div>
			</div>
			<div className="_footer">
				<button className="_cancel">Cancel</button>
				<button className="_save" onClick={() => saveFunction()}>
					Save changes
				</button>
			</div>
		</div>
	);
}

const component: Component = {
	name: 'FormStorageEditor',
	displayName: 'Form Storage Editor',
	description: 'Form Storage Editor component',
	component: FormStorageEditor,
	isHidden: false,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: StorageEditorStyle,
	styleDefaults: styleDefaults,
	bindingPaths: {
		bindingPath: { name: 'Definition' },
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
						d="M12.4836 5.4706V1H3.5493C2.69501 1 2 1.69501 2 2.5493V21.4507C2 22.305 2.69501 23 3.5493 23H17.4706C18.3249 23 19.0199 22.305 19.0199 21.4507V7.53632H14.5493C13.4103 7.53632 12.4836 6.60964 12.4836 5.4706Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M13.5176 5.47056C13.5176 6.04008 13.9809 6.50342 14.5504 6.50342H18.2553L13.5176 1.78809V5.47056Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M14.5542 15.025L19.0139 10.5653C19.7675 9.81158 20.6015 9.81158 21.3552 10.5653C22.1089 11.3189 22.1089 12.1529 21.3552 12.9066L16.8955 17.3663L14.5542 15.025ZM16.2967 17.7041L14.3677 17.9184C14.1568 17.9418 13.9786 17.7636 14.0021 17.5527L14.2164 15.6237L16.2967 17.7041Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
