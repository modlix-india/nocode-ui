import React, { useEffect } from 'react';

function Rect(
	props: React.SVGProps<SVGRectElement> & {
		easing: string;
		duration: number;
		oldX?: number;
		oldY?: number;
	},
) {
	const ref = React.useRef<SVGRectElement>(null);
	const oldCord = React.useRef({ x: props.oldX ?? 0, y: props.oldY ?? 0 });

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
	}, [props.x, props.y, ref.current, props.duration]);

	const newProps = { ...props };
	delete newProps.oldX;
	delete newProps.oldY;

	return (
		<rect
			{...newProps}
			x={!props.duration ? props.x : oldCord.current.x}
			y={!props.duration ? props.y : oldCord.current.y}
			ref={ref}
		>
			{props.children}
		</rect>
	);
}

function Text(
	props: React.SVGProps<SVGTextElement> & {
		easing: string;
		duration: number;
		oldX?: number;
		oldY?: number;
	},
) {
	const ref = React.useRef<SVGTextElement>(null);
	const oldCord = React.useRef({ x: props.oldX ?? 0, y: props.oldY ?? 0 });

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
	}, [props.x, props.y, ref.current, props.duration]);

	const newProps = { ...props };
	delete newProps.oldX;
	delete newProps.oldY;

	return (
		<text
			{...newProps}
			x={!props.duration ? props.x : oldCord.current.x}
			y={!props.duration ? props.y : oldCord.current.y}
			ref={ref}
		>
			{props.children}
		</text>
	);
}

function Line(
	props: React.SVGProps<SVGLineElement> & {
		easing: string;
		duration: number;
		oldX1?: number;
		oldY1?: number;
		oldX2?: number;
		oldY2?: number;
	},
) {
	const ref = React.useRef<SVGLineElement>(null);
	const oldCord = React.useRef({
		x1: props.oldX1 ?? 0,
		y1: props.oldY1 ?? 0,
		x2: props.oldX2 ?? 0,
		y2: props.oldY2 ?? 0,
	});

	useEffect(() => {
		if (!ref.current || !props.duration) return;

		const x1 = typeof props.x1 === 'number' ? props.x1 : 0;
		const y1 = typeof props.y1 === 'number' ? props.y1 : 0;
		const x2 = typeof props.x2 === 'number' ? props.x2 : 0;
		const y2 = typeof props.y2 === 'number' ? props.y2 : 0;

		if (
			oldCord.current.x1 === x1 &&
			oldCord.current.y1 === y1 &&
			oldCord.current.x2 === x2 &&
			oldCord.current.y2 === y2
		) {
			return;
		}

		const animate = ref.current.animate(
			[
				{
					d: `path('M${oldCord.current.x1} ${oldCord.current.y1} L${oldCord.current.x2} ${oldCord.current.y2}')`,
				},
				{
					d: `path('M${x1} ${y1} L${x2} ${y2}')`,
				},
			],
			{
				duration: props.duration,
				easing: props.easing,
			},
		);

		animate.onfinish = () => {
			oldCord.current = { ...oldCord.current, x1, y1, x2, y2 };
			ref.current?.setAttribute('d', `M${x1} ${y1} L${x2} ${y2}`);
		};

		return () => animate.cancel();
	}, [props.x1, props.y1, props.x2, props.y2, ref.current, props.duration]);

	const newProps = { ...props };
	delete newProps.oldX1;
	delete newProps.oldY1;
	delete newProps.oldX2;
	delete newProps.oldY2;

	return (
		<path
			{...newProps}
			d={`M${!props.duration ? props.x1 : oldCord.current.x1} ${
				!props.duration ? props.y1 : oldCord.current.y1
			} L${!props.duration ? props.x2 : oldCord.current.x2} ${
				!props.duration ? props.y2 : oldCord.current.y2
			}`}
			ref={ref}
		>
			{props.children}
		</path>
	);
}

export default { Rect, Text, Line };
