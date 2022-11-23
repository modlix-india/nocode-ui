import React from 'react';
import { getData, PageStoreExtractor } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { Link as RouterLink } from 'react-router-dom';
import { getTranslations } from './util/getTranslations';
import { DataLocation, ComponentProperty, RenderContext } from './types';

interface LinkProps extends React.ComponentPropsWithoutRef<'a'> {
	definition: {
		properties: {
			linkPath: ComponentProperty<string>;
			label: ComponentProperty<string>;
			target: ComponentProperty<string>;
			showButton: ComponentProperty<string>;
			externalButtonTarget: ComponentProperty<string>;
		};
	};
	pageDefinition: {
		translations: {
			[key: string]: {
				[key: string]: string;
			};
		};
	};
	locationHistory: Array<DataLocation | string>;
	context: RenderContext;
}

function Link(props: LinkProps) {
	const {
		definition: {
			properties: { linkPath, label, target, showButton, externalButtonTarget },
		},
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const labelValue = getData(label, locationHistory, pageExtractor);
	const linkPathValue = getData(linkPath, locationHistory, pageExtractor);
	const targetValue = getData(target, locationHistory, pageExtractor) || '_self';
	const externalButtonTargetVal =
		getData(externalButtonTarget, locationHistory, pageExtractor) || '_blank';
	const showButtonVal = getData(showButton, locationHistory, pageExtractor);

	return (
		<div className="comp compLinks ">
			<HelperComponent definition={definition} />
			<div className="linkDiv">
				<RouterLink className="link" to={`${linkPathValue}`} target={targetValue}>
					{getTranslations(labelValue, translations)}
				</RouterLink>
				{showButtonVal ? (
					<RouterLink
						to={`${linkPathValue}`}
						target={externalButtonTargetVal}
						className="secondLink"
					>
						<i className="fa-solid fa-up-right-from-square"></i>
					</RouterLink>
				) : null}
			</div>
		</div>
	);
}

Link.propertiesSchema = Schema.ofObject('Link')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['linkPath', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['target', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['showButton', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['externalButtonTarget', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export default Link;
