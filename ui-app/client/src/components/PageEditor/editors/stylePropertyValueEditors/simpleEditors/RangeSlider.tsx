import React from 'react';

export function RangeSlider({
	value,
	onChange,
	min = 0,
	max,
	step = 1,
}: {
	value?: number;
	onChange: (v: number) => void;
	min?: number;
	max: number;
	step?: number;
}) {
	const percent = (((value ?? min) - min) / (max - min)) * 100;
	const thumbLeft: React.CSSProperties = {
		left: `${percent < 0 || percent > 100 ? 50 : percent}%`,
	};
	const trackFillWidth: React.CSSProperties = {
		width: `${percent < 0 ? 0 : percent > 100 ? 50 : percent}%`,
	};
	const ref = React.useRef<HTMLDivElement>(null);
	return (
		<div className="_simpleEditorRange" role="slider" ref={ref}>
			<div className="_rangeTrack"></div>
			<div className="_rangeTrackFill" style={trackFillWidth}></div>
			<div
				className="_rangeThumb"
				style={thumbLeft}
				role="button"
				onMouseDown={e => {
					if (!ref.current || e.buttons !== 1) return;
					e.preventDefault();
					e.stopPropagation();
					const startX = e.clientX;
					const startValue = value ?? min;
					const width = ref.current.getBoundingClientRect().width;
					const onMouseMove = (e: MouseEvent) => {
						e.preventDefault();
						e.stopPropagation();
						if (e.buttons !== 1) {
							document.body.removeEventListener('mousemove', onMouseMove);
							document.body.removeEventListener('mouseup', onMouseUp);
							document.body.addEventListener('mouseleave', onMouseUp);
							return;
						}

						const diff = e.clientX - startX;
						const newValue = Math.round(startValue + (diff / width) * (max - min));
						if (newValue < min) onChange(min);
						else if (newValue > max) onChange(max);
						else onChange(newValue);
					};
					const onMouseUp = (e: MouseEvent) => {
						e.preventDefault();
						e.stopPropagation();
						document.body.removeEventListener('mousemove', onMouseMove);
						document.body.removeEventListener('mouseup', onMouseUp);
						document.body.addEventListener('mouseleave', onMouseUp);
					};
					document.body.addEventListener('mousemove', onMouseMove);
					document.body.addEventListener('mouseup', onMouseUp);
					document.body.addEventListener('mouseleave', onMouseUp);
				}}
			></div>
		</div>
	);
}
