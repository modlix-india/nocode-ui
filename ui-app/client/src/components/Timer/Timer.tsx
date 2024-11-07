import React, { useCallback, useEffect, useRef } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import TimerStyle from './TimerStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './timerProperties';
import { styleDefaults } from './timerStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { messageToMaster } from '../../slaveFunctions';

function Timer(props: ComponentProps) {
	const { definition, pageDefinition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
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
	);

	useEffect(() => {
		if (!onTimerEventFunction || !pageDefinition.eventFunctions?.[onTimerEventFunction]) return;

		let handler: number | undefined = undefined;
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

	return window.designMode ? (
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
			{component.subComponentDefinition[0].icon}
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',

			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M14.0483 5.27883C14.0155 5.27883 13.978 5.27414 13.9452 5.26945C13.4484 5.19914 12.9374 5.17102 12.4171 5.17102C11.8968 5.17102 11.3905 5.19914 10.889 5.26945C10.8608 5.27414 10.8233 5.27883 10.7905 5.27883C4.70633 6.08039 0 11.2928 0 17.5834C0 24.4317 5.56852 30.0006 12.4171 30.0006C19.2657 30.0006 24.8342 24.432 24.8342 17.5834C24.8342 11.2928 20.1277 6.08042 14.0483 5.27883ZM12.4171 26.8128C7.33128 26.8128 3.18744 22.6738 3.18744 17.5831C3.18744 12.4973 7.33098 8.35828 12.4171 8.35828C17.5032 8.35828 21.6468 12.4973 21.6468 17.5831C21.6468 22.6783 17.5032 26.8128 12.4171 26.8128Z"
						fill="url(#paint0_linear_3214_9624)"
					/>
					<path
						d="M12.4168 17.1565C11.6293 17.1565 10.9824 17.794 10.9824 18.5815C10.9824 19.369 11.6246 20.0158 12.4168 20.0158C13.2089 20.0158 13.8511 19.3736 13.8511 18.5815C13.8511 17.794 13.2042 17.1565 12.4168 17.1565Z"
						fill="url(#paint1_linear_3214_9624)"
					/>
					<path
						className="_TimerHand"
						d="M12.8997 16.2376V11.0768C12.8997 10.8096 12.6841 10.594 12.4169 10.594C12.1497 10.594 11.9341 10.8096 11.9341 11.0768V16.2376C12.0935 16.2048 12.2528 16.1861 12.4169 16.1861C12.581 16.1861 12.7403 16.2048 12.8997 16.2376Z"
						fill="url(#paint2_linear_3214_9624)"
					/>
					<path
						className="_TimerClose1"
						d="M9.99805 0H14.8403V1.71561H9.99805V0Z"
						fill="url(#paint3_linear_3214_9624)"
					/>
					<path
						className="_TimerClose2"
						d="M12.4172 4.20526C12.8062 4.20526 13.1859 4.21932 13.5656 4.25682V2.68652H11.2734V4.25682C11.6484 4.22401 12.0328 4.20526 12.4172 4.20526Z"
						fill="url(#paint4_linear_3214_9624)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9624"
							x1="12.4171"
							y1="5.17102"
							x2="12.4171"
							y2="30.0006"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#24DFDF" />
							<stop offset="1" stopColor="#0F7B7B" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9624"
							x1="12.5"
							y1="17.0002"
							x2="12.4168"
							y2="20.0158"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#24DFDF" />
							<stop offset="1" stopColor="#0F7B7B" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9624"
							x1="12.5002"
							y1="11.5002"
							x2="12.4169"
							y2="16.2376"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#24DFDF" />
							<stop offset="1" stopColor="#0F7B7B" />
						</linearGradient>
						<linearGradient
							id="paint3_linear_3214_9624"
							x1="12.4192"
							y1="1"
							x2="12.4192"
							y2="1.71561"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#24DFDF" />
							<stop offset="1" stopColor="#01B5B5" />
						</linearGradient>
						<linearGradient
							id="paint4_linear_3214_9624"
							x1="12.4195"
							y1="2.68652"
							x2="12.4195"
							y2="4.25682"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0.45" stopColor="#24DFDF" />
							<stop offset="1" stopColor="#0BADAD" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
			mainComponent: true,
		},
	],
};

export default component;
