import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { useMemo } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import {
	Component,
	ComponentPropertyDefinition,
	ComponentProps,
	LocationHistory,
	PageDefinition,
} from '../../types/common';
import { shortUUID } from '../../util/shortUUID';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import JotStyle from './JotStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './jotProperties';
import { styleProperties, styleDefaults } from './jotStyleProperies';
import { DEFAULT_DOCUMENT, LOCAL_STORAGE_PREFIX, savePersonalizationCurry } from './constants';
import { IconHelper } from '../util/IconHelper';

function Jot(props: Readonly<ComponentProps>) {
	const {
		definition,
		locationHistory,
		context,
		definition: { key, bindingPath, bindingPath2 },
		pageDefinition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		properties: {
			defaultDocument = DEFAULT_DOCUMENT,
			onChangePersonalization,
			onDeletePersonalization,
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

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [jotDocument, setJotDocument] = React.useState<any>({});
	const [personalizationObject, setPersonalizationObject] = React.useState<any>({});

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const bindingPath2Path = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;

	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, value) => {
				if (!isNullValue(value)) {
					setJotDocument(value);
					return;
				}

				let v: any = duplicate(DEFAULT_DOCUMENT);

				try {
					let x = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
					if (!isNullValue(x) && !x?.trim()) v = JSON.parse(x!);
					if (v._id == null && v.id == null) v = duplicate(DEFAULT_DOCUMENT);
				} catch (e) {}

				setJotDocument(v);
			},
			bindingPathPath,
		);
	}, [bindingPathPath]);

	React.useEffect(() => {
		if (!bindingPath2Path) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, value) => {
				if (!isNullValue(value)) {
					setPersonalizationObject(value);
					return;
				}
				setPersonalizationObject({});
			},
			bindingPath2Path,
		);
	}, [bindingPath2Path]);

	const savePersonalization = useMemo(() => {
		if (!bindingPath2Path) return (key: string, value: any) => {};

		return savePersonalizationCurry(
			bindingPath2Path,
			context.pageName,
			pageDefinition.eventFunctions?.[onChangePersonalization],
			locationHistory,
			pageDefinition,
		);
	}, [
		bindingPath2Path,
		context.pageName,
		onChangePersonalization,
		locationHistory,
		bindingPath2Path,
	]);

	const { currentPaperId, papers } = jotDocument;
	const paper = papers.find((p: any) => p.paperId === currentPaperId) ?? {};

	return (
		<div className={`comp compJot`} style={styleProperties.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />

			<div className="_canvas"></div>
		</div>
	);
}

const component: Component = {
	name: 'Jot',
	displayName: 'Jot',
	description: 'Jot and draw anything',
	component: Jot,
	bindingPaths: {
		bindingPath: { name: 'Jot Document' },
		bindingPath2: { name: 'Personalization Object' },
	},
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: JotStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Jot',
		type: 'Jot',
		properties: {
			jot: { value: 'fa-solid fa-jots' },
		},
	},
	sections: [{ name: 'Jots', pageName: 'jot' }],
		stylePropertiesForTheme: styleProperties,
};

export default component;
