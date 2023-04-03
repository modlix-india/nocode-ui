import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { HelperComponent } from '../HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './carouselProperties';
import CarouselStyle from './CarouselStyle';
import Children from '../Children';

function Carousel(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const { locationHistory, definition } = props;
	const { properties: { showDotsButtons, showArrowButtons, slideSpeed } = {} } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const ref = useRef<HTMLDivElement>(null);

	const [value, setValue] = useState<any>();
	const [slideNum, setSlideNum] = useState<number>(0);

	useEffect(() => {
		setValue(
			props.definition.children
				? Object.entries(props.definition.children)
						.filter((e: any) => !!e[1])
						.map(e => ({ key: e[0], children: { [e[0]]: e[1] } }))
				: [],
		);
	}, [props.definition.children]);

	useEffect(() => {
		if (!ref.current) return;
		const handle = setTimeout(() => {
			let num = slideNum + 1;
			setSlideNum(value.length > num ? num : 0);
		}, slideSpeed);
		return () => clearTimeout(handle);
	}, [value, ref.current, slideNum, setSlideNum]);

	useEffect(() => {
		if (!ref.current || !ref.current.children.length) return;
		ref.current.children[slideNum].scrollIntoView({ behavior: 'smooth' });
	}, [ref.current, slideNum]);

	const slides = (value ?? []).map((e: any) => (
		<div className="_eachSlide" key={e.key}>
			<Children
				children={e.children}
				context={props.context}
				pageDefinition={props.pageDefinition}
				locationHistory={locationHistory}
			/>
		</div>
	));

	return (
		<div className="comp compCarousel">
			<HelperComponent definition={definition} />
			<div className="innerDiv" ref={ref}>
				{slides}
			</div>
			{showArrowButtons && (
				<div>
					<button
						className="rightArrowButton fa-solid fa-chevron-right button"
						onClick={() => setSlideNum(slideNum == 0 ? value.length - 1 : slideNum - 1)}
					></button>
					<button
						className="leftArrowButton fa-solid fa-chevron-left button"
						onClick={() => setSlideNum(slideNum + 1 >= value.length ? 0 : slideNum + 1)}
					></button>
				</div>
			)}

			<div className="dotsDiv">
				{showDotsButtons &&
					(value ?? []).map((e: any, key: any) => (
						<button
							className="dots fa-regular fa-circle"
							onClick={() => setSlideNum(key)}
						></button>
					))}
			</div>
		</div>
	);
}

const component: Component = {
	icon: '',
	name: 'Carousel',
	displayName: 'Carousel',
	description: 'Carousel component',
	component: Carousel,
	styleComponent: CarouselStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
};

export default component;
