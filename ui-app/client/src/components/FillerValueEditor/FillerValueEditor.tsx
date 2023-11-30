import React, { useMemo, useRef } from 'react';
import { PageStoreExtractor, getPathFromLocation, setData } from '../../context/StoreContext';
import {
	Component,
	ComponentPropertyDefinition,
	ComponentProps,
	LocationHistory,
	PageDefinition,
} from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import GridStyle from './FillerValueEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './fillerValueEditorProperties';
import { styleDefaults } from './fillerValueEditorStyleProperties';
import ValueEditor from './components/ValueEditor';
import { PageViewer } from './components/PageViewer';
import { runEvent } from '../util/runEvent';
import TopBar from './components/TopBar';
import { Filler } from '../FillerDefinitionEditor/components/fillerCommons';

function savePersonalizationCurry(
	personalizationPath: string,
	pageName: string,
	onChangePersonalization: any,
	locationHistory: Array<LocationHistory>,
	pageDefinition: PageDefinition,
) {
	if (!onChangePersonalization) return (key: string, value: any) => {};
	let handle: any = -1;

	return (key: string, value: any) => {
		if (handle !== -1) clearTimeout(handle);

		setData(`${personalizationPath}.${key}`, value, pageName);
		handle = setTimeout(() => {
			(async () =>
				await runEvent(
					onChangePersonalization,
					'pageEditorSave',
					pageName,
					locationHistory,
					pageDefinition,
				))();
		}, 2000);
	};
}

function FillerValueEditor(props: ComponentProps) {
	const { definition, pageDefinition, locationHistory, context } = props;
	const {
		definition: { bindingPath, bindingPath3, bindingPath2 },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			onSave,
			onChangePersonalization,
			logo,
			dashboardPageName,
			settingsPageName,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const uiDefPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const coreDefPath = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;

	// binding path for the editor's personalization.
	const personalizationPath = bindingPath3
		? getPathFromLocation(bindingPath3, locationHistory, pageExtractor)
		: undefined;

	// Function to save the personalization
	const savePersonalization = useMemo(() => {
		if (!personalizationPath) return (key: string, value: any) => {};

		return savePersonalizationCurry(
			personalizationPath,
			context.pageName,
			pageDefinition.eventFunctions?.[onChangePersonalization],
			locationHistory,
			pageDefinition,
		);
	}, [
		personalizationPath,
		context.pageName,
		onChangePersonalization,
		locationHistory,
		pageDefinition,
	]);

	const unodStack = useRef<Array<Filler>>([]);
	const redoStack = useRef<Array<Filler>>([]);

	return (
		<div className={`comp compFillerValueEditor`} style={resolvedStyles.comp ?? {}}>
			<HelperComponent key={`${key}_hlp`} definition={definition} />
			<TopBar
				logo={logo}
				dashboardPageName={dashboardPageName}
				settingsPageName={settingsPageName}
				onSave={() => {}}
				onUndo={() => {}}
				onRedo={() => {}}
				hasUndo={unodStack?.current?.length > 1}
				hasRedo={redoStack?.current?.length > 0}
				pageExtractor={pageExtractor}
				locationHistory={locationHistory}
				personalizationPath={personalizationPath}
				onPersonalizationChange={(k: string, v: any) => savePersonalization(k, v)}
			/>
			<div className="_body">
				<ValueEditor />
				<PageViewer />
			</div>
		</div>
	);
}

const component: Component = {
	name: 'FillerValueEditor',
	displayName: 'Filler Value Editor',
	description: 'Filler Value Editor Component',
	component: FillerValueEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GridStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'UI Filler' },
		bindingPath2: { name: 'Server Filler' },
		bindingPath3: { name: 'Personalization' },
	},
	defaultTemplate: {
		key: '',
		name: 'Fillter Value Editor',
		type: 'FillerValueEditor',
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<g id="Group_101" data-name="Group 101" transform="translate(-1205 -495.138)">
						<g id="Group_100" data-name="Group 100" transform="translate(-26 49.498)">
							<path
								id="Path_228"
								data-name="Path 228"
								d="M0,8.863a1.138,1.138,0,0,0,.969.9l8.9-.78L.237,0Z"
								transform="translate(1233.592 452.374) rotate(-43)"
								fill="currentColor"
							/>
							<path
								id="Path_233"
								data-name="Path 233"
								d="M1.407,0,8.224,7.712a1.827,1.827,0,0,0,1.035.582c.51.007.98-.582.98-.582L17.593,0A1.407,1.407,0,0,1,19,1.407V13.37a1.407,1.407,0,0,1-1.407,1.407H1.407A1.407,1.407,0,0,1,0,13.37V1.407A1.407,1.407,0,0,1,1.407,0Z"
								transform="translate(1231 452.227)"
								fill="currentColor"
								fillOpacity={0.2}
							/>
						</g>
						<path
							id="Path_229"
							data-name="Path 229"
							d="M14.554,15.025l4.46-4.46a1.5,1.5,0,0,1,2.341,0,1.5,1.5,0,0,1,0,2.341l-4.46,4.46ZM16.3,17.7l-1.929.214A.331.331,0,0,1,14,17.553l.214-1.929Z"
							transform="translate(1205.04 495.82)"
							fill="currentColor"
						/>
					</g>
				</IconHelper>
			),
		},
	],
};

export default component;
