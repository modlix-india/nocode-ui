enum Position {
	Top = 'top',
	TopStart = 'top-start',
	TopEnd = 'top-end',
	Bottom = 'bottom',
	BottomStart = 'bottom-start',
	BottomEnd = 'bottom-end',
	Left = 'left',
	LeftStart = 'left-start',
	LeftEnd = 'left-end',
	Right = 'right',
	RightStart = 'right-start',
	RightEnd = 'right-end',
}

export default function getPositions(position: Position, boxRect: DOMRect, popoverRect: DOMRect) {
	let top = 0;
	let bottom = 0;
	let left = 0;
	let right = 0;

	let bodyHeight = document.body.clientHeight;
	let bodyWidth = document.body.clientWidth;

	if (position.includes('bottom') || position.includes('top')) {
		let xAsixTipStyle = position.includes('end')
			? { left: `${boxRect.width * 0.5 + (popoverRect.width - boxRect.width)}px` }
			: position.includes('start')
				? { left: `${boxRect.width * 0.5}px` }
				: { left: `50%` };

		if (position === 'bottom-start' || position === 'top-start') {
			left = boxRect.x;
		} else if (position === 'bottom' || position === 'top') {
			left = boxRect.x + boxRect.width * 0.5 - popoverRect.width * 0.5;
		} else {
			right = bodyWidth - boxRect.x - boxRect.width;
		}

		top = boxRect.y + boxRect.height;
		bottom = bodyHeight - boxRect.y;
		const bottomCoords = position.includes('end')
			? { top: top, right: right }
			: { top: top, left: left };
		const topCoords = position.includes('end')
			? { bottom: bottom, right: right }
			: { bottom: bottom, left: left };
		if (top + popoverRect.height > bodyHeight) {
			return {
				coords: topCoords,
				tipPosition: 'bottomTip',
				tipStyle: xAsixTipStyle,
				marginContainer: { marginBottom: '14px' },
			};
		}
		if (bodyHeight - bottom - popoverRect.height < 0) {
			return {
				coords: bottomCoords,
				tipPosition: 'topTip',
				tipStyle: xAsixTipStyle,
				marginContainer: { marginTop: '14px' },
			};
		}
		return position.includes('bottom')
			? {
					coords: bottomCoords,
					tipPosition: 'topTip',
					tipStyle: xAsixTipStyle,
					marginContainer: { marginTop: '14px' },
				}
			: {
					coords: topCoords,
					tipPosition: 'bottomTip',
					tipStyle: xAsixTipStyle,
					marginContainer: { marginBottom: '14px' },
				};
	}

	let yAxisTipStyle = position.includes('end')
		? { top: `${boxRect.height * 0.5 + (popoverRect.height - boxRect.height)}px` }
		: position.includes('start')
			? { top: `${boxRect.height * 0.5}px` }
			: { top: '50%' };

	if (position === 'left-start' || position === 'right-start') {
		top = boxRect.y;
	} else if (position === 'left' || position === 'right') {
		top = boxRect.y + boxRect.height * 0.5 - popoverRect.height * 0.5; ////////
	} else {
		bottom = bodyHeight - boxRect.y - boxRect.height; //////////
	}

	right = bodyWidth - boxRect.x;
	left = boxRect.x + boxRect.width;
	const leftCoords = position.includes('end')
		? { bottom: bottom, right: right }
		: { top: top, right: right };
	const rightCoords = position.includes('end')
		? { bottom: bottom, left: left }
		: { top: top, left: left };
	if (right + popoverRect.width > bodyWidth) {
		return {
			coords: rightCoords,
			tipPosition: 'leftTip',
			tipStyle: yAxisTipStyle,
			marginContainer: { marginLeft: '14px' },
		};
	}
	if (left + popoverRect.width > bodyWidth) {
		return {
			coords: leftCoords,
			tipPosition: 'rightTip',
			tipStyle: yAxisTipStyle,
			marginContainer: { marginRight: '14px' },
		};
	} else {
		return position.includes('left')
			? {
					coords: leftCoords,
					tipPosition: 'rightTip',
					tipStyle: yAxisTipStyle,
					marginContainer: { marginRight: '14px' },
				}
			: {
					coords: rightCoords,
					tipPosition: 'leftTip',
					tipStyle: yAxisTipStyle,
					marginContainer: { marginLeft: '14px' },
				};
	}
}
