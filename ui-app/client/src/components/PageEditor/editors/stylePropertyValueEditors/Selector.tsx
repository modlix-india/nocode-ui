import React from 'react';
import { StyleResolutionDefinition } from '../../../../util/styleProcessor';

interface SelectorProps {
	size: string;
	onChange: (size: string) => void;
}

const RES_NAMES = Array.from(StyleResolutionDefinition.values())
	.sort((a, b) => a.order - b.order)
	.map(v => v.name);

function isSelected(size: string, iconSize: string) {
	if (!size || size === 'ALL') return false;
	const isTrue = size == iconSize;
	if (isTrue) return true;
	else if (size.endsWith('_ONLY') || size === 'WIDE_SCREEN') return false;
	const selectedIndex = RES_NAMES.indexOf(size);
	const index = RES_NAMES.indexOf(iconSize);
	if (size.endsWith('_SMALL')) return index >= selectedIndex - 1;
	return index <= selectedIndex + 1;
}

export function Selector({ size, onChange }: SelectorProps) {
	const changeDeviceType = (event: any, deviceType: string) => {
		if (deviceType === 'WIDE_SCREEN') {
			onChange(size === deviceType ? 'ALL' : deviceType);
			return;
		}
		if (event.shiftKey) {
			if (!size.endsWith('_ONLY')) {
				onChange(deviceType);
			} else {
				const type = size.replace('_ONLY', '');
				const selectedIndex = RES_NAMES.indexOf(size);
				const index = RES_NAMES.indexOf(deviceType);
				onChange(index < selectedIndex ? type : type + '_SMALL');
			}
			return;
		}
		onChange(size === deviceType ? 'ALL' : deviceType);
	};
	return (
		<div className="_propLabel _screenSizes" title="Screen Size">
			Screen:
			<div className={`svgContainer ${isSelected(size, 'WIDE_SCREEN') ? 'active' : ''}`}>
				<svg
					width="22"
					height="22"
					viewBox="0 0 22 22"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={isSelected(size, 'WIDE_SCREEN') ? 'active' : ''}
					onClick={e => changeDeviceType(e, 'WIDE_SCREEN')}
					style={{ width: '37px' }}
				>
					<path
						d="M19.2074 1H2.5696C1.70273 1 1 1.70273 1 2.5696V15.4992C1 16.3661 1.70273 17.0688 2.5696 17.0688H19.2074C20.0742 17.0688 20.777 16.3661 20.777 15.4992V2.5696C20.777 1.70273 20.0742 1 19.2074 1Z"
						strokeWidth="1.53"
					/>
					<path
						d="M5.5 20.3501H16.3"
						strokeWidth="1.53"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
			<div
				className={`svgContainer ${
					isSelected(size, 'DESKTOP_SCREEN_ONLY') ? 'active' : ''
				}`}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="21.054"
					height="14.604"
					viewBox="0 0 21.054 14.604"
					className={isSelected(size, 'DESKTOP_SCREEN_ONLY') ? 'active' : ''}
					onClick={e => changeDeviceType(e, 'DESKTOP_SCREEN_ONLY')}
					style={{ width: '37px' }}
				>
					<g id="Group_59" data-name="Group 59" transform="translate(-1341.261 -237.23)">
						<path
							id="Path_112"
							data-name="Path 112"
							d="M15.813,1H2.277A1.277,1.277,0,0,0,1,2.277V12.8a1.277,1.277,0,0,0,1.277,1.277H15.813A1.277,1.277,0,0,0,17.09,12.8V2.277A1.277,1.277,0,0,0,15.813,1Z"
							transform="translate(1342.743 236.995)"
							strokeWidth="1.53"
						/>
						<path
							id="Path_113"
							data-name="Path 113"
							d="M5.5,20.35H25.024"
							transform="translate(1336.526 230.719)"
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="1.53"
						/>
					</g>
				</svg>
			</div>
			<div
				className={`svgContainer ${
					isSelected(size, 'TABLET_LANDSCAPE_SCREEN_ONLY') ? 'active' : ''
				}`}
			>
				<svg
					className={isSelected(size, 'TABLET_LANDSCAPE_SCREEN_ONLY') ? 'active' : ''}
					onClick={e => changeDeviceType(e, 'TABLET_LANDSCAPE_SCREEN_ONLY')}
					width="25.53"
					style={{ width: '37px', transform: 'scale(0.8)' }}
					height="18.405"
					viewBox="0 0 25.53 18.405"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g
						id="Group_57"
						data-name="Group 57"
						transform="translate(24.765 0.765) rotate(90)"
					>
						<path
							id="Path_106"
							data-name="Path 106"
							d="M15.148,24H1.727A1.727,1.727,0,0,1,0,22.273V1.727A1.727,1.727,0,0,1,1.727,0H15.148a1.727,1.727,0,0,1,1.727,1.727V22.273A1.727,1.727,0,0,1,15.148,24Z"
							transform="translate(0 0)"
							strokeWidth="2"
							fill="none"
							style={{ fill: 'none' }}
						/>
						<path
							id="Path_107"
							data-name="Path 107"
							d="M9.523,18h-7.8A1.727,1.727,0,0,1,0,16.273V1.727A1.727,1.727,0,0,1,1.727,0h7.8A1.727,1.727,0,0,1,11.25,1.727V16.273A1.727,1.727,0,0,1,9.523,18Z"
							transform="translate(2.813 3)"
							strokeWidth="0"
						/>
						<path
							id="Path_108"
							data-name="Path 108"
							d="M1,0A1,1,0,1,1,0,1,1,1,0,0,1,1,0Z"
							transform="translate(7.907 2.282)"
							strokeWidth="0"
						/>
					</g>
				</svg>
			</div>
			<div
				className={`svgContainer ${
					isSelected(size, 'TABLET_POTRAIT_SCREEN_ONLY') ? 'active' : ''
				}`}
			>
				<svg
					className={isSelected(size, 'TABLET_POTRAIT_SCREEN_ONLY') ? 'active' : ''}
					onClick={e => changeDeviceType(e, 'TABLET_POTRAIT_SCREEN_ONLY')}
					style={{ transform: 'scale(0.8)' }}
					width="19"
					height="26"
					viewBox="0 0 19 26"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M16.1484 1H2.72656C1.77301 1 1 1.77301 1 2.72656V23.2734C1 24.227 1.77301 25 2.72656 25H16.1484C17.102 25 17.875 24.227 17.875 23.2734V2.72656C17.875 1.77301 17.102 1 16.1484 1Z"
						strokeWidth="2"
						fill="none"
						style={{ fill: 'none' }}
					/>
					<path
						d="M13.3359 4H5.53906C4.58551 4 3.8125 4.77301 3.8125 5.72656V20.2734C3.8125 21.227 4.58551 22 5.53906 22H13.3359C14.2895 22 15.0625 21.227 15.0625 20.2734V5.72656C15.0625 4.77301 14.2895 4 13.3359 4Z"
						strokeWidth="0"
					/>
					<path
						d="M9.90723 22.7178C10.4595 22.7178 10.9072 22.2701 10.9072 21.7178C10.9072 21.1655 10.4595 20.7178 9.90723 20.7178C9.35494 20.7178 8.90723 21.1655 8.90723 21.7178C8.90723 22.2701 9.35494 22.7178 9.90723 22.7178Z"
						strokeWidth="0"
					/>
				</svg>
			</div>
			<div
				className={`svgContainer ${
					isSelected(size, 'MOBILE_LANDSCAPE_SCREEN_ONLY') ? 'active' : ''
				}`}
			>
				<svg
					width="21"
					height="12"
					viewBox="0 0 21 12"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={isSelected(size, 'MOBILE_LANDSCAPE_SCREEN_ONLY') ? 'active' : ''}
					onClick={e => changeDeviceType(e, 'MOBILE_LANDSCAPE_SCREEN_ONLY')}
					style={{ width: '36px' }}
				>
					<path
						d="M1.28223 2.72656L1.28223 9.27344C1.28223 10.227 2.05523 11 3.00879 11L17.5557 11C18.5092 11 19.2822 10.227 19.2822 9.27344V2.72656C19.2822 1.77301 18.5092 1 17.5557 1L3.00879 1C2.05523 1 1.28223 1.77301 1.28223 2.72656Z"
						strokeWidth="1.53"
						fill="none"
						style={{ fill: 'none' }}
					/>
					<path
						d="M1 2.4375L1 10.4375C1 10.9898 1.44772 11.4375 2 11.4375L16 11.4375C16.5523 11.4375 17 10.9898 17 10.4375V2.4375C17 1.88521 16.5523 1.4375 16 1.4375L2 1.4375C1.44772 1.4375 1 1.88521 1 2.4375Z"
						strokeWidth="0"
					/>
					<path
						d="M2 4.4375L2 7.9375C2 8.21364 2.22386 8.4375 2.5 8.4375H3.5C3.77614 8.4375 4 8.21364 4 7.9375V4.4375C4 4.16136 3.77614 3.9375 3.5 3.9375H2.5C2.22386 3.9375 2 4.16136 2 4.4375Z"
						fill="white"
						style={{ fill: 'white' }}
						strokeWidth="0"
					/>
				</svg>
			</div>
			<div
				className={`svgContainer ${
					isSelected(size, 'MOBILE_POTRAIT_SCREEN_ONLY') ? 'active' : ''
				}`}
			>
				<svg
					width="13"
					height="21"
					viewBox="0 0 13 21"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={isSelected(size, 'MOBILE_POTRAIT_SCREEN_ONLY') ? 'active' : ''}
					onClick={e => changeDeviceType(e, 'MOBILE_POTRAIT_SCREEN_ONLY')}
					style={{ width: '28px' }}
				>
					<path
						d="M9.71094 1.28223H3.16406C2.21051 1.28223 1.4375 2.05523 1.4375 3.00879V17.5557C1.4375 18.5092 2.21051 19.2822 3.16406 19.2822H9.71094C10.6645 19.2822 11.4375 18.5092 11.4375 17.5557V3.00879C11.4375 2.05523 10.6645 1.28223 9.71094 1.28223Z"
						strokeWidth="1.53"
						fill="none"
						style={{ fill: 'none' }}
					/>
					<path
						d="M10 1H2C1.44772 1 1 1.44772 1 2V16C1 16.5523 1.44772 17 2 17H10C10.5523 17 11 16.5523 11 16V2C11 1.44772 10.5523 1 10 1Z"
						strokeWidth="0"
					/>
					<path
						d="M8 2H4.5C4.22386 2 4 2.22386 4 2.5V3.5C4 3.77614 4.22386 4 4.5 4H8C8.27614 4 8.5 3.77614 8.5 3.5V2.5C8.5 2.22386 8.27614 2 8 2Z"
						fill="white"
						style={{ fill: 'white' }}
						strokeWidth="0"
					/>
				</svg>
			</div>
		</div>
	);
}
