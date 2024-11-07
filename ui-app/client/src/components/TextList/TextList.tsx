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

function TextList(props: ComponentProps) {
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
					<rect width="30" height="30" rx="2" fill="url(#paint0_linear_3214_9643)" />
					<rect
						className="_TextListLine2"
						x="10.9097"
						y="13.6357"
						width="15"
						height="2.72727"
						rx="1"
						fill="url(#paint1_linear_3214_9643)"
					/>
					<circle
						className="_TextListCircle1"
						cx="6.81858"
						cy="6.81785"
						r="2.72727"
						fill="url(#paint2_linear_3214_9643)"
					/>
					<circle
						className="_TextListCircle2"
						cx="6.81858"
						cy="14.9983"
						r="2.72727"
						fill="url(#paint3_linear_3214_9643)"
					/>
					<circle
						className="_TextListCircle3"
						cx="6.81858"
						cy="23.1825"
						r="2.72727"
						fill="url(#paint4_linear_3214_9643)"
					/>
					<rect
						className="_TextListLine3"
						x="10.9097"
						y="21.8162"
						width="15"
						height="2.72727"
						rx="1"
						fill="url(#paint5_linear_3214_9643)"
					/>
					<rect
						className="_TextListLine1"
						x="10.9097"
						y="5.4552"
						width="15"
						height="2.72727"
						rx="1"
						fill="url(#paint6_linear_3214_9643)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9643"
							x1="15"
							y1="0"
							x2="15"
							y2="30"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9643"
							x1="18.4097"
							y1="13.6357"
							x2="18.4097"
							y2="16.363"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FF8EE7" />
							<stop offset="1" stopColor="#FF00C8" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9643"
							x1="6.81858"
							y1="4.09058"
							x2="6.81858"
							y2="9.54512"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FF8EE7" />
							<stop offset="1" stopColor="#FF00C8" />
						</linearGradient>
						<linearGradient
							id="paint3_linear_3214_9643"
							x1="6.81858"
							y1="12.271"
							x2="6.81858"
							y2="17.7255"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FF8EE7" />
							<stop offset="1" stopColor="#FF00C8" />
						</linearGradient>
						<linearGradient
							id="paint4_linear_3214_9643"
							x1="6.81858"
							y1="20.4552"
							x2="6.81858"
							y2="25.9097"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FF8EE7" />
							<stop offset="1" stopColor="#FF00C8" />
						</linearGradient>
						<linearGradient
							id="paint5_linear_3214_9643"
							x1="18.4097"
							y1="21.8162"
							x2="18.4097"
							y2="24.5434"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FF8EE7" />
							<stop offset="1" stopColor="#FF00C8" />
						</linearGradient>
						<linearGradient
							id="paint6_linear_3214_9643"
							x1="18.4097"
							y1="5.4552"
							x2="18.4097"
							y2="8.18247"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FF8EE7" />
							<stop offset="1" stopColor="#FF00C8" />
						</linearGradient>
					</defs>
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
