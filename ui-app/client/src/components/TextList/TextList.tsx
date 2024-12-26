import React, { useCallback, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { propertiesDefinition, stylePropertiesDefinition } from './textListProperties';
import { Component } from '../../types/common';
import TextListStyle from './TextListStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { getRenderData } from '../util/getRenderData';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { styleDefaults } from './textListStyleProperties';
import { IconHelper } from '../util/IconHelper';

function TextList(props: Readonly<ComponentProps>) {
	const {
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			text,
			delimitter,
			listIcon,
			listType,
			listStyleType,
			labelKey,
			labelKeyType,
			uniqueKey,
			uniqueKeyType,
			datatype,
			data,
			start,
			reversed,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	let dropdownData: any = React.useMemo(
		() =>
			getRenderData(
				data,
				datatype,
				uniqueKeyType,
				uniqueKey,
				labelKeyType,
				labelKey,
				labelKeyType,
				labelKey,
			),
		[data, datatype, uniqueKeyType, uniqueKey, labelKeyType, labelKey, labelKeyType, labelKey],
	);

	const [hover, setHover] = useState('');
	const styleHoverProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true },
		stylePropertiesWithPseudoStates,
	);

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: false },
		stylePropertiesWithPseudoStates,
	);

	let translatedText = dropdownData?.length
		? dropdownData.map((e: any) => {
				return { ...e, label: getTranslations(e.label, translations) };
			})
		: text && text.length
			? text.split(delimitter).map((e: string) => getTranslations(e, translations))
			: [];

	translatedText = translatedText.map((e: any) => [e.key ?? e, e.label ?? e]);

	return (
		<div className="comp compTextList" style={styleProperties.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			{listType === 'ol' ? (
				<ol
					style={{
						...(styleProperties.list ?? {}),
						listStyleType: listStyleType,
					}}
					className="list"
					start={start ? start : undefined}
					reversed={reversed}
				>
					<SubHelperComponent definition={props.definition} subComponentName="list" />
					{translatedText.map((e: any) => (
						<li
							style={
								(e[0] === hover ? styleProperties : styleHoverProperties)
									.listItem ?? {}
							}
							className="listItem"
							key={e[0]}
							onMouseEnter={() =>
								stylePropertiesWithPseudoStates?.hover && setHover(e[0])
							}
							onMouseLeave={() =>
								stylePropertiesWithPseudoStates?.hover &&
								e[0] === hover &&
								setHover('')
							}
						>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="listItem"
							/>
							{e[1]}
						</li>
					))}
				</ol>
			) : (
				<ul
					style={{
						...(styleProperties.list ?? {}),
						listStyleType: listIcon ? 'none' : listStyleType,
					}}
				>
					<SubHelperComponent definition={props.definition} subComponentName="list" />
					{translatedText.map((e: any) => (
						<li
							style={
								(e[0] === hover ? styleProperties : styleHoverProperties)
									.listItem ?? {}
							}
							className="listItem"
							key={e[0]}
							onMouseEnter={() =>
								stylePropertiesWithPseudoStates?.hover && setHover(e[0])
							}
							onMouseLeave={() =>
								stylePropertiesWithPseudoStates?.hover &&
								e[0] === hover &&
								setHover('')
							}
						>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="listItem"
							/>
							<i
								style={
									(e[0] === hover ? styleProperties : styleHoverProperties)
										.listItemIcon ?? {}
								}
								className={`${listIcon} listItemIcon`}
							>
								<SubHelperComponent
									definition={props.definition}
									subComponentName="listItemIcon"
								/>
							</i>
							{e[1]}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

const component: Component = {
	name: 'TextList',
	displayName: 'Text List',
	description: 'TextList component',
	component: TextList,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TextListStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		type: 'TextList',
		name: 'TextList',
		properties: {
			text: { value: 'Text1,Text2,Text3' },
		},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<svg
						width="22"
						height="30"
						viewBox="0 0 22 30"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M13.5511 6.09627V0H2.00263C0.898379 0 0 0.947747 0 2.11268V27.8873C0 29.0523 0.898379 30 2.00263 30H19.9974C21.1016 30 22 29.0523 22 27.8873V8.91317H16.2213C14.749 8.91317 13.5511 7.64951 13.5511 6.09627Z"
							fill="#E663CA"
						/>
						<path
							d="M14.8882 6.10163C14.8882 6.87825 15.4871 7.51008 16.2233 7.51008H21.0122L14.8882 1.08008V6.10163Z"
							fill="#E663CA"
						/>
						<path
							d="M17.5 14H6.5C6.22386 14 6 14.2239 6 14.5V15.5C6 15.7761 6.22386 16 6.5 16H17.5C17.7761 16 18 15.7761 18 15.5V14.5C18 14.2239 17.7761 14 17.5 14Z"
							fill="white"
							className="_TextListLine1"
						/>
						<path
							d="M17.5 19H6.5C6.22386 19 6 19.2239 6 19.5V20.5C6 20.7761 6.22386 21 6.5 21H17.5C17.7761 21 18 20.7761 18 20.5V19.5C18 19.2239 17.7761 19 17.5 19Z"
							fill="white"
							className="_TextListLine2"
						/>
						<path
							d="M17.5 24H6.5C6.22386 24 6 24.2239 6 24.5V25.5C6 25.7761 6.22386 26 6.5 26H17.5C17.7761 26 18 25.7761 18 25.5V24.5C18 24.2239 17.7761 24 17.5 24Z"
							fill="white"
							className="_TextListLine3"
						/>
						<path
							d="M2 15C2 15.5523 2.44772 16 3 16C3.55228 16 4 15.5523 4 15C4 14.4477 3.55228 14 3 14C2.44772 14 2 14.4477 2 15Z"
							fill="white"
							className="_TextListCircle1"
						/>
						<path
							d="M2 20C2 20.5523 2.44772 21 3 21C3.55228 21 4 20.5523 4 20C4 19.4477 3.55228 19 3 19C2.44772 19 2 19.4477 2 20Z"
							fill="white"
							className="_TextListCircle2"
						/>
						<path
							d="M2 25C2 25.5523 2.44772 26 3 26C3.55228 26 4 25.5523 4 25C4 24.4477 3.55228 24 3 24C2.44772 24 2 24.4477 2 25Z"
							fill="white"
							className="_TextListCircle3"
						/>
					</svg>
				</IconHelper>
			),
		},
		{
			name: 'list',
			displayName: 'List',
			description: 'List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'listItem',
			displayName: 'List Item',
			description: 'List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'listItemIcon',
			displayName: 'List Item Icon',
			description: 'List Item Icon',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
