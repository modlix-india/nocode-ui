import React, { useState } from 'react';
import { HelperComponent } from '../HelperComponent';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { PageStoreExtractor } from '../../context/StoreContext';
import { propertiesDefinition, stylePropertiesDefinition } from './imageProperties';
import ImageStyle from './imageStyles';
import { runEvent } from '../util/runEvent';

function ImageComponent(props: ComponentProps) {
	const [showMagnifier, setShowMagnifier] = useState(false);
	//TO catch mouse x and y positions.
	const [[x, y], setXY] = useState([0, 0]);
	const [[width, height], setSize] = useState([0, 0]);
	const { definition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { alt, src, onClickEvent, zoomedImg, zoom } = {}, key } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const onCLickEvent = onClickEvent
		? props.pageDefinition.eventFunctions[onClickEvent]
		: undefined;
	const handleCLick = () => {
		(async () => await runEvent(onCLickEvent, key, props.context.pageName))();
	};
	const handleError = (e: any) => {
		e.currentTarget.src =
			'https://i.pinimg.com/736x/04/cf/66/04cf66fdf76be842dd82059c2486a394.jpg';
	};

	return (
		<div className="comp compImage">
			<HelperComponent definition={definition} />
			<div onClick={handleCLick}>
				<img
					className="image"
					src={src}
					alt={alt}
					onError={handleError}
					id="myImage"
					onMouseEnter={e => {
						const elem = e.currentTarget;
						//to turn on magnifier
						setShowMagnifier(true);
						//update width and height of the image  in pixels
						const { width, height } = elem.getBoundingClientRect();
						setSize([width, height]);

						// update cursor position
						const { top, left } = elem.getBoundingClientRect();
						// calculate cursor position on the image
						const x = e.pageX - left - window.pageXOffset;
						const y = e.pageY - top - window.pageYOffset;
						setXY([x, y]);
					}}
					onMouseLeave={() => {
						setShowMagnifier(false);
					}}
				/>
				<div id="zoom" className="zoomedImg"></div>
			</div>
		</div>
	);
}

const component: Component = {
	name: 'Image',
	displayName: 'Image',
	description: 'Image Component',
	component: ImageComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: ImageStyle,
	styleProperties: stylePropertiesDefinition,
};

export default component;
