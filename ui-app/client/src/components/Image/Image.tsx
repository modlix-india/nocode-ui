import React, { useState } from 'react';
import { HelperComponent } from '../HelperComponent';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { PageStoreExtractor } from '../../context/StoreContext';
import { propertiesDefinition, stylePropertiesDefinition } from './imageProperties';
import ImageStyle from './ImageStyles';
import { runEvent } from '../util/runEvent';

function ImageComponent(props: ComponentProps) {
	const magnifierHeight = 10;
	const magnifieWidth = 10;
	const zoomLevel = 1;
	const [showMagnifier, setShowMagnifier] = useState(false);
	//TO store mouse x and y positions.
	const [[x, y], setXY] = useState([0, 0]);
	const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
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
	console.log(src);
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
						console.log(`width ${width} height ${height}`);
					}}
					onMouseMove={e => {
						const elem = e.currentTarget;
						// update cursor position
						const { top, left } = elem.getBoundingClientRect();
						// calculate cursor position on the image
						const x = e.pageX - left - window.pageXOffset;
						const y = e.pageY - top - window.pageYOffset;
						setXY([x, y]);
						console.log(x, y);
					}}
					onMouseLeave={() => {
						setShowMagnifier(false);
					}}
				/>

				<div
					style={{
						display: showMagnifier ? '' : 'none',
						position: 'relative',

						// prevent maginier blocks the mousemove event of img
						pointerEvents: 'none',
						// set size of magnifier
						height: `${imgHeight}px`,
						width: `${imgWidth}px`,
						// move element center to cursor pos
						top: `0px`,
						left: `250px`,
						opacity: '1', // reduce opacity so you can verify position
						border: '1px solid lightgray',
						backgroundColor: 'white',
						backgroundImage: `url('https://i.pinimg.com/736x/04/cf/66/04cf66fdf76be842dd82059c2486a394.jpg')`,
						backgroundRepeat: 'no-repeat',

						//calculate zoomed image size
						backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,

						//calculete position of zoomed image.
						backgroundPositionX: `${-x * zoomLevel + magnifieWidth / 2}px`,
						backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
					}}
				></div>
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
