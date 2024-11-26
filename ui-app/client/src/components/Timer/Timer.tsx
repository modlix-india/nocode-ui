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
					<circle cx="15" cy="15" r="15" fill="#EC255A" />
					<path
						d="M12.7628 10.0455V19.5H10.196V12.4091H10.1406L8.07244 13.6463V11.4673L10.3991 10.0455H12.7628ZM14.704 19.5V17.6534L18.231 14.7358C18.4649 14.5419 18.665 14.3603 18.8311 14.1911C19.0004 14.0187 19.1297 13.8417 19.2189 13.6602C19.3113 13.4786 19.3574 13.277 19.3574 13.0554C19.3574 12.8123 19.3051 12.6045 19.2005 12.4322C19.0989 12.2598 18.9573 12.1275 18.7757 12.0352C18.5942 11.9397 18.3849 11.892 18.1479 11.892C17.9109 11.892 17.7016 11.9397 17.5201 12.0352C17.3416 12.1306 17.2031 12.2706 17.1046 12.4553C17.0061 12.6399 16.9569 12.8646 16.9569 13.1293H14.5194C14.5194 12.4645 14.6686 11.892 14.9672 11.4119C15.2657 10.9318 15.6873 10.5625 16.2321 10.304C16.7768 10.0455 17.4154 9.91619 18.1479 9.91619C18.905 9.91619 19.5605 10.0378 20.1145 10.2809C20.6716 10.521 21.1009 10.8595 21.4025 11.2965C21.7072 11.7335 21.8596 12.246 21.8596 12.8338C21.8596 13.197 21.7842 13.5586 21.6333 13.9187C21.4825 14.2757 21.2117 14.6712 20.8208 15.1051C20.43 15.5391 19.8745 16.0561 19.1543 16.6562L18.2679 17.3949V17.4503H21.9611V19.5H14.704Z"
						fill="white"
						className="_timer12Number"
					/>
					<mask id="path-3-inside-1_0_1" fill="white">
						<path d="M16.4634 28.9233C14.5326 29.1262 12.5807 28.9254 10.7317 28.3335C8.88266 27.7416 7.17697 26.7715 5.72296 25.4851C4.26894 24.1986 3.0984 22.6237 2.28569 20.8606C1.47298 19.0974 1.03586 17.1845 1.00212 15.2434C0.968367 13.3022 1.33872 11.3753 2.08966 9.58493C2.84059 7.79459 3.95568 6.18001 5.36409 4.84376C6.77251 3.5075 8.44345 2.47879 10.2708 1.82296C12.0981 1.16714 14.0418 0.898542 15.9785 1.03424L15.8807 2.43082C14.1377 2.30869 12.3883 2.55042 10.7437 3.14067C9.0991 3.73091 7.59526 4.65675 6.32768 5.85938C5.06011 7.06201 4.05653 8.51513 3.38069 10.1264C2.70485 11.7377 2.37153 13.472 2.4019 15.219C2.43228 16.9661 2.82568 18.6877 3.55712 20.2745C4.28856 21.8614 5.34205 23.2787 6.65066 24.4366C7.95927 25.5944 9.49439 26.4674 11.1585 27.0001C12.8226 27.5328 14.5793 27.7136 16.3171 27.531L16.4634 28.9233Z" />
					</mask>
					<path
						d="M16.4634 28.9233C14.5326 29.1262 12.5807 28.9254 10.7317 28.3335C8.88266 27.7416 7.17697 26.7715 5.72296 25.4851C4.26894 24.1986 3.0984 22.6237 2.28569 20.8606C1.47298 19.0974 1.03586 17.1845 1.00212 15.2434C0.968367 13.3022 1.33872 11.3753 2.08966 9.58493C2.84059 7.79459 3.95568 6.18001 5.36409 4.84376C6.77251 3.5075 8.44345 2.47879 10.2708 1.82296C12.0981 1.16714 14.0418 0.898542 15.9785 1.03424L15.8807 2.43082C14.1377 2.30869 12.3883 2.55042 10.7437 3.14067C9.0991 3.73091 7.59526 4.65675 6.32768 5.85938C5.06011 7.06201 4.05653 8.51513 3.38069 10.1264C2.70485 11.7377 2.37153 13.472 2.4019 15.219C2.43228 16.9661 2.82568 18.6877 3.55712 20.2745C4.28856 21.8614 5.34205 23.2787 6.65066 24.4366C7.95927 25.5944 9.49439 26.4674 11.1585 27.0001C12.8226 27.5328 14.5793 27.7136 16.3171 27.531L16.4634 28.9233Z"
						stroke="white"
						stroke-width="2"
						mask="url(#path-3-inside-1_0_1)"
						className="_timer12Arc"
					/>
					<path
						d="M16.4634 28.9233C14.5326 29.1262 12.5807 28.9254 10.7317 28.3335C8.88266 27.7416 7.17697 26.7715 5.72296 25.4851C4.26894 24.1986 3.0984 22.6237 2.28569 20.8606C1.47298 19.0974 1.03586 17.1845 1.00212 15.2434C0.968367 13.3022 1.33872 11.3753 2.08966 9.58493C2.84059 7.79459 3.95568 6.18001 5.36409 4.84376C6.77251 3.5075 8.44345 2.47879 10.2708 1.82296C12.0981 1.16714 14.0418 0.898542 15.9785 1.03424L15.8807 2.43082C14.1377 2.30869 12.3883 2.55042 10.7437 3.14067C9.0991 3.73091 7.59526 4.65675 6.32768 5.85938C5.06011 7.06201 4.05653 8.51513 3.38069 10.1264C2.70485 11.7377 2.37153 13.472 2.4019 15.219C2.43228 16.9661 2.82568 18.6877 3.55712 20.2745C4.28856 21.8614 5.34205 23.2787 6.65066 24.4366C7.95927 25.5944 9.49439 26.4674 11.1585 27.0001C12.8226 27.5328 14.5793 27.7136 16.3171 27.531L16.4634 28.9233Z"
						stroke="white"
						stroke-width="2"
						mask="url(#path-3-inside-1_0_1)"
					/>

					<circle cx="15" cy="15" r="15" fill="#EC255A" opacity={0} />
					<path
						d="M6.62784 19.5V17.6534L10.1548 14.7358C10.3887 14.5419 10.5888 14.3603 10.755 14.1911C10.9242 14.0187 11.0535 13.8417 11.1428 13.6602C11.2351 13.4786 11.2812 13.277 11.2812 13.0554C11.2812 12.8123 11.2289 12.6045 11.1243 12.4322C11.0227 12.2598 10.8812 12.1275 10.6996 12.0352C10.518 11.9397 10.3087 11.892 10.0717 11.892C9.83475 11.892 9.62547 11.9397 9.44389 12.0352C9.26539 12.1306 9.12689 12.2706 9.02841 12.4553C8.92992 12.6399 8.88068 12.8646 8.88068 13.1293H6.44318C6.44318 12.4645 6.59245 11.892 6.89098 11.4119C7.18951 10.9318 7.61115 10.5625 8.1559 10.304C8.70064 10.0455 9.33925 9.91619 10.0717 9.91619C10.8288 9.91619 11.4844 10.0378 12.0384 10.2809C12.5954 10.521 13.0247 10.8595 13.3263 11.2965C13.631 11.7335 13.7834 12.246 13.7834 12.8338C13.7834 13.197 13.708 13.5586 13.5572 13.9187C13.4064 14.2757 13.1355 14.6712 12.7447 15.1051C12.3538 15.5391 11.7983 16.0561 11.0781 16.6562L10.1918 17.3949V17.4503H13.8849V19.5H6.62784ZM14.7367 18.0227V16.0284L18.5407 10.0455H20.3503V12.7045H19.3162L17.2665 15.9545V16.0284H22.8801V18.0227H14.7367ZM19.3347 19.5V17.4134L19.3901 16.5455V10.0455H21.7907V19.5H19.3347Z"
						fill="white"
						className="_timer24Number"
						opacity={0}
					/>
					<mask id="path-3-inside-1_0_1" fill="white">
						<path
							opacity={0}
							d="M29 15C29 22.732 22.732 29 15 29C7.26801 29 1 22.732 1 15C1 7.26801 7.26801 1 15 1C22.732 1 29 7.26801 29 15ZM2.4 15C2.4 21.9588 8.04121 27.6 15 27.6C21.9588 27.6 27.6 21.9588 27.6 15C27.6 8.04121 21.9588 2.4 15 2.4C8.04121 2.4 2.4 8.04121 2.4 15Z"
						/>
					</mask>
				</IconHelper>
			),
			mainComponent: true,
		},
	],
};

export default component;
