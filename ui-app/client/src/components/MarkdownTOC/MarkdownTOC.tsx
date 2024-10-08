import React, { useMemo, useState } from 'react';
import { parseInline } from '../../commonComponents/Markdown/parseInline';
import { makeId } from '../../commonComponents/Markdown/utils';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import {
	processComponentStylePseudoClasses,
	processStyleObjectToCSS,
} from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { IconHelper } from '../util/IconHelper';
import { getAlphaNumeral, getRoman } from '../util/numberConverter';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './dharaProps';
import { styleDefaults } from './dharaStyleProps';
import MarkdownTOCStyle from './MarkdownTOCStyle';

interface BulletPoint {
	level: number;
	component: JSX.Element;
	id: string;
	number: string;
	children: Array<BulletPoint>;
}

const COUNT_FUNCTIONS: Record<string, (num: number) => string> = {
	NUMBER: (num: number) => num.toString(),
	ROMAN: (num: number) => getRoman(num, false),
	ROMAN_UPPERCASE: (num: number) => getRoman(num, true),
	ALPHA: (num: number) => getAlphaNumeral(num, false),
	ALPHA_UPPERCASE: (num: number) => getAlphaNumeral(num, true),
};

const STYLE_SELECTORS = [
	['comp', `toc_css`, '', `toc_css:hover`],
	['titleText', `toc_css > ._titleText`, '', `toc_css > ._titleText:hover`],
	['H1', `toc_css > ._heading1`, `toc_css > ._heading1:visited`, `toc_css > ._heading1:hover`],
	['H2', `toc_css > ._heading2`, `toc_css > ._heading2:visited`, `toc_css > ._heading2:hover`],
	['H3', `toc_css > ._heading3`, `toc_css > ._heading3:visited`, `toc_css > ._heading3:hover`],
	['H4', `toc_css > ._heading4`, `toc_css > ._heading4:visited`, `toc_css > ._heading4:hover`],
	['H5', `toc_css > ._heading5`, `toc_css > ._heading5:visited`, `toc_css > ._heading5:hover`],
	['H6', `toc_css > ._heading6`, `toc_css > ._heading6:visited`, `toc_css > ._heading6:hover`],
	[
		'collapsibleIcon',
		`toc_css a i._collapsibleIcon`,
		`toc_css a:visited i._collapsibleIcon`,
		`toc_css a:hover i._collapsibleIcon`,
	],
	[
		'topLabel',
		`toc_css > ._topLabel`,
		`toc_css > ._topLabel:visited`,
		`toc_css > ._topLabel:hover`,
	],
	[
		'bottomLabel',
		`toc_css > ._bottomLabel`,
		`toc_css > ._bottomLabel:visited`,
		`toc_css > ._bottomLabel:hover`,
	],
	[
		'bulletIconImage',
		`toc_css > a > ._bulletIconImage`,
		`toc_css > a:visited > ._bulletIconImage`,
		`toc_css > a:hover > ._bulletIconImage`,
	],
	[
		'topIconImage',
		`toc_css > ._topLabel > img`,
		`toc_css > ._topLabel:visited > img`,
		`toc_css > ._topLabel:hover > img`,
	],
	[
		'bottomIconImage',
		`toc_css > ._bottomLabel > img`,
		`toc_css > ._bottomLabel:visited > img`,
		`toc_css > ._bottomLabel:hover > img`,
	],
];

function formatBulletNumber(numbers: number[], bulletType: string): string {
	if (bulletType === 'NONE') {
		return '';
	}
	return numbers.map(num => COUNT_FUNCTIONS[bulletType](num)).join('.');
}

function makeTOCBulletPoints(
	text: string,
	showTill: string,
	bulletType: string,
): Array<BulletPoint> {
	if (!text.trim()) {
		return [];
	}

	const bullets: Array<BulletPoint> = [];

	const lines = text.split('\n');
	const MATCH_REGEX = new RegExp(`^(#{1,${showTill.charAt(1)}}) `);

	const stack: BulletPoint[] = [];
	const numbers: number[] = [];

	for (const line of lines) {
		const match = MATCH_REGEX.exec(line);
		if (!match) continue;

		const level = match[1].length;
		const text = line.slice(level + 1);
		const id = makeId(text);

		const component = (
			<>
				{parseInline({
					lines: [text],
					lineNumber: 0,
					styles: {},
					componentKey: '',
				})}
			</>
		);

		const bullet: BulletPoint = {
			level,
			component,
			id,
			number: '',
			children: [],
		};

		if (numbers.length < level) {
			numbers.push(1);
		} else {
			numbers[level - 1]++;
			numbers.length = level;
		}

		bullet.number = formatBulletNumber(numbers, bulletType);
		while (stack.length && stack[stack.length - 1].level >= level) {
			stack.pop();
		}
		if (stack.length) {
			stack[stack.length - 1].children.push(bullet);
		} else {
			bullets.push(bullet);
		}
		stack.push(bullet);
	}
	return bullets;
}

