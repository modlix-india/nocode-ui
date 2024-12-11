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
import FillerDefinitionEditorStyle from './FillerDefinitionEditorStyle';
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
	styleComponent: FillerDefinitionEditorStyle,
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
						d="M0 1C0 0.447715 0.447715 0 1 0H20C20.5523 0 21 0.447715 21 1V2C21 2.55228 20.5523 3 20 3H1C0.447715 3 0 2.55228 0 2V1Z"
						fill="#EDEAEA"
					/>
					<path
						d="M0 9C0 8.44772 0.447715 8 1 8H20C20.5523 8 21 8.44772 21 9V10C21 10.5523 20.5523 11 20 11H1C0.447715 11 0 10.5523 0 10V9Z"
						fill="#EDEAEA"
					/>
					<path
						d="M0 17C0 16.4477 0.447715 16 1 16H20C20.5523 16 21 16.4477 21 17V18C21 18.5523 20.5523 19 20 19H1C0.447715 19 0 18.5523 0 18V17Z"
						fill="#EDEAEA"
					/>
					<path
						d="M0 25C0 24.4477 0.447715 24 1 24H20C20.5523 24 21 24.4477 21 25V26C21 26.5523 20.5523 27 20 27H1C0.447715 27 0 26.5523 0 26V25Z"
						fill="#EDEAEA"
					/>
					<path
						className="_FDEPen"
						d="M3.10547 21.0239L12.0018 12.1276C13.5053 10.6241 15.169 10.6241 16.6724 12.1276C18.1759 13.631 18.1759 15.2947 16.6724 16.7982L7.77607 25.6945L3.10547 21.0239ZM6.5816 26.3683L2.73357 26.7959C2.31287 26.8426 1.9574 26.4871 2.00414 26.0664L2.4317 22.2184L6.5816 26.3683Z"
						fill="#00B5B9"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
