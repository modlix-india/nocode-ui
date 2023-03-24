import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	PageStoreExtractor,
} from '../../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentProperty,
	LocationHistory,
	PageDefinition,
} from '../../../types/common';
import ComponentDefinitions from '../../';
import PropertyValueEditor from './propertyValueEditors/PropertyValueEditor';

interface PropertyEditorProps {
	selectedComponent: string;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
}

export default function PropertyEditor({
	selectedComponent,
	defPath,
	locationHistory,
	pageExtractor,
}: PropertyEditorProps) {
	const [def, setDef] = useState<ComponentDefinition>();

	useEffect(() => {
		if (!defPath) return;

		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, v: PageDefinition) => setDef(v.componentDefinition[selectedComponent]),
			pageExtractor,
			defPath,
		);
	}, [defPath, selectedComponent]);

	if (!def) return <></>;

	const cd = ComponentDefinitions.get(def.type);

	return (
		<div className="_propertyEditor">
			{cd?.properties.map(e => {
				return (
					<div className="_eachProp" key={`${selectedComponent}-${e.name}`}>
						<div className="_propLabel" title={e.description}>
							{e.displayName} :{' '}
							<span className="_description" title={e.description}>
								i
							</span>
						</div>
						<PropertyValueEditor
							propDef={e}
							value={def.properties?.[e.name] as ComponentProperty<any>}
							onChange={v => {}}
						/>
					</div>
				);
			})}
		</div>
	);
}
