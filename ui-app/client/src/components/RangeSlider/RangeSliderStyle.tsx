import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './rangeSliderStyleProperties';

const PREFIX = '.comp.compRangeSlider';

export default function RangeSliderStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
        ${PREFIX} {
            position: relative;
            width: 95%;
            /*height: 40px;*/
            display: flex;
            align-items: center;
			justify-content: center;

        }

		${PREFIX} ._rangeTrack {
			position: relative;
			width: 100%;
			border-radius: 2px;
			cursor:pointer;
		}
		
		${PREFIX} ._rangeTrackFill {
			position: absolute;
			height: 100%;
			border-radius: 2px;
			z-index:1;
			cursor:pointer;
			
		}

        ${PREFIX} ._rangeThumb {
            position: absolute;
            border-radius: 50%;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
			margin-left: 5px;
        }

		${PREFIX} ._tooltip {
            white-space: nowrap;
            pointer-events: none;
			position: absolute;
			text-align: center;
			width: auto;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		${PREFIX} ._tooltip._bottom  {
			top: calc(100% + 10px);
			left: 50%;
			transform: translateX(-50%);
		}

		${PREFIX} ._tooltip._bottom::after {
			content: '';
			position: absolute;
			top: -9px;
			left: 50%;
			transform: translateX(-50%);
			width: 0;
			height: 0;
			border-left: 5px solid transparent;
			border-right: 5px solid transparent;
			border-bottom: 10px solid #1CBA79;
		}

		${PREFIX} ._tooltip._top {
			bottom: calc(100% + 10px);
			left: 50%;
			transform: translateX(-50%);
		}

		${PREFIX} ._tooltip._top::after {
			content: '';
			position: absolute;
			bottom: -9px;
			left: 50%;
			transform: translateX(-50%);
			width: 0;
			height: 0;
			border-left: 5px solid transparent;
			border-right: 5px solid transparent;
			border-top: 10px solid #1CBA79;
		}

		${PREFIX} ._tooltip._left {
			right: calc(100% + 10px);
			top: 50%;
			transform: translateY(-50%);
		}

		${PREFIX} ._tooltip._left::after {
			content: '';
			position: absolute;
			right: -8px;
			top: 50%;
			transform: translateY(-50%);
			width: 0;
			height: 0;
			border-top: 5px solid transparent;
			border-bottom: 5px solid transparent;
			border-left: 10px solid #1CBA79;
		}

		${PREFIX} ._tooltip._right {
			left: calc(100% + 10px);
			top: 50%;
			transform: translateY(-50%);
		}

		${PREFIX} ._tooltip._right::after {
			content: '';
			position: absolute;
			left: -9px;
			top: 50%;
			transform: translateY(-50%);
			width: 0;
			height: 10px;
			border-top: 5px solid transparent;
			border-bottom: 5px solid transparent;
			border-right: 10px solid #1CBA79;
		}

        ${PREFIX} ._min-tooltip {
            left: 10px;
            bottom: 100%;
            transform: translateX(-50%);
            margin-bottom: 10px;
			margin-left:5px;
			font-size:12px;
			position:absolute;
        }

		${PREFIX} ._min-tooltip._bottom {
            left: 10px;
            top: 100%;
            transform: translateX(-50%);
			position:absolute;
        }

        ${PREFIX} ._max-tooltip {
           right:10px;
            bottom: 100%;
            transform: translateX(50%);
            margin-bottom: 10px;
			font-size:12px;
			position:absolute;
        }

		${PREFIX} ._max-tooltip._bottom {
            right: 10px;
            top: 100%;
            transform: translateX(50%);
	    position:absolute;
        }

        ${PREFIX} ._value-tooltip {
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 5px;
        }

        ${PREFIX}._circular {
            width: 20vw;
            height: 20vw;
			max-width: 400px;
    		max-height: 400px;
			margin: 0 auto;
        }

        ${PREFIX}._circular ._circular_range {
            width: 100%;
            height: 100%;
        }

        ${PREFIX}._circular ._circular_track {
            stroke: #e0e0e0;
        }

        ${PREFIX}._circular ._circular_progress {
            stroke: #007bff;
            transition: stroke-dashoffset 0.3s ease;
        }

		 ${PREFIX}._circular ._circular_text {
            font-size: 12px;
            font-weight: bold;
            color: #333333;
        }
		${PREFIX}._circular ._circular-mark{
			fill:#6A7FFF; 
			}
		${PREFIX}._circular ._circular-mark._active-circular-mark{
		fill: #007bff;
		}	

		${PREFIX}._circular ._circular_thumb{
				fill: #007bff; 
  				 
				}	

		${PREFIX} ._tick {
			position: absolute;
			width: 100%;
			height: 20px;
			bottom: -25px;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-left: 10px;
			margin-right:10px;
		}

		${PREFIX} ._tick-labels{
			position: absolute;
			transform: translateX(-50%);
			font-size: 12px;
			font-weight:500;
			color: #888;
		}
		${PREFIX} ._tick-labels._active-tick-label{
		 color:#000000;
		 font-size:12px;
		 font-weight:600;
		}

		${PREFIX} ._tick._top{
		bottom: 100%;
		top: -25px;
		}

		${PREFIX} ._mark {
			position: absolute;
            width: 18px;
            height: 18px;
            background-color: #A3A3A3;
			color:#999999;
			font-size:12px;
            border-radius: 50%;
            top: 50%;
			border:2px solid #FFFFFF;
			box-shadow: 0px 2px 5px 0px #0000001A;
            transform: translateY(-50%);
			// margin-left: 10px;
            cursor: pointer;
			z-index:2;
		}
			${PREFIX} ._mark._active-mark{
					color:#333333;
					font-size:12px;
					background-color:#4C7FEE;
			}

		${PREFIX} ._mark-label{
			position:absolute;
			top:100%;
			margin-top:10px;
		}
       

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="RangeSliderCss">{css}</style>;
}
