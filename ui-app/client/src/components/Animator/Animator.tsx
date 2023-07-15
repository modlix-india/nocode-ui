import React, { CSSProperties, useEffect, useMemo } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import useDefinition from '../util/useDefinition';
import AnimatorStyle from './AnimatorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './animatorProperties';
import { HelperComponent } from '../HelperComponent';
import { SubHelperComponent } from '../SubHelperComponent';

function makeAnimationString(animations: any[]): string {
	if (!animations || !animations.length) return '';
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
		properties: { animation } = {},
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

	useEffect(() => {
		if (!animation || !animation.length || !ref.current) return;

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

		const io = new IntersectionObserver(
			entries => {
				if (entries.length !== 1) return;
				const entry = entries[0];

				const th = entry.intersectionRatio;
				const closest = Array.from(
					(entry.isIntersecting ? entering : exiting).keys(),
				).filter(e => Math.abs(e - th) < 0.08);
				const currentAnimations = closest.flatMap(e =>
					(entry.isIntersecting ? entering : exiting).get(e),
				);
				setObservations(currentAnimations);
			},
			{ threshold: Array.from(new Set(threshold)) },
		);
		io.observe(ref.current);

		return () => io.unobserve(ref.current!);
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
	icon: 'fa-solid fa-wand-magic-sparkles',
	name: 'Animator',
	displayName: 'Animator',
	description: 'Animator component',
	component: Animator,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: AnimatorStyle,
	allowedChildrenType: new Map<string, number>([['', 1]]),
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Animator',
		type: 'Animator',
	},
};

export default component;
