import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import useDefinition from '../util/useDefinition';
import AnimatorStyle from './AnimatorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './animatorProperties';
import { styleProperties, styleDefaults } from './animatorStyleProperties';
import { IconHelper } from '../util/IconHelper';
import {
	observeScrollProgress,
	type ScrollAxis,
	type ScrollMode,
	type ScrollerRef,
} from '../util/scroll/scrollDriver';
import {
	isScrollDriven,
	prefersReducedMotion,
	rangeValue,
	REDUCED_MOTION_PROGRESS,
	scrubDelay,
	supportsScrollTimeline,
	timelineValue,
	type AnimationEntry,
} from '../util/scroll/scrollAnimation';

function makeAnimationString(animations: any[]): string {
	if (!animations?.length) return '';
	return animations
		.filter(a => a.observation === 'none')
		.map(a => makeOneAnimationString(a))
		.filter(a => !!a)
		.join(', ');
}

/**
 * The animations that are actually on this element, in the order the `animation`
 * shorthand lists them.
 *
 * Every per-animation longhand below (`animation-timeline`, `animation-range`,
 * `animation-delay`) is a COMMA LIST positionally matched against that
 * shorthand. Building them from a differently filtered list would silently
 * apply one animation's timeline to another.
 */
function activeAnimations(animations: any[]): AnimationEntry[] {
	return (animations ?? []).filter(
		a => a.observation === 'none' && a.condition && makeOneAnimationString(a),
	);
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

function Animator(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
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
		urlExtractor,
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

	// Every animation on the element, observation-triggered ones included once
	// they have fired, in shorthand order.
	const allAnimations = useMemo(
		() => [...animation, ...observations.map((e: any) => ({ ...e, observation: 'none' }))],
		[animation, observations],
	);
	const active = useMemo(() => activeAnimations(allAnimations), [allAnimations]);
	const scrollDriven = useMemo(() => active.filter(isScrollDriven), [active]);

	// One entry per ACTIVE animation, positionally aligned with the shorthand.
	// Clock-driven entries keep a progress of null, which is how the style
	// builder below knows to leave their delay and play state alone.
	const [progress, setProgress] = useState<Array<number | null>>([]);

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
						entry.boundingClientRect.top >= 0 &&
						entry.boundingClientRect.left >= 0 &&
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

					setObservations(currentAnimations);
				},
				{ threshold: Array.from(new Set(threshold)) },
			);
			io.observe(ref.current);
			return () => (ref.current ? io.unobserve(ref.current!) : undefined);
		} catch (e) {
			console.error('[Animator] observer setup failed', { key, error: e });
		}
	}, [animation, ref.current, setObservations]);

	// The JS fallback. Only runs where the browser cannot drive the animation
	// itself, because the native path is off the main thread and this is not.
	const native = useMemo(() => supportsScrollTimeline(), []);

	useEffect(() => {
		if (!scrollDriven.length || native || !ref.current) return;

		const el = ref.current;
		// Reduced motion is pinned to the END of each animation rather than
		// animated. The start frame of a reveal is usually "invisible", so
		// pinning to 0 would hide the content from exactly the people who asked
		// for less motion.
		if (prefersReducedMotion()) {
			setProgress(active.map(a => (isScrollDriven(a) ? REDUCED_MOTION_PROGRESS : null)));
			return;
		}

		const latest: Array<number | null> = active.map(a => (isScrollDriven(a) ? 0 : null));
		setProgress([...latest]);

		const stops = active.map((a, i) => {
			if (!isScrollDriven(a)) return () => {};
			return observeScrollProgress(
				{
					target: el,
					axis: (a.axis === 'inline' ? 'inline' : 'block') as ScrollAxis,
					mode: (a.timeline === 'scroll' ? 'scroll' : 'view') as ScrollMode,
					scroller: (a.scroller ?? 'nearest') as ScrollerRef,
					rangeStart: a.rangeStart ?? 0,
					rangeEnd: a.rangeEnd ?? 1,
				},
				p => {
					latest[i] = p;
					// A fresh array, because React compares by reference and a
					// mutated one would never re-render.
					setProgress([...latest]);
				},
			);
		});

		return () => stops.forEach(stop => stop());
		// `active` is rebuilt whenever the animation list or the observations
		// change, which is exactly when the subscriptions need rebuilding.
	}, [active, scrollDriven.length, native]);

	/**
	 * The per-animation longhands, as comma lists aligned with the shorthand.
	 *
	 * Returns an empty object when nothing on the element is scroll-driven, so a
	 * page that has never touched the timeline properties gets byte-identical
	 * styles to before. That, plus `timeline` defaulting to 'none', is the whole
	 * of the backward-compatibility story.
	 */
	const scrollStyles: React.CSSProperties = useMemo(() => {
		if (!scrollDriven.length) return {};

		if (native) {
			return {
				animationTimeline: active
					.map(a => (isScrollDriven(a) ? timelineValue(a) : 'auto'))
					.join(', '),
				animationRange: active
					.map(a => (isScrollDriven(a) ? rangeValue(a) : 'normal'))
					.join(', '),
			};
		}

		// Fallback: park each scroll-driven animation at its progress with a
		// negative delay, and pause it so the clock never advances past that.
		return {
			animationPlayState: active
				.map(a => (isScrollDriven(a) ? 'paused' : 'running'))
				.join(', '),
			animationDelay: active
				.map((a, i) =>
					isScrollDriven(a)
						? scrubDelay(a, progress[i] ?? 0)
						: `${a.animationDelay ?? 0}ms`,
				)
				.join(', '),
			// Held at both ends, or an animation parked at progress 0 or 1 would
			// snap back to the element's un-animated state at the edges.
			animationFillMode: active.map(() => 'both').join(', '),
		};
	}, [active, scrollDriven.length, native, progress]);

	return (
		<div className="comp compAnimator" style={resolvedStyles.comp ?? {}} ref={ref}>
			<HelperComponent context={props.context} key={`${key}_hlp`} definition={definition} />
			<div
				className="_childContainer"
				style={{
					...(resolvedStyles.container ?? {}),
					animation: makeAnimationString(allAnimations),
					...scrollStyles,
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
	stylePropertiesForTheme: styleProperties,
};

export default component;
