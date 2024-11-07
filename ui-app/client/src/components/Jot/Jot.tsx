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

function Jot(props: ComponentProps) {
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
					<rect width="30" height="30" fill="#F9F9F9" />
					<path
						// className="_JotPen"
						className="_JotPen1"
						d="M28.8984 3.41658C30.3647 4.88293 30.3647 7.25841 28.8984 8.72475L25.3792 12.244L17.7542 4.61899L21.2734 1.09976C22.7397 -0.366586 25.1152 -0.366586 26.5816 1.09976L28.8925 3.41072L28.8984 3.41658ZM18.4932 10.9536L10.047 19.3997C9.68339 19.7634 9.08512 19.7634 8.72147 19.3997C8.35782 19.0361 8.35782 18.4378 8.72147 18.0742L17.1676 9.62802C17.5313 9.26437 18.1295 9.26437 18.4932 9.62802C18.8568 9.99168 18.8568 10.5899 18.4932 10.9536Z"
						fill="url(#paint0_linear_3214_9551)"
					/>
					<path
						// className="_JotPen"
						className="_JotPen1"
						d="M25.379 12.2436L17.754 4.61859L3.4366 18.9419C2.8266 19.5519 2.38083 20.3085 2.13448 21.1355L0.058136 28.1974C-0.0884985 28.6901 0.0464052 29.2239 0.415924 29.5875C0.785443 29.9512 1.31333 30.0861 1.80602 29.9453L8.86207 27.869C9.68909 27.6226 10.4457 27.1768 11.0557 26.5668L25.379 12.2436ZM5.23727 21.1472L6.56871 20.6135V22.4904C6.56871 23.0066 6.99102 23.4289 7.50717 23.4289H9.38409L8.85034 24.7603C8.61573 24.9421 8.35178 25.077 8.07025 25.165L3.48352 26.5141L4.83256 21.9332C4.91467 21.6458 5.05544 21.3819 5.23727 21.1531V21.1472ZM18.493 9.62763C18.8567 9.99128 18.8567 10.5895 18.493 10.9532L10.0469 19.3994C9.68323 19.763 9.08496 19.763 8.7213 19.3994C8.35765 19.0357 8.35765 18.4374 8.7213 18.0738L17.1675 9.62763C17.5311 9.26397 18.1294 9.26397 18.493 9.62763Z"
						fill="url(#paint1_linear_3214_9551)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9551"
							x1="19.2234"
							y1="0"
							x2="19.2234"
							y2="19.6725"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9551"
							x1="12.6895"
							y1="4.61859"
							x2="12.6895"
							y2="30"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#725BBC" />
							<stop offset="1" stopColor="#2A1A5E" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
	],
};

export default component;
