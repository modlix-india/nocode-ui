import React, { useCallback, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { propertiesDefinition, stylePropertiesDefinition } from './textListProperties';
import { Component } from '../../types/common';
import TextListStyle from './TextListStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { getRenderData } from '../util/getRenderData';
import { SubHelperComponent } from '../SubHelperComponent';
import { styleDefaults } from './textListStyleProperties';

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
			<HelperComponent definition={definition} />
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
	icon: 'fa-solid fa-list-ul',
	name: 'TextList',
	displayName: 'TextList',
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
};

export default component;