function MarkdownTOC(props: Readonly<ComponentProps>) {
	const { definition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
			markdownText,
			showTill,
			makeCollapsibleFrom,
			titleText,
			topLabelText,
			bottomLabelText,
			topTextIcon,
			topTextImage,
			topIconImagePosition,
			bottomTextIcon,
			bottomTextImage,
			bottomIconImagePosition,
			bulletType,
			bulletIcon,
			bulletImage,
			makeCollapsible,
			colorScheme,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const hoverStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true },
		stylePropertiesWithPseudoStates,
	);

	const visitedStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ visited: true },
		stylePropertiesWithPseudoStates,
	);

	const regularStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ visited: false, hover: false },
		stylePropertiesWithPseudoStates,
	);

	const styleKey = `${key}_${
		locationHistory?.length ? locationHistory.map(e => e.index).join('_') : ''
	}`;

	const styleStrings: Array<string> = [];
	const styleObjects = [undefined, regularStyle, visitedStyle, hoverStyle];

	for (const styleName of STYLE_SELECTORS) {
		for (let i = 1; i < styleName.length; i++) {
			if (!styleName[i]) continue;
			let style = processStyleObjectToCSS(
				styleObjects[i]?.[styleName[0]],
				`.comp.compMarkdownTOC#_${styleKey}${styleName[i]}`,
			);
			if (style) styleStrings.push(style);
		}
	}

	const styleComp = styleStrings.length ? (
		<style key={`${styleKey}_style`}>{styleStrings.join('\n')}</style>
	) : null;

	const headings = useMemo(
		() => makeTOCBulletPoints(markdownText, showTill, bulletType),
		[markdownText, showTill, bulletType],
	);

	const firstBullet = headings.length > 0 ? headings[0].id : null;
	const lastBullet = headings.length > 0 ? headings[headings.length - 1].id : null;

	let titleTextComp = null;
	if (titleText) {
		titleTextComp = (
			<span className="_titleText">
				<SubHelperComponent definition={props.definition} subComponentName="titleText" />
				{titleText}
			</span>
		);
	}

	let topComp = null;
	if (topLabelText && firstBullet) {
		let iconImage;
		if (topTextIcon) {
			iconImage = (
				<i className={`_topIconImage ${topTextIcon}`}>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="topIconImage"
					/>
				</i>
			);
		} else if (topTextImage) {
			iconImage = <img src={topTextImage} alt="topTextImage" />;
		}

		topComp = (
			<a className="_topLabel" href={`#${firstBullet}`}>
				<SubHelperComponent definition={props.definition} subComponentName="topLabel" />
				{topIconImagePosition === '_left' ? iconImage : topLabelText}
				{topIconImagePosition === '_right' ? iconImage : topLabelText}
			</a>
		);
	}

	let bottomComp = null;
	if (bottomLabelText && lastBullet) {
		let iconImage;
		if (bottomTextIcon) {
			iconImage = (
				<i className={`_bottomIconImage ${bottomTextIcon}`}>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="bottomIconImage"
					/>
				</i>
			);
		} else if (bottomTextImage) {
			iconImage = <img src={bottomTextImage} alt="bottomTextImage" />;
		}

		bottomComp = (
			<a className="_bottomLabel" href={`#${lastBullet}`}>
				<SubHelperComponent definition={props.definition} subComponentName="bottomLabel" />
				{bottomIconImagePosition === '_left' ? iconImage : bottomLabelText}
				{bottomIconImagePosition === '_right' ? iconImage : bottomLabelText}
			</a>
		);
	}

	return (
		<>
			{styleComp}
			<nav className={`comp compMarkdownTOC ${colorScheme}`} id={`_${styleKey}toc_css`}>
				<HelperComponent context={context} definition={definition} />
				{titleTextComp}
				{topComp}
				{headings.map(heading => (
					<ContentLink
						{...heading}
						makeCollapsible={makeCollapsible}
						makeCollapsibleFrom={makeCollapsibleFrom}
						props={props}
						bulletIcon={bulletIcon}
						bulletImage={bulletImage}
					/>
				))}
				{bottomComp}
			</nav>
		</>
	);
}

