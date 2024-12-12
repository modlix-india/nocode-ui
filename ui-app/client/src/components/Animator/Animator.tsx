import React, { useEffect } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
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
			renderableChildren={definition.children}
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
			return () => (ref.current ? io.unobserve(ref.current!) : undefined);
		} catch (e) {}
	}, [animation, ref.current, setObservations]);

	return (
		<div className="comp compAnimator" style={resolvedStyles.comp ?? {}} ref={ref}>
			<HelperComponent context={props.context} key={`${key}_hlp`} definition={definition} />
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
				<IconHelper viewBox="0 0 30 30">
					<rect
						x="0.0737305"
						y="0.0731812"
						width="29.8534"
						height="29.8529"
						fill="#F9F9F9"
					/>
					<path
						className="_animatorGlobeBG1"
						d="M12.4568 5.25473C9.16189 5.23846 6.05895 6.50497 3.71968 8.82103C1.49015 11.0283 0.193969 13.9634 0.0693218 17.091C-0.0569787 20.5532 1.20862 23.8083 3.63354 26.2569C6.05847 28.7055 9.29895 30.0004 12.7703 29.9106C15.8946 29.817 18.8429 28.5501 21.072 26.3431C25.9037 21.5597 25.9424 13.7381 21.1582 8.90717C18.8419 6.56811 15.7516 5.27101 12.4568 5.25473Z"
						fill="#96A1B4"
						fillOpacity="0.2"
					/>
					<path
						className="_animatorGlobeBG2"
						d="M17.675 0.0865836C14.3801 0.0703073 11.2772 1.33682 8.93794 3.65287C6.70841 5.86011 5.41223 8.79522 5.28758 11.9228C5.16128 15.385 6.42688 18.6402 8.85181 21.0888C11.2767 23.5374 14.5172 24.8322 17.9885 24.7424C21.1129 24.6489 24.0611 23.382 26.2903 21.1749C31.122 16.3915 31.1607 8.56991 26.3764 3.73902C24.0602 1.39996 20.9699 0.10286 17.675 0.0865836Z"
						fill="#96A1B4"
						fillOpacity="0.2"
					/>
					<path
						className="_animatorglobe"
						d="M14.9962 24.7351C17.5974 24.7351 20.0422 23.7232 21.8799 21.8856C23.6314 20.1344 24.6433 17.8121 24.7295 15.3425C24.8157 12.6088 23.8038 10.0438 21.8799 8.12023C19.9559 6.19662 17.3926 5.18701 14.6525 5.27144C12.1863 5.35748 9.86371 6.36915 8.11248 8.12023C4.31667 11.9154 4.31667 18.0904 8.11248 21.8856C9.95021 23.7232 12.3949 24.7351 14.9962 24.7351Z"
						fill="#7E81D6"
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
