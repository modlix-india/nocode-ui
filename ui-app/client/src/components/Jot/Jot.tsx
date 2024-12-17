import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { useMemo } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
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
import { styleDefaults } from './jotStyleProperies';
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
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	React.useEffect(() => {
		if (!bindingPath2Path) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				if (!isNullValue(value)) {
					setPersonalizationObject(value);
					return;
				}
				setPersonalizationObject({});
			},
			pageExtractor,
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="3" fill="#725BBC" />
					<path
						d="M22.5 24H5.5C5.22386 24 5 24.2239 5 24.5V25.5C5 25.7761 5.22386 26 5.5 26H22.5C22.7761 26 23 25.7761 23 25.5V24.5C23 24.2239 22.7761 24 22.5 24Z"
						fill="white"
						className="_Jotline1"
					/>
					<path
						d="M8.5 19H5.5C5.22386 19 5 19.2239 5 19.5V20.5C5 20.7761 5.22386 21 5.5 21H8.5C8.77614 21 9 20.7761 9 20.5V19.5C9 19.2239 8.77614 19 8.5 19Z"
						fill="white"
					/>
					<path
						d="M22.7899 14.4761L19.5481 11.2344L13.4611 17.3239C13.2017 17.5833 13.0122 17.9049 12.9075 18.2566L12.0247 21.2589C11.9624 21.4684 12.0197 21.6953 12.1768 21.8499C12.3339 22.0045 12.5584 22.0619 12.7678 22.0021L15.7677 21.1193C16.1193 21.0146 16.441 20.825 16.7004 20.5657L22.7899 14.4761ZM14.2266 18.2615L14.7927 18.0346V18.8326C14.7927 19.052 14.9722 19.2316 15.1917 19.2316H15.9897L15.7627 19.7976C15.663 19.875 15.5508 19.9323 15.4311 19.9697L13.481 20.5433L14.0546 18.5957C14.0895 18.4735 14.1493 18.3613 14.2266 18.264V18.2615ZM19.8623 13.364C20.0169 13.5186 20.0169 13.7729 19.8623 13.9275L16.2714 17.5184C16.1168 17.673 15.8625 17.673 15.7079 17.5184C15.5533 17.3638 15.5533 17.1095 15.7079 16.9549L19.2988 13.364C19.4534 13.2094 19.7077 13.2094 19.8623 13.364Z"
						fill="white"
						className="_JotPen"
					/>
					<path
						d="M24.5324 10.4408C25.1558 11.0643 25.1558 12.0742 24.5324 12.6976L23.0362 14.1938L19.7944 10.952L21.2906 9.45585C21.9141 8.83243 22.924 8.83243 23.5474 9.45585L24.5299 10.4384L24.5324 10.4408Z"
						fill="white"
						className="_JotPen"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
