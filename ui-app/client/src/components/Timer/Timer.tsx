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
					<circle className="_timerBg" cx="15" cy="15" r="15" fill="#EC255A" />
					<path
						d="M17.2628 10.5455V20H14.696V12.9091H14.6406L12.5724 14.1463V11.9673L14.8991 10.5455H17.2628Z"
						fill="white"
						className="_timer1Number"
						opacity={0}
					/>
					<path
						d="M29 15C29 22.732 22.732 29 15 29C7.26801 29 1 22.732 1 15C1 7.26801 7.26801 1 15 1C22.732 1 29 7.26801 29 15ZM2.4 15C2.4 21.9588 8.04121 27.6 15 27.6C21.9588 27.6 27.6 21.9588 27.6 15C27.6 8.04121 21.9588 2.4 15 2.4C8.04121 2.4 2.4 8.04121 2.4 15Z"
						stroke="white"
						stroke-width="2"
						mask="url(#path-3-inside-1_0_1)"
						className="_timer1Arc"
						opacity={0}
					/>
					<path
						d="M11.6278 20V18.1534L15.1548 15.2358C15.3887 15.0419 15.5888 14.8603 15.755 14.6911C15.9242 14.5187 16.0535 14.3417 16.1428 14.1602C16.2351 13.9786 16.2812 13.777 16.2812 13.5554C16.2812 13.3123 16.2289 13.1045 16.1243 12.9322C16.0227 12.7598 15.8812 12.6275 15.6996 12.5352C15.518 12.4397 15.3087 12.392 15.0717 12.392C14.8348 12.392 14.6255 12.4397 14.4439 12.5352C14.2654 12.6306 14.1269 12.7706 14.0284 12.9553C13.9299 13.1399 13.8807 13.3646 13.8807 13.6293H11.4432C11.4432 12.9645 11.5924 12.392 11.891 11.9119C12.1895 11.4318 12.6112 11.0625 13.1559 10.804C13.7006 10.5455 14.3393 10.4162 15.0717 10.4162C15.8288 10.4162 16.4844 10.5378 17.0384 10.7809C17.5954 11.021 18.0247 11.3595 18.3263 11.7965C18.631 12.2335 18.7834 12.746 18.7834 13.3338C18.7834 13.697 18.708 14.0586 18.5572 14.4187C18.4064 14.7757 18.1355 15.1712 17.7447 15.6051C17.3538 16.0391 16.7983 16.5561 16.0781 17.1562L15.1918 17.8949V17.9503H18.8849V20H11.6278Z"
						fill="white"
						className="_timer2Number"
						opacity={0}
					/>
					<path
						d="M16.4634 28.9233C13.6433 29.2197 10.7996 28.6528 8.30883 27.2975C5.81802 25.9422 3.79747 23.8625 2.51461 21.3337C1.23176 18.8048 0.747069 15.946 1.1247 13.1356C1.50233 10.3252 2.72448 7.69572 4.62939 5.59519C6.5343 3.49466 9.03216 2.0221 11.7924 1.37241C14.5526 0.722719 17.445 0.926525 20.0869 1.95685C22.7287 2.98718 24.9954 4.79546 26.5869 7.14235C28.1785 9.48925 29.0198 12.2641 28.9996 15.0997L27.5997 15.0897C27.6179 12.5377 26.8606 10.0403 25.4283 7.92812C23.9959 5.81591 21.9559 4.18847 19.5782 3.26117C17.2005 2.33387 14.5973 2.15045 12.1131 2.73517C9.62895 3.31989 7.38087 4.64519 5.66645 6.53567C3.95203 8.42615 2.8521 10.7927 2.51223 13.322C2.17236 15.8514 2.60858 18.4243 3.76315 20.7003C4.91772 22.9763 6.73622 24.848 8.97795 26.0677C11.2197 27.2875 13.779 27.7977 16.3171 27.531L16.4634 28.9233Z"
						stroke="white"
						stroke-width="2"
						mask="url(#path-3-inside-1_0_1)"
						className="_timer2Arc"
						opacity={0}
					/>
					<path
						d="M15.321 20.1293C14.5762 20.1293 13.9145 20.0015 13.3359 19.7461C12.7604 19.4876 12.308 19.1321 11.9787 18.6797C11.6494 18.2273 11.4832 17.7071 11.4801 17.1193H14.0653C14.0684 17.3009 14.1238 17.464 14.2315 17.6087C14.3423 17.7502 14.4931 17.861 14.6839 17.9411C14.8748 18.0211 15.0933 18.0611 15.3395 18.0611C15.5765 18.0611 15.7857 18.0195 15.9673 17.9364C16.1489 17.8503 16.2905 17.7318 16.392 17.581C16.4936 17.4302 16.5429 17.2578 16.5398 17.0639C16.5429 16.8731 16.4844 16.7038 16.3643 16.5561C16.2474 16.4084 16.0827 16.293 15.8704 16.2099C15.658 16.1268 15.4134 16.0852 15.1364 16.0852H14.1761V14.3125H15.1364C15.3918 14.3125 15.6165 14.271 15.8104 14.1879C16.0073 14.1048 16.1597 13.9893 16.2674 13.8416C16.3782 13.6939 16.4321 13.5246 16.429 13.3338C16.4321 13.1491 16.3874 12.986 16.2951 12.8445C16.2028 12.7029 16.0735 12.5921 15.9073 12.5121C15.7442 12.4321 15.5549 12.392 15.3395 12.392C15.1056 12.392 14.8963 12.4336 14.7116 12.5167C14.5301 12.5998 14.387 12.7152 14.2823 12.8629C14.1777 13.0107 14.1238 13.1799 14.1207 13.3707H11.6648C11.6679 12.7921 11.8263 12.2812 12.1403 11.8381C12.4573 11.3949 12.8912 11.0471 13.4421 10.7947C13.993 10.5424 14.6255 10.4162 15.3395 10.4162C16.0381 10.4162 16.6552 10.5347 17.1907 10.7717C17.7293 11.0086 18.1494 11.3349 18.451 11.7504C18.7557 12.1628 18.9065 12.6352 18.9034 13.1676C18.9096 13.697 18.728 14.1309 18.3587 14.4695C17.9924 14.808 17.5277 15.008 16.9645 15.0696V15.1435C17.7277 15.2266 18.3017 15.4605 18.6864 15.8452C19.0711 16.2268 19.2604 16.7069 19.2543 17.2855C19.2573 17.8395 19.0911 18.3304 18.7557 18.7582C18.4233 19.186 17.9601 19.5214 17.3661 19.7646C16.7752 20.0077 16.0935 20.1293 15.321 20.1293Z"
						fill="white"
						className="_timer3Number"
						opacity={0}
					/>
					<path
						d="M16.4634 28.9233C14.5326 29.1262 12.5807 28.9254 10.7317 28.3335C8.88265 27.7416 7.17696 26.7715 5.72295 25.4851C4.26894 24.1986 3.0984 22.6237 2.28569 20.8606C1.47298 19.0974 1.03586 17.1845 1.00212 15.2434C0.968368 13.3022 1.33873 11.3753 2.08966 9.58492C2.84059 7.79458 3.95569 6.18 5.3641 4.84375C6.77251 3.50749 8.44346 2.47878 10.2708 1.82296C12.0981 1.16713 14.0418 0.898541 15.9785 1.03424L15.8807 2.43082C14.1377 2.30869 12.3883 2.55042 10.7437 3.14066C9.09911 3.7309 7.59526 4.65675 6.32769 5.85937C5.06012 7.062 4.05653 8.51512 3.38069 10.1264C2.70485 11.7377 2.37153 13.472 2.4019 15.219C2.43228 16.9661 2.82568 18.6877 3.55712 20.2745C4.28856 21.8613 5.34205 23.2787 6.65066 24.4365C7.95927 25.5944 9.49439 26.4674 11.1585 27.0001C12.8226 27.5328 14.5793 27.7136 16.3171 27.531L16.4634 28.9233Z"
						stroke="white"
						strokeWidth="2"
						mask="url(#path-3-inside-1_0_1)"
						className="_timer3Arc"
						opacity={0}
					/>
					<path
						className="_timer4Number"
						d="M10.5355 18.5227V16.5284L14.3395 10.5455H16.1491V13.2045H15.1151L13.0653 16.4545V16.5284H18.679V18.5227H10.5355ZM15.1335 20V17.9134L15.1889 17.0455V10.5455H17.5895V20H15.1335Z"
						fill="white"
					/>
					<path
						className="_timer4Arc"
						d="M16.4634 28.9233C14.5038 29.1293 12.5229 28.9193 10.6501 28.3071C8.77724 27.6949 7.05474 26.6942 5.59519 25.3706C4.13564 24.047 2.97192 22.4302 2.18013 20.6259C1.38835 18.8217 0.986324 16.8706 1.00035 14.9003L2.40032 14.9103C2.38769 16.6835 2.74951 18.4395 3.46212 20.0633C4.17473 21.6872 5.22208 23.1423 6.53567 24.3335C7.84926 25.5248 9.39952 26.4254 11.0851 26.9764C12.7706 27.5273 14.5535 27.7163 16.3171 27.531L16.4634 28.9233Z"
						stroke="white"
						strokeWidth="2"
						mask="url(#path-3-inside-1_0_1)"
					/>
					<circle cx="15" cy="15" r="14" stroke="#EC255A" strokeWidth="2" fill="none" />
				</IconHelper>
			),
			mainComponent: true,
		},
	],
};

export default component;
