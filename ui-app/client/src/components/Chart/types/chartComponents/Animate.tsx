import { duplicate } from '@fincity/kirun-js';
import React, { useEffect } from 'react';

function Rect(props: React.SVGProps<SVGRectElement> & { easing: string; duration: number }) {
	const ref = React.useRef<SVGRectElement>(null);
	const oldCord = React.useRef({ x: 0, y: 0 });

	useEffect(() => {
		if (!ref.current || !props.duration) return;

		const x = typeof props.x === 'number' ? props.x : 0;
		const y = typeof props.y === 'number' ? props.y : 0;

		if (oldCord.current.x === x && oldCord.current.y === y) {
			return;
		}

		const animate = ref.current.animate(
			[
				{ transform: `translate(0,0)` },
				{
					transform: `translate(${x - oldCord.current.x}px, ${y - oldCord.current.y}px)`,
				},
			],
			{
				duration: props.duration,
				easing: props.easing,
			},
		);

		animate.onfinish = () => {
			oldCord.current = { ...oldCord.current, x, y };
			ref.current?.setAttribute('x', x.toString());
			ref.current?.setAttribute('y', y.toString());
		};

		return () => animate.cancel();
	}, [props.x, props.y, ref.current]);

	return (
		<rect
			{...props}
			x={!props.duration ? props.x : oldCord.current.x}
			y={!props.duration ? props.y : oldCord.current.y}
			ref={ref}
		>
			{props.children}
		</rect>
	);
}

function Text(props: React.SVGProps<SVGTextElement> & { easing: string; duration: number }) {
	const ref = React.useRef<SVGTextElement>(null);
	const oldCord = React.useRef({ x: 0, y: 0 });

	useEffect(() => {
		if (!ref.current || !props.duration) return;

		const x = typeof props.x === 'number' ? props.x : 0;
		const y = typeof props.y === 'number' ? props.y : 0;

		if (oldCord.current.x === x && oldCord.current.y === y) return;

		const animate = ref.current.animate(
			[
				{ transform: `translate(0,0)` },
				{
					transform: `translate(${x - oldCord.current.x}px, ${y - oldCord.current.y}px)`,
				},
			],
			{
				duration: props.duration,
				easing: props.easing,
			},
		);

		animate.onfinish = () => {
			oldCord.current = { ...oldCord.current, x, y };
			ref.current?.setAttribute('x', x.toString());
			ref.current?.setAttribute('y', y.toString());
		};

		return () => animate.cancel();
	}, [props.x, props.y, ref.current]);

	return (
		<text
			{...props}
			x={!props.duration ? props.x : oldCord.current.x}
			y={!props.duration ? props.y : oldCord.current.y}
			ref={ref}
		>
			{props.children}
		</text>
	);
}

export default { Rect, Text };
