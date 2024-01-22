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
				<IconHelper viewBox="0 0 24 24">
					<g id="Group_103" data-name="Group 103" transform="translate(-1042 -254)">
						<g id="Group_69" data-name="Group 69" transform="translate(-234 2)">
							<path
								id="Path_141"
								data-name="Path 141"
								d="M16.553,20v2.166H5V20Z"
								transform="translate(1279.447 236.418)"
								fill="currentColor"
								fillOpacity={0.2}
							/>
							<path
								id="Path_149"
								data-name="Path 149"
								d="M21,20v2.166H5V20Z"
								transform="translate(1302.166 251) rotate(90)"
								fill="currentColor"
								fillOpacity={0.2}
							/>
							<path
								id="Path_142"
								data-name="Path 142"
								d="M16.553,20v2.166H5V20Z"
								transform="translate(1279.447 240.751)"
								fill="currentColor"
								fillOpacity={0.2}
							/>
							<path
								id="Path_143"
								data-name="Path 143"
								d="M16.553,20v2.166H5V20Z"
								transform="translate(1279.447 245.083)"
								fill="currentColor"
								fillOpacity={0.2}
							/>
							<path
								id="Path_144"
								data-name="Path 144"
								d="M16.553,20v2.166H5V20Z"
								transform="translate(1279.447 249.415)"
								fill="currentColor"
								fillOpacity={0.2}
							/>
						</g>
						<path
							id="Path_249"
							data-name="Path 249"
							d="M14.554,15.025l4.46-4.46a1.5,1.5,0,0,1,2.341,0,1.5,1.5,0,0,1,0,2.341l-4.46,4.46ZM16.3,17.7l-1.929.214A.331.331,0,0,1,14,17.553l.214-1.929Z"
							transform="translate(1039.653 254)"
							fill="currentColor"
						/>
					</g>
				</IconHelper>
			),
		},
	],
};

export default component;
