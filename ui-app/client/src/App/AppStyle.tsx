import React, { useEffect, useState } from 'react';
import ComponentDefinitions from '../components';
import { STORE_PATH_APP, STORE_PATH_STYLE_PATH, STORE_PATH_THEME_PATH } from '../constants';
import { addListener } from '../context/StoreContext';
import { Component, StyleResolution } from '../types/common';
import { processStyleDefinition, StyleResolutionDefinition } from '../util/styleProcessor';
import { styleDefaults, styleProperties } from './appStyleProperties';
import MessageStyle from './Messages/MessageStyle';

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

	${window.isDesignMode ? 'html { overflow-y: hidden; }' : ''}

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
	._helperChildren {display: none;}
	._helper:hover ._helperChildren {display: block;}
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
			<style id="AppStyle">{style}</style>
		</>
	);
}
