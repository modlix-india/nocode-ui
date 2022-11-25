import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../constants';
import {
	addListener,
	getData,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { ComponentProperty, DataLocation, RenderContext } from '../types/common';
import { getTranslations } from './util/getTranslations';

interface ToggelButtonProps extends React.ComponentPropsWithoutRef<'input'> {
	definition: {
		key: string;
		name: string;
		children: any;
		properties: {
			label: ComponentProperty<string>;
			form: ComponentProperty<string>;
			readonly: ComponentProperty<boolean>;
			bindingPath: DataLocation;
		};
	};
	pageDefinition: {
		eventFunctions: {
			[key: string]: any;
		};
		translations: {
			[key: string]: {
				[key: string]: string;
			};
		};
	};
	locationHistory: Array<DataLocation | string>;
	context: RenderContext;
}

function ToggleButton(props: ToggelButtonProps) {
	const {
		definition: {
			key,
			name,
			properties: { label, bindingPath },
		},
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const [isToggled, setIsToggled] = React.useState(false);
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const labelValue = getData(label, locationHistory, pageExtractor);
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory);
	React.useEffect(() => {
		addListener((_, value) => {
			setIsToggled(value);
		}, bindingPathPath);
	}, []);
	const handleChange = (event: any) => {
		setData(bindingPathPath, event.target.checked);
	};
	return (
		<div className="comp compToggleButton">
			<HelperComponent definition={definition} />
			<label className="toggleButton">
				<input
					type="checkbox"
					name={name}
					id={key}
					onChange={handleChange}
					checked={isToggled}
				/>
				{getTranslations(labelValue, translations)}
			</label>
		</div>
	);
}

ToggleButton.propertiesSchema = Schema.ofObject('ToggleButton')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['form', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['isDisabled', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export default ToggleButton;
