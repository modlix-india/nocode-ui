import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { shortUUID } from '../../util/shortUUID';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import { Dots } from './components/FillerDefinitionEditorIcons';
import GridStyle from './FillerDefinitionEditorStyle';
import {
	propertiesDefinition,
	stylePropertiesDefinition,
} from './fillerDefinitionEditorProperties';
import { styleDefaults } from './fillerDefinitionEditorStyleProperties';
import Section from './components/Section';
import { Filler, SectionDefinition } from './components/fillerCommons';

function FillerDefinitionEditor(props: ComponentProps) {
	const { definition, pageDefinition, locationHistory, context } = props;
	const {
		definition: { bindingPath },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {} = {},
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

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const [filler, setFiller] = useState<Filler>({});

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => setFiller(isNullValue(value) ? {} : value),
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const udpateFillerInBindingPath = useCallback(
		(newFiller: Filler) => {
			if (!bindingPathPath) return;
			setData(bindingPathPath, newFiller, context?.pageName);
		},
		[bindingPathPath],
	);

	return (
		<div
			className={`comp compFillerDefinitionEditor _colorProfile1`}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent context={props.context} key={`${key}_hlp`} definition={definition} />
			{Object.values(filler.definition ?? {})
				.sort((a, b) => a.order - b.order)
				.map((section: SectionDefinition) => (
					<Section
						key={section.key}
						section={section}
						filler={filler}
						setFiller={udpateFillerInBindingPath}
					/>
				))}
			<div className="_sectioncontainer">
				<div className={`_section _nondraggable _collapsed`}>
					<div
						className="_sectionHeader"
						onClick={() =>
							addNewSection({
								filler,
								setFiller: udpateFillerInBindingPath,
								position: -1,
							})
						}
					>
						<Dots />
						Add Section
					</div>
				</div>
			</div>
		</div>
	);
}

function addNewSection({
	filler,
	setFiller,
	position,
}: {
	filler: Filler;
	setFiller: (filler: Filler) => void;
	position: number;
}) {
	const obj: Filler = duplicate(filler);
	if (isNullValue(obj.definition)) obj.definition = {};
	const def = obj.definition!;

	const key = shortUUID();
	let valueKey = 'newSection';
	let i = 0;
	let keyNotFound = true;

	while (Object.values(def).some(v => v.valueKey === valueKey)) {
		i++;
		valueKey = 'newSection' + i;
	}

	const newSection: SectionDefinition = {
		key,
		name: 'New Section',
		pagePath: '',
		valueKey,
		order: 0,
	};

	if (position === -1) {
		newSection.order = Object.keys(def).length;
	} else {
		const values = Object.values(def).sort(
			(a: SectionDefinition, b: SectionDefinition) => a.order - b.order,
		);
		values.splice(position, 0, newSection);
		values.forEach((v, i) => (v.order = i));
	}

	def[key] = newSection;
	setFiller(obj);
}

const component: Component = {
	name: 'FillerDefinitionEditor',
	displayName: 'Filler Definition Editor',
	description: 'Filler Definition Editor Component',
	component: FillerDefinitionEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GridStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Filler Definition' },
	},
	defaultTemplate: {
		key: '',
		name: 'Filler Definition Editor',
		type: 'FillerDefinitionEditor',
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 27 27">
					<path
						d="M6 1C6 0.447715 6.44772 0 7 0H26C26.5523 0 27 0.447715 27 1V2C27 2.55228 26.5523 3 26 3H7C6.44772 3 6 2.55228 6 2V1Z"
						fill="url(#paint0_linear_3214_9518)"
					/>
					<path
						d="M1 27C0.447715 27 0 26.5523 0 26L0 1C0 0.447714 0.447715 0 1 0H2C2.55228 0 3 0.447716 3 1L3 26C3 26.5523 2.55228 27 2 27H1Z"
						fill="url(#paint1_linear_3214_9518)"
					/>
					<path
						d="M6 9C6 8.44772 6.44772 8 7 8H26C26.5523 8 27 8.44772 27 9V10C27 10.5523 26.5523 11 26 11H7C6.44772 11 6 10.5523 6 10V9Z"
						fill="url(#paint2_linear_3214_9518)"
					/>
					<path
						d="M6 17C6 16.4477 6.44772 16 7 16H26C26.5523 16 27 16.4477 27 17V18C27 18.5523 26.5523 19 26 19H7C6.44772 19 6 18.5523 6 18V17Z"
						fill="url(#paint3_linear_3214_9518)"
					/>
					<path
						d="M6 25C6 24.4477 6.44772 24 7 24H26C26.5523 24 27 24.4477 27 25V26C27 26.5523 26.5523 27 26 27H7C6.44772 27 6 26.5523 6 26V25Z"
						fill="url(#paint4_linear_3214_9518)"
					/>
					<path
						className="_FDEPen"
						d="M9.10547 21.0239L18.0018 12.1276C19.5053 10.6241 21.169 10.6241 22.6724 12.1276C24.1759 13.631 24.1759 15.2947 22.6724 16.7982L13.7761 25.6945L9.10547 21.0239ZM12.5816 26.3683L8.73357 26.7959C8.31287 26.8426 7.9574 26.4871 8.00414 26.0664L8.4317 22.2184L12.5816 26.3683Z"
						fill="url(#paint5_linear_3214_9518)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9518"
							x1="16.5"
							y1="0"
							x2="16.5"
							y2="3"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9518"
							x1="0"
							y1="13.5"
							x2="3"
							y2="13.5"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9518"
							x1="16.5"
							y1="8"
							x2="16.5"
							y2="11"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint3_linear_3214_9518"
							x1="16.5"
							y1="16"
							x2="16.5"
							y2="19"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint4_linear_3214_9518"
							x1="16.5"
							y1="24"
							x2="16.5"
							y2="27"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint5_linear_3214_9518"
							x1="15.9"
							y1="11"
							x2="15.9"
							y2="26.8"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#00B5B9" />
							<stop offset="1" stopColor="#006769" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
	],
};

export default component;
