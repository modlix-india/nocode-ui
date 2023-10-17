import React from 'react';

export function AngleSlider({
	value,
	onChange,
	min = 0,
	max = 100,
	step = 1,
}: {
	value?: number;
	onChange: (v: number) => void;
	min?: number;
	max?: number;
	step?: number;
}) {
	const ref = React.useRef<HTMLDivElement>(null);

	const percent = ((value ?? min) - min) / (max - min);
	const degrees = (percent < 0 || percent > 100 ? 50 : percent) * Math.PI * 2;
	const angleTrackCss: React.CSSProperties = {
		transform: `rotate(${degrees}rad)`,
	};

	return (
		<div
			className="_simpleEditorAngle"
			role="slider"
			ref={ref}
			onDoubleClick={() => onChange(value === min ? max : min)}
		>
			<div
				className="_angleTrack"
				style={angleTrackCss}
				onMouseDown={e => {
					if (!ref.current || e.buttons !== 1) return;
					e.preventDefault();
					e.stopPropagation();
					const startValue = value ?? min;
					const rect = ref.current.getBoundingClientRect();
					const onMouseMove = (e: MouseEvent) => {
						e.preventDefault();
						e.stopPropagation();
						if (e.buttons !== 1) {
							document.body.removeEventListener('mousemove', onMouseMove);
							document.body.removeEventListener('mouseup', onMouseUp);
							document.body.addEventListener('mouseleave', onMouseUp);
							return;
						}

						let angle =
							Math.atan2(
								e.clientY - rect.top - rect.height / 2,
								e.clientX - rect.left - rect.width / 2,
							) +
							Math.PI / 2;
						if (angle < 0) angle += Math.PI * 2;
						angle = angle / (Math.PI * 2);
						let newValue = !step
							? Math.round(angle * (max - min))
							: Math.round((angle * (max - min)) / step) * step;

						if (newValue < min) onChange(min);
						else if (newValue > max) onChange(max);
						else onChange(newValue);
					};
					const onMouseUp = (e: MouseEvent) => {
						e.preventDefault();
						e.stopPropagation();
						document.body.removeEventListener('mousemove', onMouseMove);
						document.body.removeEventListener('mouseup', onMouseUp);
						document.body.removeEventListener('mouseleave', onMouseUp);
					};
					document.body.addEventListener('mousemove', onMouseMove);
					document.body.addEventListener('mouseup', onMouseUp);
				}}
			/>
		</div>
	);
}
