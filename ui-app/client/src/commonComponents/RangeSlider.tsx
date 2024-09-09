import React, { useMemo } from 'react';
import { onMouseDownDragStartCurry } from '../functions/utils';

export function RangeSlider({
	value,
	onChange,
	min = 0,
	max,
	step = 1,
}: Readonly<{
	value?: number;
	onChange: (v: number) => void;
	min?: number;
	max: number;
	step?: number;
}>) {
	const percent = (((value ?? min) - min) / (max - min)) * 100;
	const pixPercent = 6 * (percent / 100);
	const thumbLeft: React.CSSProperties = {
		left: `calc(${percent < 0 || percent > 100 ? 50 : percent}% - ${pixPercent}px)`,
	};
	const trackFillWidth: React.CSSProperties = {
		width: `calc(${percent < 0 ? 0 : percent > 100 ? 50 : percent}% - ${pixPercent}px)`,
	};
	const ref = React.useRef<HTMLDivElement>(null);

	const fixedPoint = useMemo(() => {
		const stepString = step.toString();
		const decimalIndex = stepString.indexOf('.');
		if (decimalIndex === -1) return 0;
		return stepString.length - decimalIndex - 1;
	}, [step]);
	return (
		<div
			className="_simpleEditorRange"
			role="slider"
			ref={ref}
			aria-valuenow={percent}
			onMouseDown={e => {
				e.stopPropagation();
				e.preventDefault();

				const left = e.currentTarget.getBoundingClientRect().left;
				const width = e.currentTarget.getBoundingClientRect().width;

				const clickLeft = e.clientX - left;
				const clickPercent = (clickLeft / width) * 100;
				let newValue = min + (clickPercent / 100) * (max - min);
				if (fixedPoint > 0) newValue = Number(newValue.toFixed(fixedPoint));

				onChange(newValue);
			}}
		>
			<div className="_rangeTrack"></div>
			<div className="_rangeTrackFill" style={trackFillWidth}></div>
			<div
				tabIndex={0}
				className="_rangeThumb"
				style={thumbLeft}
				role="button"
				onMouseDown={e => {
					e.preventDefault();
					e.stopPropagation();

					const startValue = value ?? min;
					const width = ref.current?.getBoundingClientRect()?.width ?? 0;
					onMouseDownDragStartCurry(e.clientX, 0, (newX, newY, diffX) => {
						let newValue = !step
							? Math.round(startValue + (diffX / width) * (max - min))
							: Math.round((startValue + (diffX / width) * (max - min)) / step) *
								step;
						if (fixedPoint > 0) newValue = Number(newValue.toFixed(fixedPoint));
						if (newValue < min) onChange(min);
						else if (newValue > max) onChange(max);
						else onChange(newValue);
					})(e);
				}}
			></div>
		</div>
	);
}
