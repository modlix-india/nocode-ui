import { duplicate, isNullValue } from '@fincity/kirun-js';
import { useCallback, useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { shortUUID } from '../../util/shortUUID';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { Dots } from './components/FillerDefinitionEditorIcons';
import Section from './components/Section';
import { Filler, SectionDefinition } from './components/fillerCommons';
import {
	propertiesDefinition,
	stylePropertiesDefinition,
} from './fillerDefinitionEditorProperties';

export default function FillerDefinitionEditor(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;
	const {
		definition: { bindingPath },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
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
		urlExtractor,
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
