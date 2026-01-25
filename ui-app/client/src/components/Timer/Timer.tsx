import React, { useEffect, useRef } from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import TimerStyle from './TimerStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './timerProperties';
import { styleProperties, styleDefaults } from './timerStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { messageToMaster } from '../../slaveFunctions';
import TimerIcon from './TimerIcon';

function Timer(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		properties: {
			timerType,
			duration,
			initialDelay,
			repeatCount,
			onTimerEventFunction,
			left = 0,
			top = 0,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	useEffect(() => {
		if (!onTimerEventFunction || !pageDefinition.eventFunctions?.[onTimerEventFunction]) return;

		let handler: NodeJS.Timeout | undefined = undefined;
		let count = 0;

		function run() {
			(async () =>
				await runEvent(
					pageDefinition.eventFunctions?.[onTimerEventFunction],
					onTimerEventFunction,
					context.pageName,
					locationHistory,
					pageDefinition,
				))();
			count++;

			if (
				(timerType === 'Non-Repeating' && count > 0) ||
				(repeatCount !== -1 && count >= repeatCount)
			) {
				handler = undefined;
				return;
			}

			handler = setTimeout(run, duration);
		}

		if (initialDelay > 0) handler = setTimeout(() => run(), initialDelay);
		else handler = setTimeout(run, duration);

		return () => {
			if (handler) clearTimeout(handler);
		};
	}, [timerType, duration, initialDelay, repeatCount, onTimerEventFunction]);

	const ref = useRef<HTMLDivElement>(null);

	return globalThis.designMode ? (
		<div
			className="comp compTimer"
			ref={ref}
			style={{ transform: `translate(${left}px, ${top}px)` }}
			onMouseDown={ev => {
				ev.preventDefault();
				ev.stopPropagation();

				if (!ref.current || ev.button !== 0) return;

				let startX = ev.clientX;
				let startY = ev.clientY;
				let newX = left;
				let newY = top;

				const mouseUpHandler = (e: MouseEvent) => {
					e.preventDefault();
					e.stopPropagation();
					document.body.removeEventListener('mousemove', mouseMoveHandler);
					document.body.removeEventListener('mouseup', mouseUpHandler);

					messageToMaster({
						type: 'SLAVE_COMP_PROP_CHANGED',
						payload: {
							key: props.definition.key,
							properties: [
								{
									name: 'left',
									value: newX,
								},
								{
									name: 'top',
									value: newY,
								},
							],
						},
					});
				};

				const mouseMoveHandler = (e: MouseEvent) => {
					e.preventDefault();
					e.stopPropagation();
					if (!ref.current) return;

					newX = left + e.clientX - startX;
					newY = top + e.clientY - startY;
					const style = `translate(${newX}px, ${newY}px)`;
					ref.current.style.transform = style;
				};

				document.body.addEventListener('mousemove', mouseMoveHandler);
				document.body.addEventListener('mouseup', mouseUpHandler);
			}}
		>
			<TimerIcon />
			<HelperComponent context={context} definition={definition} />
		</div>
	) : (
		<></>
	);
}

const component = {
	name: 'Timer',
	displayName: 'Timer',
	description: 'Timer component with user-defined function execution',
	component: Timer,
	styleComponent: TimerStyle,
	styleDefaults: styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		type: 'Timer',
		name: 'Timer',
		properties: {
			timerType: { value: 'Non-Repeating' },
			duration: { value: 1000 },
			initialDelay: { value: 0 },
			repeatCount: { value: -1 },
		},
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
