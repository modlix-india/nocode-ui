import React, { useEffect, useState } from 'react';
import ComponentDefinitions from '../components';
import { STORE_PATH_APP, STORE_PATH_STYLE_PATH, STORE_PATH_THEME_PATH } from '../constants';
import { addListener } from '../context/StoreContext';
import { Component, StyleResolution } from '../types/common';
import { processStyleDefinition, StyleResolutionDefinition } from '../util/styleProcessor';
import { styleDefaults, styleProperties } from './appStyleProperties';
import MessageStyle from './Messages/MessageStyle';
import { FileBrowserStyles } from '../commonComponents/FileBrowser/FileBrowserStyles';

export default function AppStyle() {
	const [theme, setTheme] = useState<Map<string, Map<string, string>>>(
		new Map([[StyleResolution.ALL, styleDefaults]]),
	);
	const [style, setStyle] = useState('');
	const [compList, setCompList] = useState(new Set<string>());

	const TABLET_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.TABLET_POTRAIT_SCREEN,
	)?.minWidth;

	const TABLET_LAND_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.TABLET_LANDSCAPE_SCREEN,
	)?.minWidth;

	const DESKTOP_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.DESKTOP_SCREEN,
	)?.minWidth;

	useEffect(
		() =>
			addListener(
				(path, value) => {
					if (path == STORE_PATH_THEME_PATH) {
						if (!value) {
							setTheme(new Map([[StyleResolution.ALL, styleDefaults]]));
						} else {
							const thm: Map<string, Map<string, string>> = new Map(
								Object.entries<any>(value).map(([k, v]) => [
									k,
									new Map<string, string>(Object.entries<string>(v)),
								]),
							);

							thm.set(
								StyleResolution.ALL,
								thm.has(StyleResolution.ALL)
									? new Map<string, string>([
											...Array.from(styleDefaults),
											...Array.from(thm.get(StyleResolution.ALL) ?? []),
										])
									: styleDefaults,
							);

							setTheme(thm);
						}
					} else if (path == STORE_PATH_STYLE_PATH) setStyle(value ?? '');
					else if (path == STORE_PATH_APP)
						setCompList(value?.components ?? new Set<string>());
				},
				undefined,
				STORE_PATH_STYLE_PATH,
				STORE_PATH_THEME_PATH,
				STORE_PATH_APP,
			),
		[],
	);

	let css =
		`*,
	*:before,
	*:after {
		box-sizing: border-box;
	}

	${window.isDesignMode ? 'html { width: calc(100% - 6px) }' : ''}

	.hide{opacity:0;}
	.show{opacity:1;}
	.comp {position: relative;}
	*:hover::-webkit-scrollbar {float: right;}
	*:hover::-webkit-scrollbar-thumb {visibility: visible;}

	._popup._backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
	}

	._flexBox{
		display: flex;
	}

	._flexBox._gap5{
		gap: 5px;
	}

	._flexBox._gap10{
		gap: 10px;
	}

	._flexBox._column {
		flex-direction: column;
	}

	._flexBox._verticalCenter {
		align-items: center;
	}

	._flexBox ._flexChildren1 > *{
		flex: 1;
	}

	._flexBox ._flexChildren21 > *{
		flex: 1;
	}

	._flexBox ._flexChildren21 > *:first-child {
		flex: 2;
	}

	._flexBox._horizonatalCenter {
		justify-content: center;
	}

	._flex1 {
		flex: 1;
	}

	._ROWLAYOUT, ._SINGLECOLUMNLAYOUT, ._ROWCOLUMNLAYOUT {
		display: flex;
		flex-direction: column;
	}

	._ROWLAYOUT {
		flex-direction: row;
	}

	._FIVECOLUMNSLAYOUT,
	._FOURCOLUMNSLAYOUT,
	._THREECOLUMNSLAYOUT,
	._TWOCOLUMNSLAYOUT {
		display: grid;
		grid-template-columns: 1fr;
	}

	@media screen and (min-width: ${TABLET_MIN_WIDTH}px) {
	
		._FIVECOLUMNSLAYOUT,
		._FOURCOLUMNSLAYOUT,
		._THREECOLUMNSLAYOUT,
		._TWOCOLUMNSLAYOUT {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media screen and (min-width: ${DESKTOP_MIN_WIDTH}px) {
	
		._FIVECOLUMNSLAYOUT {grid-template-columns: 1fr 1fr 1fr 1fr 1fr;}

		._FOURCOLUMNSLAYOUT {grid-template-columns: 1fr 1fr 1fr 1fr;}

		._THREECOLUMNSLAYOUT {grid-template-columns: 1fr 1fr 1fr;}

		._ROWCOLUMNLAYOUT {flex-direction: row;}
	}

	._pointer {cursor: pointer;}
	._eachValidationMessage {position: relative;}
	._validationMessages {
		position:absolute;
		z-index:1;
		left: 0;
		top: 100%;
		margin-top: 5px;
	}

	.material-symbols-outlined,
	.material-symbols-rounded,
	.material-symbols-sharp,
	.material-icons,
	.material-icons-outlined,
	.material-icons-round,
	.material-icons-sharp,
	.material-icons-two-tone, {
		font-size: inherit;
	}

	/* only for demo */
	.mi.material-icons-outlined.demoicons {
		font-family: Arial;
		font-weight: normal;
		font-style: normal;
		font-size: 24px;
		line-height: 1;
		letter-spacing: normal;
		text-transform: none;
		display: inline-block;
		white-space: nowrap;
		word-wrap: normal;
		direction: ltr;
		-webkit-font-feature-settings: 'liga';
		-webkit-font-smoothing: antialiased;
	}
	.mio-demoicon1::before{ content: "\\2660"; }
	.mio-demoicon2::before{ content: "\\2663"; }
	.mio-demoicon3::before{ content: "\\2665"; }
	.mio-demoicon4::before{ content: "\\2666"; }

	.mio-demoicon-close::before{ content: "\\2715"; }

	.opacityShowOnHover {opacity: 0;}
	.opacityShowOnHover:hover {opacity: 1 !important;}
	.disableChildrenEvents * {pointer-events: none;}
	._helperChildren {z-index: 6; position: absolute; top: 100%}
	._helper ._iconHelperSVG {
		color: #fff;
		width: 12px;
		height: 12px;
		margin-right: 5px;
	}

	.fa._rotate-45::before, .ms._rotate-45::before, .mi._rotate-45::before {transform: rotate(45deg); display:block;}
	.fa._rotate-90::before, .ms._rotate-90::before, .mi._rotate-90::before {transform: rotate(90deg); display:block;}
	.fa._rotate-135::before, .ms._rotate-135::before, .mi._rotate-135::before {transform: rotate(135deg); display:block;}
	.fa._rotate-180::before, .ms._rotate-180::before, .mi._rotate-180::before {transform: rotate(180deg); display:block;}
	.fa._rotate-225::before, .ms._rotate-225::before, .mi._rotate-225::before {transform: rotate(225deg); display:block;}
	.fa._rotate-270::before, .ms._rotate-270::before, .mi._rotate-270::before {transform: rotate(270deg); display:block;}
	.fa._rotate-315::before, .ms._rotate-315::before, .mi._rotate-315::before {transform: rotate(315deg); display:block;}
	
	.fa._flip-x::before, .ms._flip-x::before, .mi._flip-x::before {transform: scaleX(-1); display:block;}
	.fa._flip-y::before, .ms._flip-y::before, .mi._flip-y::before {transform: scaleY(-1); display:block;}
	.fa._flip-both::before, .ms._flip-both::before, .mi._flip-both::before {transform: scale(-1, -1); display:block;}

	@keyframes _bounce{0%,100%,20%,53%,80%{transition-timing-function:cubic-bezier(0.215,0.61,0.355,1);transform:translate3d(0,0,0)}40%,43%{transition-timing-function:cubic-bezier(0.755,0.05,0.855,0.06);transform:translate3d(0,-30px,0)}70%{transition-timing-function:cubic-bezier(0.755,0.05,0.855,0.06);transform:translate3d(0,-15px,0)}90%{transform:translate3d(0,-4px,0)}}@keyframes _flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}@keyframes _pulse{0%,100%{transform:scale3d(1,1,1)}50%{transform:scale3d(1.05,1.05,1.05)}}@keyframes _rubberBand{0%,100%{transform:scale3d(1,1,1)}30%{transform:scale3d(1.25,.75,1)}40%{transform:scale3d(.75,1.25,1)}50%{transform:scale3d(1.15,.85,1)}65%{transform:scale3d(.95,1.05,1)}75%{transform:scale3d(1.05,.95,1)}}@keyframes _shake{0%,100%{transform:translate3d(0,0,0)}10%,30%,50%,70%,90%{transform:translate3d(-10px,0,0)}20%,40%,60%,80%{transform:translate3d(10px,0,0)}}@keyframes _swing{20%{transform:rotate3d(0,0,1,15deg)}40%{transform:rotate3d(0,0,1,-10deg)}60%{transform:rotate3d(0,0,1,5deg)}80%{transform:rotate3d(0,0,1,-5deg)}100%{transform:rotate3d(0,0,1,0deg)}}@keyframes _tada{0%,100%{transform:scale3d(1,1,1)}10%,20%{transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg)}30%,50%,70%,90%{transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg)}40%,60%,80%{transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg)}}@keyframes _wobble{0%,100%{transform:none}15%{transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg)}30%{transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg)}45%{transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg)}60%{transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg)}75%{transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg)}}@keyframes _bounceIn{0%,100%,20%,40%,60%,80%{transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)}0%{opacity:0;transform:scale3d(.3,.3,.3)}20%{transform:scale3d(1.1,1.1,1.1)}40%{transform:scale3d(.9,.9,.9)}60%{opacity:1;transform:scale3d(1.03,1.03,1.03)}80%{transform:scale3d(.97,.97,.97)}100%{opacity:1;transform:scale3d(1,1,1)}}@keyframes _bounceInDown{0%,100%,60%,75%,90%{transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)}0%{opacity:0;transform:translate3d(0,-3000px,0)}60%{opacity:1;transform:translate3d(0,25px,0)}75%{transform:translate3d(0,-10px,0)}90%{transform:translate3d(0,5px,0)}100%{transform:none}}@keyframes _bounceInLeft{0%,100%,60%,75%,90%{transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)}0%{opacity:0;transform:translate3d(-3000px,0,0)}60%{opacity:1;transform:translate3d(25px,0,0)}75%{transform:translate3d(-10px,0,0)}90%{transform:translate3d(5px,0,0)}100%{transform:none}}@keyframes _bounceInRight{0%,100%,60%,75%,90%{transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)}0%{opacity:0;transform:translate3d(3000px,0,0)}60%{opacity:1;transform:translate3d(-25px,0,0)}75%{transform:translate3d(10px,0,0)}90%{transform:translate3d(-5px,0,0)}100%{transform:none}}@keyframes _bounceInUp{0%,100%,60%,75%,90%{transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)}0%{opacity:0;transform:translate3d(0,3000px,0)}60%{opacity:1;transform:translate3d(0,-20px,0)}75%{transform:translate3d(0,10px,0)}90%{transform:translate3d(0,-5px,0)}100%{transform:translate3d(0,0,0)}}@keyframes _bounceOut{20%{transform:scale3d(.9,.9,.9)}50%,55%{opacity:1;transform:scale3d(1.1,1.1,1.1)}100%{opacity:0;transform:scale3d(.3,.3,.3)}}@keyframes _bounceOutDown{20%{transform:translate3d(0,10px,0)}40%,45%{opacity:1;transform:translate3d(0,-20px,0)}100%{opacity:0;transform:translate3d(0,2000px,0)}}@keyframes _bounceOutLeft{20%{opacity:1;transform:translate3d(20px,0,0)}100%{opacity:0;transform:translate3d(-2000px,0,0)}}@keyframes _bounceOutRight{20%{opacity:1;transform:translate3d(-20px,0,0)}100%{opacity:0;transform:translate3d(2000px,0,0)}}@keyframes _bounceOutUp{20%{transform:translate3d(0,-10px,0)}40%,45%{opacity:1;transform:translate3d(0,20px,0)}100%{opacity:0;transform:translate3d(0,-2000px,0)}}@keyframes _fadeIn{0%{opacity:0}100%{opacity:1}}@keyframes _fadeInDown{0%{opacity:0;transform:translate3d(0,-100%,0)}100%{opacity:1;transform:none}}@keyframes _fadeInDownBig{0%{opacity:0;transform:translate3d(0,-2000px,0)}100%{opacity:1;transform:none}}@keyframes _fadeInLeft{0%{opacity:0;transform:translate3d(-100%,0,0)}100%{opacity:1;transform:none}}@keyframes _fadeInLeftBig{0%{opacity:0;transform:translate3d(-2000px,0,0)}100%{opacity:1;transform:none}}@keyframes _fadeInRight{0%{opacity:0;transform:translate3d(100%,0,0)}100%{opacity:1;transform:none}}@keyframes _fadeInRightBig{0%{opacity:0;transform:translate3d(2000px,0,0)}100%{opacity:1;transform:none}}.fadeInRightBig{animation-name:fadeInRightBig}@keyframes _fadeInUp{0%{opacity:0;transform:translate3d(0,100%,0)}100%{opacity:1;transform:none}}@keyframes _fadeInUpBig{0%{opacity:0;transform:translate3d(0,2000px,0)}100%{opacity:1;transform:none}}@keyframes _fadeOut{0%{opacity:1}100%{opacity:0}}@keyframes _fadeOutDown{0%{opacity:1}100%{opacity:0;transform:translate3d(0,100%,0)}}@keyframes _fadeOutDownBig{0%{opacity:1}100%{opacity:0;transform:translate3d(0,2000px,0)}}@keyframes _fadeOutLeft{0%{opacity:1}100%{opacity:0;transform:translate3d(-100%,0,0)}}@keyframes _fadeOutLeftBig{0%{opacity:1}100%{opacity:0;transform:translate3d(-2000px,0,0)}}@keyframes _fadeOutRight{0%{opacity:1}100%{opacity:0;transform:translate3d(100%,0,0)}}@keyframes _fadeOutRightBig{0%{opacity:1}100%{opacity:0;transform:translate3d(2000px,0,0)}}@keyframes _fadeOutUp{0%{opacity:1}100%{opacity:0;transform:translate3d(0,-100%,0)}}@keyframes _fadeOutUpBig{0%{opacity:1}100%{opacity:0;transform:translate3d(0,-2000px,0)}}@keyframes _flip{0%{transform:perspective(400px) rotate3d(0,1,0,-360deg);animation-timing-function:ease-out}40%{transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);animation-timing-function:ease-out}50%{transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);animation-timing-function:ease-in}80%{transform:perspective(400px) scale3d(.95,.95,.95);animation-timing-function:ease-in}100%{transform:perspective(400px);animation-timing-function:ease-in}}@keyframes _flipInX{0%{transform:perspective(400px) rotate3d(1,0,0,90deg);transition-timing-function:ease-in;opacity:0}40%{transform:perspective(400px) rotate3d(1,0,0,-20deg);transition-timing-function:ease-in}60%{transform:perspective(400px) rotate3d(1,0,0,10deg);opacity:1}80%{transform:perspective(400px) rotate3d(1,0,0,-5deg)}100%{transform:perspective(400px)}}@keyframes _flipInY{0%{transform:perspective(400px) rotate3d(0,1,0,90deg);transition-timing-function:ease-in;opacity:0}40%{transform:perspective(400px) rotate3d(0,1,0,-20deg);transition-timing-function:ease-in}60%{transform:perspective(400px) rotate3d(0,1,0,10deg);opacity:1}80%{transform:perspective(400px) rotate3d(0,1,0,-5deg)}100%{transform:perspective(400px)}}@keyframes _flipOutX{0%{transform:perspective(400px)}30%{transform:perspective(400px) rotate3d(1,0,0,-20deg);opacity:1}100%{transform:perspective(400px) rotate3d(1,0,0,90deg);opacity:0}}@keyframes _flipOutY{0%{transform:perspective(400px)}30%{transform:perspective(400px) rotate3d(0,1,0,-15deg);opacity:1}100%{transform:perspective(400px) rotate3d(0,1,0,90deg);opacity:0}}@keyframes _lightSpeedIn{0%{transform:translate3d(100%,0,0) skewX(-30deg);opacity:0}60%{transform:skewX(20deg);opacity:1}80%{transform:skewX(-5deg);opacity:1}100%{transform:none;opacity:1}}@keyframes _lightSpeedOut{0%{opacity:1}100%{transform:translate3d(100%,0,0) skewX(30deg);opacity:0}}@keyframes _rotateIn{0%{transform-origin:center;transform:rotate3d(0,0,1,-200deg);opacity:0}100%{transform-origin:center;transform:none;opacity:1}}@keyframes _rotateInDownLeft{0%{transform-origin:left bottom;transform:rotate3d(0,0,1,-45deg);opacity:0}100%{transform-origin:left bottom;transform:none;opacity:1}}@keyframes _rotateInDownRight{0%{transform-origin:right bottom;transform:rotate3d(0,0,1,45deg);opacity:0}100%{transform-origin:right bottom;transform:none;opacity:1}}@keyframes _rotateInUpLeft{0%{transform-origin:left bottom;transform:rotate3d(0,0,1,45deg);opacity:0}100%{transform-origin:left bottom;transform:none;opacity:1}}@keyframes _rotateInUpRight{0%{transform-origin:right bottom;transform:rotate3d(0,0,1,-90deg);opacity:0}100%{transform-origin:right bottom;transform:none;opacity:1}}@keyframes _rotateOut{0%{transform-origin:center;opacity:1}100%{transform-origin:center;transform:rotate3d(0,0,1,200deg);opacity:0}}@keyframes _rotateOutDownLeft{0%{transform-origin:left bottom;opacity:1}100%{transform-origin:left bottom;transform:rotate(0,0,1,45deg);opacity:0}}@keyframes _rotateOutDownRight{0%{transform-origin:right bottom;opacity:1}100%{transform-origin:right bottom;transform:rotate3d(0,0,1,-45deg);opacity:0}}@keyframes _rotateOutUpLeft{0%{transform-origin:left bottom;opacity:1}100%{transform-origin:left bottom;transform:rotate3d(0,0,1,-45deg);opacity:0}}@keyframes _rotateOutUpRight{0%{transform-origin:right bottom;opacity:1}100%{transform-origin:right bottom;transform:rotate3d(0,0,1,90deg);opacity:0}}@keyframes _hinge{0%{transform-origin:top left;animation-timing-function:ease-in-out}20%,60%{transform:rotate3d(0,0,1,80deg);transform-origin:top left;animation-timing-function:ease-in-out}40%,80%{transform:rotate3d(0,0,1,60deg);transform-origin:top left;animation-timing-function:ease-in-out;opacity:1}100%{transform:translate3d(0,700px,0);opacity:0}}@keyframes _rollIn{0%{opacity:0;transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg)}100%{opacity:1;transform:none}}@keyframes _rollOut{0%{opacity:1}100%{opacity:0;transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg)}}@keyframes _zoomIn{0%{opacity:0;transform:scale3d(.3,.3,.3)}50%{opacity:1}}@keyframes _zoomInDown{0%{opacity:0;transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);animation-timing-function:cubic-bezier(0.55,0.055,0.675,0.19)}60%{opacity:1;transform:scale3d(.475,.475,.475) translate3d(0,60px,0);animation-timing-function:cubic-bezier(0.175,0.885,0.32,1)}}@keyframes _zoomInLeft{0%{opacity:0;transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);animation-timing-function:cubic-bezier(0.55,0.055,0.675,0.19)}60%{opacity:1;transform:scale3d(.475,.475,.475) translate3d(10px,0,0);animation-timing-function:cubic-bezier(0.175,0.885,0.32,1)}}@keyframes _zoomInRight{0%{opacity:0;transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);animation-timing-function:cubic-bezier(0.55,0.055,0.675,0.19)}60%{opacity:1;transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);animation-timing-function:cubic-bezier(0.175,0.885,0.32,1)}}@keyframes _zoomInUp{0%{opacity:0;transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);animation-timing-function:cubic-bezier(0.55,0.055,0.675,0.19)}60%{opacity:1;transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);animation-timing-function:cubic-bezier(0.175,0.885,0.32,1)}}@keyframes _zoomOut{0%{opacity:1}50%{opacity:0;transform:scale3d(.3,.3,.3)}100%{opacity:0}}@keyframes _zoomOutDown{40%{opacity:1;transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);animation-timing-function:cubic-bezier(0.55,0.055,0.675,0.19)}100%{opacity:0;transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);transform-origin:center bottom;animation-timing-function:cubic-bezier(0.175,0.885,0.32,1)}}@keyframes _zoomOutLeft{40%{opacity:1;transform:scale3d(.475,.475,.475) translate3d(42px,0,0)}100%{opacity:0;transform:scale(.1) translate3d(-2000px,0,0);transform-origin:left center}}@keyframes _zoomOutRight{40%{opacity:1;transform:scale3d(.475,.475,.475) translate3d(-42px,0,0)}100%{opacity:0;transform:scale(.1) translate3d(2000px,0,0);transform-origin:right center}}@keyframes _zoomOutUp{40%{opacity:1;transform:scale3d(.475,.475,.475) translate3d(0,60px,0);animation-timing-function:cubic-bezier(0.55,0.055,0.675,0.19)}100%{opacity:0;transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);transform-origin:center bottom;animation-timing-function:cubic-bezier(0.175,0.885,0.32,1)}}@keyframes _waitOpacity {0% { opacity: 0; } 100% { opacity: 0; }}@keyframes _spin{from{transform:rotate(0deg);} to{transform:rotate(360deg);}}	


	._simpleEditorPixelSize ._simpleEditorRange {
		flex: 2;
		margin-right: 12px;
		cursor: pointer;
	}

	._simpleEditorRange {
		position: relative;
	}

	._simpleEditorRange ._rangeTrack {
		 width: calc(100% - 6px);
		min-width: 60px;
		height: 2px;
		border-radius: 10px;
		background-color: #E2E2E7;			
		left: 0;
		z-index: 1;
	}

	._simpleEditorRange ._rangeTrackFill {
		width: 0%;
		height: 2px;
		border-radius: 10px;
		background-color: #52BD94;
		position: absolute;
		left: 0;
		z-index: 1;
		margin-top: -2px;
		transition: width 0s;
	}

	._simpleEditorRange ._rangeThumb {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background-color: #FFF;
		position: absolute;
		top: -7px;
		z-index: 1;
		cursor: pointer;
		box-shadow: 0px 1px 4px 0px #0000001A, 0px 1px 4px 0px #0000001A;
		cursor: pointer;
	}

	._simpleEditorRange ._rangeThumb::before {
		content: '';
		position: absolute;
		width: 8px;
		height: 8px;
		left: 3px;
		top: 3px;
		border-radius: 50%;
		background: linear-gradient(180deg, #7CD9B6 0%, #52BD94 100%);
	}

	._simpleEditorColorSelector {
		background: linear-gradient(90deg, #35F803 -26.56%, #4D7FEE 26.55%, #F9A71E 69.94%, #35F803 126.56%);
		width: 20px;
		height: 20px;
		border-radius: 50%;
		cursor: pointer;
		border: 3px solid #FFF;
		box-shadow: 0px 0px 5px 3px #00000017;
		position: relative;
	}

	._colorPickerBody {
		position: fixed;
		background-color: #FFF;
		z-index: 6;
		box-shadow: 0px 1px 4px 0px #00000026;
		border-radius: 6px;
		padding: 10px;
		min-height: 250px;
		width: 250px;
		margin-left: -240px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	._colorPickerBody ._color_variable_picker {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 12px;
		
		padding: 5px;
		flex-wrap: wrap;
	}

	._colorPickerBody ._color_variable {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0px 1px 2px 0px #00000026;
		position: relative;
	}

	._colorPickerBody ._color_variable._selected {
		border: 2px solid #51BD94;
		box-shadow: 0px 0px 4px 4px #51BD94;
	}

	._colorPickerBody ._color_variable::before {
		content: '';
		width: 100%;
		height: 100%;
		border-radius: 50%;
		position: absolute;
		background-image:
			linear-gradient(45deg, #EFEFEF 25%, transparent 25%),
			linear-gradient(-45deg, #EFEFEF 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #EFEFEF 75%),
			linear-gradient(-45deg, transparent 75%, #EFEFEF 75%);
		  background-size: 10px 10px;
		  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
		border-radius: 8px;
	}

	._colorPickerBody ._color_variable_name {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		position: absolute;
	}

	._colorPickerBody ._simpleEditorInput,
	._colorPickerBody ._simpleEditorSelect {
		min-height: 25px;
		padding-top: 3px;
		padding-bottom: 3px;
		border-radius: 4px;
		border: 1px solid #EEE;
		background: transparent;
	}

	._colorPickerBody ._saturation_value_picker{
		position: relative;
		height: 150px;
		border-radius: 6px;
	}

	._colorPickerBody ._saturation_value_picker ._thumb {
		margin-top: -8px;
	}

	._colorPickerBody ._hue_picker{
		background: linear-gradient(to right,red 0,#ff0 16.66%,#0f0 33.33%,#0ff 50%,#00f 66.66%,#f0f 83.33%,red 100%);
		height: 10px;
		width: 100%;
		border-radius: 8px;
		position: relative;
		margin-bottom: 10px;
	}

	._colorPickerBody ._alpha_picker {
		cursor: pointer;
		height: 10px;
		position: relative;
		flex: 3;
		margin-right: 8px;
		background-image:
			linear-gradient(45deg, #EFEFEF 25%, transparent 25%),
			linear-gradient(-45deg, #EFEFEF 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #EFEFEF 75%),
			linear-gradient(-45deg, transparent 75%, #EFEFEF 75%);
		  background-size: 10px 10px;
		  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
		border-radius: 8px;
	}

	._colorPickerBody ._alpha_picker_gradient {
		position: absolute;
		height: 100%;
		width: 100%;
		border-radius: 8px;
	}

	._colorPickerBody ._colorValueline {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex: 1;
		gap: 5px;
	}

	._colorPickerBody ._colorValues {
		margin-right: 2px;
		padding-right: 5px;
		border-right: 0.5px solid #0000000D;
	}

	._colorPickerBody ._thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background-color: #FFF;
		position: absolute;
		top: -4px;
		z-index: 1;
		cursor: pointer;
		box-shadow: 0px 2px 4px 0px #00000033;
		cursor: pointer;
		margin-left: -8px;
		border: 3px solid #FFF;
		pointer-events: none;
	}
	
	._colorPickerBody ._thumbInner {
		position: absolute;
		width: 60%;
		height: 60%;
		left: 20%;
		top: 20%;
		border-radius: 50%;
		background-color: #4C7FEE;
	}

	span._flag { width: 44px; height: 30px; transform:scale(0.5); }
	
	._flag { background: url("api/files/static/file/SYSTEM/jslib/flags/flags.png") no-repeat; background-size: 100%; }
	._flag.ad { background-position: 0 0.413223%; }._flag.ae { background-position: 0 0.826446%; } ._flag.af { background-position: 0 1.239669%; }._flag.ag { background-position: 0 1.652893%; }._flag.ai { background-position: 0 2.066116%; }._flag.al { background-position: 0 2.479339%; }._flag.am { background-position: 0 2.892562%; }._flag.an { background-position: 0 3.305785%; }._flag.ao { background-position: 0 3.719008%; }._flag.aq { background-position: 0 4.132231%; }._flag.ar { background-position: 0 4.545455%; }._flag.as { background-position: 0 4.958678%; }._flag.at { background-position: 0 5.371901%; }._flag.au { background-position: 0 5.785124%; }._flag.aw { background-position: 0 6.198347%; }._flag.az { background-position: 0 6.61157%; }._flag.ba { background-position: 0 7.024793%; }._flag.bb { background-position: 0 7.438017%; }._flag.bd { background-position: 0 7.85124%; }._flag.be { background-position: 0 8.264463%; }._flag.bf { background-position: 0 8.677686%; }._flag.bg { background-position: 0 9.090909%; }._flag.bh { background-position: 0 9.504132%; }._flag.bi { background-position: 0 9.917355%; }._flag.bj { background-position: 0 10.330579%; }._flag.bm { background-position: 0 10.743802%; }._flag.bn { background-position: 0 11.157025%; }._flag.bo { background-position: 0 11.570248%; }._flag.br { background-position: 0 11.983471%; }._flag.bs { background-position: 0 12.396694%; }._flag.bt { background-position: 0 12.809917%; }._flag.bv { background-position: 0 13.22314%; }._flag.bw { background-position: 0 13.636364%; }._flag.by { background-position: 0 14.049587%; }._flag.bz { background-position: 0 14.46281%; }._flag.ca { background-position: 0 14.876033%; }._flag.cc { background-position: 0 15.289256%; }._flag.cd { background-position: 0 15.702479%; }._flag.cf { background-position: 0 16.115702%; }._flag.cg { background-position: 0 16.528926%; }._flag.ch { background-position: 0 16.942149%; }._flag.ci { background-position: 0 17.355372%; }._flag.ck { background-position: 0 17.768595%; }._flag.cl { background-position: 0 18.181818%; }._flag.cm { background-position: 0 18.595041%; }._flag.cn { background-position: 0 19.008264%; }._flag.co { background-position: 0 19.421488%; }._flag.cr { background-position: 0 19.834711%; }._flag.cu { background-position: 0 20.247934%; }._flag.cv { background-position: 0 20.661157%; }._flag.cx { background-position: 0 21.07438%; }._flag.cy { background-position: 0 21.487603%; }._flag.cz { background-position: 0 21.900826%; }._flag.de { background-position: 0 22.31405%; }._flag.dj { background-position: 0 22.727273%; }._flag.dk { background-position: 0 23.140496%; }._flag.dm { background-position: 0 23.553719%; }._flag.do { background-position: 0 23.966942%; }._flag.dz { background-position: 0 24.380165%; }._flag.ec { background-position: 0 24.793388%; }._flag.ee { background-position: 0 25.206612%; }._flag.eg { background-position: 0 25.619835%; }._flag.eh { background-position: 0 26.033058%; }._flag.er { background-position: 0 26.446281%; }._flag.es { background-position: 0 26.859504%; }._flag.et { background-position: 0 27.272727%; }._flag.fi { background-position: 0 27.68595%; }._flag.fj { background-position: 0 28.099174%; }._flag.fk { background-position: 0 28.512397%; }._flag.fm { background-position: 0 28.92562%; }._flag.fo { background-position: 0 29.338843%; }._flag.fr { background-position: 0 29.752066%; }._flag.ga { background-position: 0 30.165289%; }._flag.gd { background-position: 0 30.578512%; }._flag.ge { background-position: 0 30.991736%; }._flag.gf { background-position: 0 31.404959%; }._flag.gh { background-position: 0 31.818182%; }._flag.gi { background-position: 0 32.231405%; }._flag.gl { background-position: 0 32.644628%; }._flag.gm { background-position: 0 33.057851%; }._flag.gn { background-position: 0 33.471074%; }._flag.gp { background-position: 0 33.884298%; }._flag.gq { background-position: 0 34.297521%; }._flag.gr { background-position: 0 34.710744%; }._flag.gs { background-position: 0 35.123967%; }._flag.gt { background-position: 0 35.53719%; }._flag.gu { background-position: 0 35.950413%; }._flag.gw { background-position: 0 36.363636%; }._flag.gy { background-position: 0 36.77686%; }._flag.hk { background-position: 0 37.190083%; }._flag.hm { background-position: 0 37.603306%; }._flag.hn { background-position: 0 38.016529%; }._flag.hr { background-position: 0 38.429752%; }._flag.ht { background-position: 0 38.842975%; }._flag.hu { background-position: 0 39.256198%; }._flag.id { background-position: 0 39.669421%; }._flag.ie { background-position: 0 40.082645%; }._flag.il { background-position: 0 40.495868%; }._flag.in { background-position: 0 40.909091%; }._flag.io { background-position: 0 41.322314%; }._flag.iq { background-position: 0 41.735537%; }._flag.ir { background-position: 0 42.14876%; }._flag.is { background-position: 0 42.561983%; }._flag.it { background-position: 0 42.975207%; }._flag.jm { background-position: 0 43.38843%; }._flag.jo { background-position: 0 43.801653%; }._flag.jp { background-position: 0 44.214876%; }._flag.ke { background-position: 0 44.628099%; }._flag.kg { background-position: 0 45.041322%; }._flag.kh { background-position: 0 45.454545%; }._flag.ki { background-position: 0 45.867769%; }._flag.km { background-position: 0 46.280992%; }._flag.kn { background-position: 0 46.694215%; }._flag.kp { background-position: 0 47.107438%; }._flag.kr { background-position: 0 47.520661%; }._flag.kw { background-position: 0 47.933884%; }._flag.ky { background-position: 0 48.347107%; }._flag.kz { background-position: 0 48.760331%; }._flag.la { background-position: 0 49.173554%; }._flag.lb { background-position: 0 49.586777%; }._flag.lc { background-position: 0 50%; }._flag.li { background-position: 0 50.413223%; }._flag.lk { background-position: 0 50.826446%; }._flag.lr { background-position: 0 51.239669%; }._flag.ls { background-position: 0 51.652893%; }._flag.lt { background-position: 0 52.066116%; }._flag.lu { background-position: 0 52.479339%; }._flag.lv { background-position: 0 52.892562%; }._flag.ly { background-position: 0 53.305785%; }._flag.ma { background-position: 0 53.719008%; }._flag.mc { background-position: 0 54.132231%; }._flag.md { background-position: 0 54.545455%; }._flag.me { background-position: 0 54.958678%; }._flag.mg { background-position: 0 55.371901%; }._flag.mh { background-position: 0 55.785124%; }._flag.mk { background-position: 0 56.198347%; }._flag.ml { background-position: 0 56.61157%; }._flag.mm { background-position: 0 57.024793%; }._flag.mn { background-position: 0 57.438017%; }._flag.mo { background-position: 0 57.85124%; }._flag.mp { background-position: 0 58.264463%; }._flag.mq { background-position: 0 58.677686%; }._flag.mr { background-position: 0 59.090909%; }._flag.ms { background-position: 0 59.504132%; }._flag.mt { background-position: 0 59.917355%; }._flag.mu { background-position: 0 60.330579%; }._flag.mv { background-position: 0 60.743802%; }._flag.mw { background-position: 0 61.157025%; }._flag.mx { background-position: 0 61.570248%; }._flag.my { background-position: 0 61.983471%; }._flag.mz { background-position: 0 62.396694%; }._flag.na { background-position: 0 62.809917%; }._flag.nc { background-position: 0 63.22314%; }._flag.ne { background-position: 0 63.636364%; }._flag.nf { background-position: 0 64.049587%; }._flag.ng { background-position: 0 64.46281%; }._flag.ni { background-position: 0 64.876033%; }._flag.nl { background-position: 0 65.289256%; }._flag.no { background-position: 0 65.702479%; }._flag.np { background-position: 0 66.115702%; }._flag.nr { background-position: 0 66.528926%; }._flag.nu { background-position: 0 66.942149%; }._flag.nz { background-position: 0 67.355372%; }._flag.om { background-position: 0 67.768595%; }._flag.pa { background-position: 0 68.181818%; }._flag.pe { background-position: 0 68.595041%; }._flag.pf { background-position: 0 69.008264%; }._flag.pg { background-position: 0 69.421488%; }._flag.ph { background-position: 0 69.834711%; }._flag.pk { background-position: 0 70.247934%; }._flag.pl { background-position: 0 70.661157%; }._flag.pm { background-position: 0 71.07438%; }._flag.pn { background-position: 0 71.487603%; }._flag.pr { background-position: 0 71.900826%; }._flag.pt { background-position: 0 72.31405%; }._flag.pw { background-position: 0 72.727273%; }._flag.py { background-position: 0 73.140496%; }._flag.qa { background-position: 0 73.553719%; }._flag.re { background-position: 0 73.966942%; }._flag.ro { background-position: 0 74.380165%; }._flag.rs { background-position: 0 74.793388%; }._flag.ru { background-position: 0 75.206612%; }._flag.rw { background-position: 0 75.619835%; }._flag.sa { background-position: 0 76.033058%; }._flag.sb { background-position: 0 76.446281%; }._flag.sc { background-position: 0 76.859504%; }._flag.sd { background-position: 0 77.272727%; }._flag.se { background-position: 0 77.68595%; }._flag.sg { background-position: 0 78.099174%; }._flag.sh { background-position: 0 78.512397%; }._flag.si { background-position: 0 78.92562%; }._flag.sj { background-position: 0 79.338843%; }._flag.sk { background-position: 0 79.752066%; }._flag.sl { background-position: 0 80.165289%; }._flag.sm { background-position: 0 80.578512%; }._flag.sn { background-position: 0 80.991736%; }._flag.so { background-position: 0 81.404959%; }._flag.sr { background-position: 0 81.818182%; }._flag.ss { background-position: 0 82.231405%; }._flag.st { background-position: 0 82.644628%; }._flag.sv { background-position: 0 83.057851%; }._flag.sy { background-position: 0 83.471074%; }._flag.sz { background-position: 0 83.884298%; }._flag.tc { background-position: 0 84.297521%; }._flag.td { background-position: 0 84.710744%; }._flag.tf { background-position: 0 85.123967%; }._flag.tg { background-position: 0 85.53719%; }._flag.th { background-position: 0 85.950413%; }._flag.tj { background-position: 0 86.363636%; }._flag.tk { background-position: 0 86.77686%; }._flag.tl { background-position: 0 87.190083%; }._flag.tm { background-position: 0 87.603306%; }._flag.tn { background-position: 0 88.016529%; }._flag.to { background-position: 0 88.429752%; }._flag.tp { background-position: 0 88.842975%; }._flag.tr { background-position: 0 89.256198%; }._flag.tt { background-position: 0 89.669421%; }._flag.tv { background-position: 0 90.082645%; }._flag.tw { background-position: 0 90.495868%; }._flag.ty { background-position: 0 90.909091%; }._flag.tz { background-position: 0 91.322314%; }._flag.ua { background-position: 0 91.735537%; }._flag.ug { background-position: 0 92.14876%; }._flag.gb, ._flag.uk { background-position: 0 92.561983%; }._flag.um { background-position: 0 92.975207%; }._flag.us { background-position: 0 93.38843%; }._flag.uy { background-position: 0 93.801653%; }._flag.uz { background-position: 0 94.214876%; }._flag.va { background-position: 0 94.628099%; }._flag.vc { background-position: 0 95.041322%; }._flag.ve { background-position: 0 95.454545%; }._flag.vg { background-position: 0 95.867769%; }._flag.vi { background-position: 0 96.280992%; }._flag.vn { background-position: 0 96.694215%; }._flag.vu { background-position: 0 97.107438%; }._flag.wf { background-position: 0 97.520661%; }._flag.ws { background-position: 0 97.933884%; }._flag.ye { background-position: 0 98.347107%; }._flag.za { background-position: 0 98.760331%; }._flag.zm { background-position: 0 99.173554%; }._flag.zr { background-position: 0 99.586777%; }._flag.zw { background-position: 0 100%; }

	._markdown ul > ._tlli {
		list-style-type: none;
	}

	._markdown ._code {
		padding: 20px;
		font-family: monospace;
		background-color: #FFFFFF55;
		border-radius: 10px;
		white-space: pre-wrap;
	}

	._markdown ._hr {
		width: 100%;
		height: 2px;
		background-color: #000;
		border: none;
	}

	._markdown ._footNoteLink {
		top: -5px;
		font-size: 75%;
		position: relative;
	}

	._markdown ._footNote {
		font-size: 75%;
	}

	._markdown ._codeBlockKeywords {
		padding-right: 5px;
		color: blue;
	}

	._markdown ._table {
		width: fit-content;
		border-collapse: collapse;
		margin-top: 10px;
		margin-bottom: 10px;
	}

	._markdown ._th,
	._markdown ._td {
		border: 1px solid #000;
		padding: 5px;
	}

	._markdown ._ul {
		padding-left: 20px;
	}

	._markdown ._ol {
		padding-left: 20px;
	}

	._markdown ._h1 a._links { font-size: inherit !important; }
	._markdown ._h2 a._links { font-size: inherit !important; }
	._markdown ._h3 a._links { font-size: inherit !important; }
	._markdown ._h4 a._links { font-size: inherit !important; }
	._markdown ._h5 a._links { font-size: inherit !important; }
	._markdown ._h6 a._links { font-size: inherit !important; }

	._markdown ._blockQuotes { display: flex; flex-direction: column;}

	` + processStyleDefinition('', styleProperties, styleDefaults, theme);

	const styleComps = new Array();

	const comps = ComponentDefinitions.values();
	let comp: IteratorResult<Component, boolean>;
	while (!(comp = comps.next()).done) {
		if (!comp.value.styleComponent) continue;
		if (compList.size != 0 && !compList.has(comp.value.name)) continue;

		const StyleComp = comp.value.styleComponent;
		styleComps.push(<StyleComp key={comp.value.displayName + '_stylcomps'} theme={theme} />);
	}

	return (
		<>
			<style id="AppCss">{css}</style>
			{styleComps}
			<MessageStyle theme={theme} />
			<FileBrowserStyles />
			<style id="AppStyle">{style}</style>
		</>
	);
}