function ContentLink({
	level,
	id,
	component,
	children = [],
	number,
	makeCollapsible,
	makeCollapsibleFrom,
	bulletIcon,
	bulletImage,
	props,
}: BulletPoint & {
	makeCollapsible?: boolean;
	makeCollapsibleFrom: string;
	bulletIcon: string;
	bulletImage: string;
	props: ComponentProps;
}) {
	const from = parseInt(makeCollapsibleFrom.charAt(1));

	const [expanded, setExpanded] = useState(false);

	const isExpanded = children.length && (level >= from ? expanded : !expanded);

	let iconImage;

	if (bulletIcon) {
		iconImage = (
			<i className={`_bulletIconImage ${bulletIcon}`}>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="_bulletIconImage"
				/>
			</i>
		);
	} else if (bulletImage) {
		iconImage = <img className="_bulletIconImage" alt={`${id}`} src={bulletImage}></img>;
	} else {
		iconImage = (
			<span className="_bulletIconImage">
				<SubHelperComponent
					definition={props.definition}
					subComponentName="_bulletIconImage"
				/>
				{number}
			</span>
		);
	}

	const childrenComps = (isExpanded || !makeCollapsible ? children : []).map(child => (
		<ContentLink
			key={child.id}
			{...child}
			makeCollapsible={makeCollapsible}
			makeCollapsibleFrom={makeCollapsibleFrom}
			props={props}
			bulletIcon={bulletIcon}
			bulletImage={bulletImage}
		/>
	));

	let collapseIcon;

	if (makeCollapsible) {
		let icon = 'fa-chevron-right hide';
		if (children.length) {
			icon = isExpanded ? 'fa-chevron-down' : 'fa-chevron-right';
		}

		collapseIcon = (
			<i
				onClick={e => {
					e.preventDefault();
					setExpanded(!expanded);
				}}
				className={`_collapsibleIcon fa-solid ${icon}`}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="collapsibleIcon"
				/>
			</i>
		);
	}

	return (
		<>
			<a key={id} href={`#${id}`} className={`_heading${level}`}>
				<SubHelperComponent definition={props.definition} subComponentName={`H${level}`} />
				{collapseIcon}
				{iconImage}
				{component}
			</a>
			{childrenComps}
		</>
	);
}

const component: Component = {
	name: 'MarkdownTOC',
	displayName: 'Markdown TOC',
	description: 'Table Of Contents for Markdown Text',
	component: MarkdownTOC,
	styleComponent: MarkdownTOCStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'visited'],
	styleProperties: stylePropertiesDefinition,
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M1 4.2998H14.2V22.1998C14.2 22.6416 13.8418 22.9998 13.4 22.9998H1V4.2998Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M1 1.8C1 1.35817 1.35817 1 1.8 1H22.2C22.6418 1 23 1.35817 23 1.8V6.5H1V1.8Z"
						fill="currentColor"
					/>
					<rect x="1" y="9.7998" width="5.5" height="4.4" rx="0.2" fill="currentColor" />
					<path
						d="M1 17.5H6.5V23H1.8C1.35817 23 1 22.6418 1 22.2V17.5Z"
						fill="currentColor"
					/>
					<rect
						x="9.80078"
						y="9.7998"
						width="4.4"
						height="4.4"
						rx="0.2"
						fill="currentColor"
					/>
					<rect
						x="9.80078"
						y="17.5"
						width="4.4"
						height="5.5"
						rx="0.2"
						fill="currentColor"
					/>
					<rect
						x="17.5"
						y="9.7998"
						width="5.5"
						height="4.4"
						rx="0.2"
						fill="currentColor"
					/>
					<path
						d="M17.5 17.5H23V22.2C23 22.6418 22.6418 23 22.2 23H17.5V17.5Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'titleText',
			displayName: 'Title Text',
			description: 'Title Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H1',
			displayName: 'H1',
			description: 'H1',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H2',
			displayName: 'H2',
			description: 'H2',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H3',
			displayName: 'H3',
			description: 'H3',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H4',
			displayName: 'H4',
			description: 'H4',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H5',
			displayName: 'H5',
			description: 'H5',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H6',
			displayName: 'H6',
			description: 'H6',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'collapsibleIcon',
			displayName: 'Collapasible Icon',
			description: 'Collapasible Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'topLabel',
			displayName: 'Goto Top Label',
			description: 'gototopLabel',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bottomLabel',
			displayName: 'Goto Bottom Label',
			description: 'gotobottomLabel',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bulletIconImage',
			displayName: 'Bullet Icon Image',
			description: 'BulletIconImage',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'topIconImage',
			displayName: 'Top Icon Image',
			description: 'topIconImage',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bottomIconImage',
			displayName: 'Bottom Icon Image',
			description: 'bottomIconImage',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
