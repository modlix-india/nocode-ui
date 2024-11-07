import React, { useCallback, useEffect, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import {
	Component,
	ComponentPropertyDefinition,
	ComponentProps,
	LocationHistory,
	PageDefinition,
} from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './formStorageEditorProperties';
import StorageEditorStyle from './FormStorageEditorStyle';
import { styleDefaults } from './formStorageEditorStyleProperties';
import { IconHelper } from '../util/IconHelper';
import FormComponents from './components/FormComponents';
import FormEditor from './components/FormEditor';
import { FormStorageEditorDefinition } from './components/formCommons';
import FormPreview from './components/FormPreview';
import { duplicate } from '@fincity/kirun-js';

function FormStorageEditor(props: ComponentProps) {
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
		bindingPath: { name: 'Storage Binding' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" fill="#F9F9F9" />
					<path
						d="M16.2958 6.09627V0H4.11268C2.94775 0 2 0.947747 2 2.11268V27.8873C2 29.0523 2.94775 30 4.11268 30H23.0963C24.2612 30 25.2089 29.0523 25.2089 27.8873V8.91317H19.1127C17.5594 8.91317 16.2958 7.64951 16.2958 6.09627Z"
						fill="url(#paint0_linear_3214_9536)"
					/>
					<path
						d="M17.7056 6.09754C17.7056 6.87416 18.3374 7.50599 19.114 7.50599H24.1661L17.7056 1.07599V6.09754Z"
						fill="url(#paint1_linear_3214_9536)"
					/>
					<path
						className="_FSEPen"
						d="M19.1195 19.1228L25.2009 13.0414C26.2286 12.0136 27.3659 12.0136 28.3936 13.0414C29.4213 14.0691 29.4213 15.2064 28.3936 16.2341L22.3122 22.3155L19.1195 19.1228ZM21.4957 22.7761L18.8652 23.0684C18.5776 23.1003 18.3346 22.8573 18.3666 22.5697L18.6589 19.9393L21.4957 22.7761Z"
						fill="url(#paint2_linear_3214_9536)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9536"
							x1="13.6045"
							y1="0"
							x2="13.6045"
							y2="30"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9536"
							x1="20.9358"
							y1="1.07599"
							x2="20.9358"
							y2="7.50599"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9536"
							x1="23.7641"
							y1="12.2706"
							x2="23.7641"
							y2="23.0712"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#E76CA3" />
							<stop offset="1" stopColor="#C23373" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
	],
};

export default component;
