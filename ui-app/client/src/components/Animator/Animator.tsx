import React, { useEffect } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponent';
import { SubHelperComponent } from '../SubHelperComponent';
import useDefinition from '../util/useDefinition';
import AnimatorStyle from './AnimatorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './animatorProperties';
import { styleDefaults } from './animatorStyleProperties';
import { IconHelper } from '../util/IconHelper';

function makeAnimationString(animations: any[]): string {
	if (!animations?.length) return '';
	return animations
		.filter(a => a.observation === 'none')
		.map(a => makeOneAnimationString(a))
		.filter(a => !!a)
		.join(', ');
}

function makeOneAnimationString(a: any): string {
	if (!a.condition) return '';
	return `${a.animationName} ${a.animationDuration}ms ${a.animationTimingFunction}${
		a.animationTimingFunction === 'cubic-bezier' || a.animationTimingFunction === 'steps'
			? `(${a.timingFunctionExtra})`
			: ''
	} ${a.animationDelay}ms ${a.animationIterationCount} ${a.animationDirection} ${
		a.animationFillMode
	}`;
}

function Animator(props: ComponentProps) {
	const { definition, pageDefinition, locationHistory, context } = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { animation = [] } = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const childs = (
		<Children
			key={`${key}_chld`}
			pageDefinition={pageDefinition}
			children={definition.children}
			context={context}
			locationHistory={locationHistory}
		/>
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [observations, setObservations] = React.useState<any[]>([]);

	const ref = React.useRef<HTMLDivElement>(null);

	const animationCount = React.useRef<{ [key: string]: number }>({});

	useEffect(() => {
		if (!animation?.length || !ref.current) return;

		const threshold: number[] = [];

		const entering: Map<number, any[]> = new Map();
		const exiting: Map<number, any[]> = new Map();

		for (let each of animation) {
			if (each.observation === 'none') continue;
			if (each.observation === 'entering') {
				if (!entering.has(each.enteringThreshold)) entering.set(each.enteringThreshold, []);
				entering.get(each.enteringThreshold)!.push(each);
				threshold.push(each.enteringThreshold);
			} else if (each.observation === 'exiting') {
				const th = each.exitingThreshold;
				if (!exiting.has(th)) exiting.set(th, []);
				exiting.get(th)!.push(each);
				threshold.push(th);
			}
		}

		try {
			const io = new IntersectionObserver(
				entries => {
					if (entries.length !== 1) return;
					const entry = entries[0];

					let isEntering =
						entry.boundingClientRect.top > 0 &&
						entry.boundingClientRect.left > 0 &&
						entry.isIntersecting;

					const th = entry.intersectionRatio;
					const closest = Array.from((isEntering ? entering : exiting).keys()).filter(
						e => Math.abs(e - th) < 0.08,
					);
					const currentAnimations: any[] = [];

					for (let each of closest) {
						const animations = (isEntering ? entering : exiting).get(each)!;
						for (let animation of animations) {
							const key = animation.key;
							if (animation.numOfObservations < 1) currentAnimations.push(animation);
							else {
								if (!animationCount.current[key]) animationCount.current[key] = 1;
								if (animationCount.current[key] <= animation.numOfObservations) {
									currentAnimations.push(animation);
									animationCount.current[key]++;
								}
							}
						}
					}

					closest.flatMap(e => (isEntering ? entering : exiting).get(e));

					setObservations(currentAnimations);
				},
				{ threshold: Array.from(new Set(threshold)) },
			);
			io.observe(ref.current);
			return () => io.unobserve(ref.current!);
		} catch (e) {}
	}, [animation, ref.current, setObservations]);

	return (
		<div className="comp compAnimator" style={resolvedStyles.comp ?? {}} ref={ref}>
			<HelperComponent key={`${key}_hlp`} definition={definition} />
			<div
				className="_childContainer"
				style={{
					...(resolvedStyles.container ?? {}),
					animation: makeAnimationString([
						...animation,
						...observations.map(e => ({ ...e, observation: 'none' })),
					]),
				}}
			>
				<SubHelperComponent
					key={`${key}_shlp`}
					definition={definition}
					subComponentName="container"
				/>
				{childs}
			</div>
		</div>
	);
}

const component: Component = {
	name: 'Animator',
	displayName: 'Animator',
	description: 'Animator component',
	component: Animator,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: AnimatorStyle,
	styleDefaults: styleDefaults,
	allowedChildrenType: new Map<string, number>([['', 1]]),
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Animator',
		type: 'Animator',
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M11.9969 19.1734C13.9139 19.1734 15.7155 18.4277 17.0698 17.0735C18.3605 15.7829 19.1062 14.0716 19.1697 12.2516C19.2332 10.237 18.4876 8.34679 17.0698 6.92919C15.6519 5.51159 13.763 4.76756 11.7437 4.82978C9.92626 4.89319 8.21465 5.63874 6.92411 6.92919C4.12686 9.72601 4.12686 14.2767 6.92411 17.0735C8.27839 18.4277 10.08 19.1734 11.9969 19.1734Z"
						fill="currentColor"
					/>
					<path
						d="M13.9091 19.1737C16.3373 19.1737 18.6193 18.2291 20.3347 16.5138C21.9697 14.8791 22.9142 12.7114 22.9946 10.4061C23.0751 7.85419 22.1306 5.45993 20.3347 3.66431C18.5388 1.86868 16.1461 0.926249 13.5883 1.00506C11.2863 1.08538 9.11824 2.02974 7.48356 3.66431C3.94038 7.20695 3.94038 12.9711 7.48356 16.5138C9.19899 18.2291 11.481 19.1737 13.9091 19.1737Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M10.083 22.9994C12.5111 22.9994 14.7931 22.0548 16.5085 20.3395C18.1435 18.7047 19.088 16.537 19.1685 14.2318C19.2489 11.6799 18.3044 9.28562 16.5085 7.48999C14.7126 5.69436 12.3199 4.75193 9.76218 4.83074C7.46011 4.91106 5.29207 5.85542 3.65739 7.48999C0.114204 11.0326 0.114204 16.7968 3.65739 20.3395C5.37282 22.0548 7.65483 22.9994 10.083 22.9994Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'container',
			displayName: 'Container',
			description: 'Container',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
