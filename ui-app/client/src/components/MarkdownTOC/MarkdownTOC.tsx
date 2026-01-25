import React, { useMemo, useState } from 'react';
import { parseInline } from '../../commonComponents/Markdown/parseInline';
import { makeId } from '../../commonComponents/Markdown/utils';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
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
import { propertiesDefinition, stylePropertiesDefinition } from './markdownTOCProperties';
import MarkdownTOCStyle from './MarkdownTOCStyle';
import { styleProperties, styleDefaults } from './markdownTOCStyleProperties';
import getSrcUrl from '../util/getSrcUrl';

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
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
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
		urlExtractor,
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
			iconImage = <img src={getSrcUrl(topTextImage)} alt="topTextImage" />;
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
			iconImage = <img src={getSrcUrl(bottomTextImage)} alt="bottomTextImage" />;
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
		iconImage = (
			<img className="_bulletIconImage" alt={`${id}`} src={getSrcUrl(bulletImage)}></img>
		);
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
		stylePropertiesForTheme: styleProperties,
};

export default component;
