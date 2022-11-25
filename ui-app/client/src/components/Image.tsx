import React from 'react';
import { getData,getDataFromPath, PageStoreExtractor } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { ComponentProperty, DataLocation, RenderContext } from './types';
export interface Image extends React.ComponentPropsWithoutRef<'span'> {
	definition: {
		properties: {
			width: ComponentProperty<string>;
			height: ComponentProperty<string>;
			src: ComponentProperty<string>;
			alt: ComponentProperty<string>;
		};
		pageDefinition: {
			translations: {
				[key: string]: { [key: string]: string };
			};
		};
	};
 locationHistory: Array<DataLocation | string>;
	context: RenderContext;
}

export function ImageComponent(props: Image) {
	const {
		definition: {
			properties: { width, height, alt, src },
		},
definition,
locationHistory,
context

	} = props;
    const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const widthData = getData(width,locationHistory, pageExtractor);
	const heightData = getData(height,locationHistory, pageExtractor);
	const altData = getData(alt,locationHistory, pageExtractor);
	const srcData = getData(src,locationHistory, pageExtractor);

	return (
		<div>
			<HelperComponent definition={definition} />
			<div>
				<img
					src={`${srcData}`}
					alt={`${altData}`}
					width={`${widthData}`}
					height={`${heightData}`}
				/>
			</div>
		</div>
	);
}

ImageComponent.propertiesSchema = Schema.ofObject('Image')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['src', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['alt', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['width', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['height', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export default ImageComponent;