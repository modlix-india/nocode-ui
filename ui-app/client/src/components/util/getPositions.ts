export default function getPositions(position: String, boxRect: DOMRect, popoverRect: DOMRect) {
	let top = 0;
	let bottom = 0;
	let left = 0;
	let right = 0;
	let xAsixTip = '';
	let yAxisTip = '';

	let bodyHeight = document.body.clientHeight;
	let bodyWidth = document.body.clientWidth;

	if (position === 'bottom-start' || position === 'top-start') {
		left = boxRect.x;
	}
	if (position === 'bottom' || position === 'top') {
		left = boxRect.x + 0.5 * boxRect.width - 0.5 * popoverRect.width;
	}
	if (position === 'bottom-end' || position === 'top-end') {
		right = bodyWidth - boxRect.x - boxRect.width;
	}
	if (position.includes('bottom') || position.includes('top')) {
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
				margin: { marginBottom: '14px' },
			};
		}
		// if (bottom - popoverRect.height < 0) {
		if (bodyHeight - bottom - popoverRect.height < 0) {
			return { coords: bottomCoords, tipPosition: 'topTip', margin: { marginTop: '14px' } };
		}
		return position.includes('bottom')
			? { coords: bottomCoords, tipPosition: 'topTip', margin: { marginTop: '14px' } }
			: { coords: topCoords, tipPosition: 'bottomTip', margin: { marginBottom: '14px' } };
	}

	if (position === 'left-start' || position === 'right-start') {
		top = boxRect.y;
	}
	if (position === 'left' || position === 'right') {
		top = boxRect.y + boxRect.height * 0.5 - popoverRect.height * 0.5; ////////
	}
	if (position === 'left-end' || position === 'right-end') {
		bottom = bodyHeight - boxRect.y - boxRect.height * 0.75; //////////
	}
	if (position.includes('left') || position.includes('right')) {
		right = bodyWidth - boxRect.x;
		left = boxRect.x + boxRect.width;
		const leftCoords = position.includes('end')
			? { bottom: bottom, right: right }
			: { top: top, right: right };
		const rightCoords = position.includes('end')
			? { bottom: bottom, left: left }
			: { top: top, left: left };
		if (right + popoverRect.width > bodyWidth) {
			console.log('left overflow');
			return {
				coords: rightCoords,
				tipPosition: 'leftTip',
				margin: { marginLeft: '14px' },
			};
		}
		if (left + popoverRect.width > bodyWidth) {
			return {
				coords: leftCoords,
				tipPosition: 'rightTip',
				margin: { marginRight: '14px' },
			};
		} else {
			return position.includes('left')
				? { coords: leftCoords, tipPosition: 'leftTip', margin: { marginLeft: '14px' } }
				: {
						coords: rightCoords,
						tipPosition: 'rightTip',
						margin: { marginRight: '14px' },
				  };
		}
	}
}
