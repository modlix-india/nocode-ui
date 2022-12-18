const cssProps: {
	[key: string]: {
		originalName: string;
		readableName: string;
		description: string;
		hasOtherValues?: boolean;
		allowedValues?: { value: string; description?: string }[];
		editorType?: string;
	};
} = {
	alignContent: {
		originalName: 'align-content',
		readableName: 'Align Content',
		description: 'This property assists with adjusting a flex holder lines inside it',
		allowedValues: [
			{
				value: 'stretch',
				description: 'This property stretched the items to occupy the leftover space',
			},
			{
				value: 'center',
				description:
					'This property helps to pressed items towards the center point of the flex holder',
			},
			{
				value: 'flex-start',
				description:
					'This property packed the items towards the start of the flex container',
			},
			{
				value: 'flex-end',
				description: 'This property packed the items towards the end of the flex container',
			},
			{
				value: 'space-between',
				description:
					'This property can help to evenly distribute the lines of flex continer',
			},
			{
				value: 'space-around',
				description: 'This property evenly distribute the items within alignment container',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	alignItems: {
		originalName: 'align-items',
		readableName: 'Align Items',
		description: 'This property sets the default alignment for items inside the flex container',
		allowedValues: [
			{
				value: 'stretch',
				description: 'This property stretched the items to occupy the leftover space',
			},
			{
				value: 'center',
				description: 'This property helps to place items at the center of container',
			},
			{
				value: 'flex-start',
				description: 'This property helps to place items at the beginning of container',
			},
			{
				value: 'flex-end',
				description: 'This property helps to place items at the end of container',
			},
			{
				value: 'baseline',
				description: 'This property helps to place items at the baseline of container',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	alignSelf: {
		originalName: 'align-self',
		readableName: 'Align Self',
		description:
			'This property determines the alignment of selected item inside flex container',
		allowedValues: [
			{
				value: 'auto',
				description:
					'default value. This can inherits its parent container property or "stretch" if it has no parent container',
			},
			{
				value: 'stretch',
				description: 'This property stretched the items to occupy the leftover space',
			},
			{
				value: 'center',
				description: 'This property helps to place items at the center of container',
			},
			{
				value: 'flex-start',
				description: 'This property helps to place items at the start of container',
			},
			{
				value: 'flex-end',
				description: 'This property helps to place items at the end of container',
			},
			{
				value: 'baseline',
				description: 'This property helps to place items at the baseline of container',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	all: {
		originalName: 'all',
		readableName: 'All',
		description: 'This property helps to reset all the properties',
		allowedValues: [
			{
				value: 'initial',
				description:
					'This property helps to change all the properties applied to the element to their initial value',
			},
			{
				value: 'inherit',
				description:
					'This property helps to change all the properties applied to the element to their parent value',
			},
			{
				value: 'unset',
				description:
					'This property helps the selected element inherits any inheritable values passed down from the parent element',
			},
		],
	},
	animation: {
		originalName: 'animation',
		readableName: 'Animation',
		description: 'This can change the property value for specific period of time',
	},
	animationDelay: {
		originalName: 'animation-delay',
		readableName: 'Animation Delay',
		description: 'This property determines a delay for the start of an animation',
	},
	animationDirection: {
		originalName: 'animation-direction',
		readableName: 'Animation Direction',
		description:
			'This property is used to define the direction of the animation and specifies whether the animation should play in reverse on alternate cycles or not',
		allowedValues: [
			{
				value: 'normal',
				description:
					'Default value. This animation property helps to play the animation forward',
			},
			{
				value: 'reverse',
				description:
					'This animation property helps to play the each cycle of animation backwards',
			},
			{
				value: 'alternate',
				description:
					'This property helps the animation reverses direction each cycle, with the first iteration being played forwards',
			},
			{
				value: 'alternate-reverse',
				description:
					'This property determines the animation reverses direction each cycle, with the first iteration being played backwards',
			},
			{
				value: 'initial',
				description:
					'This property helps to change all the properties applied to the element to their initial value',
			},
			{
				value: 'inherit',
				description:
					'This property helps to change all the properties applied to the element to their parent value',
			},
		],
	},
	animationDuration: {
		originalName: 'animation-duration',
		readableName: 'Animation Duration',
		description:
			'This property determines the time of animation i.e, how long the animation lasts',
	},
	animationFillMode: {
		originalName: 'animation-fill-mode',
		readableName: 'Animation Fill Mode',
		description:
			'This property is used to specify that values which are applied by the animation before and after it is executing',
		allowedValues: [
			{
				value: 'none',
				description: 'There will be no fill mode present',
			},
			{
				value: 'forwards',
				description: 'This property helps to apply property values in the last keyframe',
			},
			{
				value: 'backwards',
				description: 'This property helps to apply property values in the first keyframe',
			},
			{
				value: 'both',
				description:
					'The instructions for both forward and back will follow by this property',
			},
			{
				value: 'initial',
				description:
					'This property helps to change all the properties applied to the element to their initial value',
			},
			{
				value: 'inherit',
				description:
					'This property helps to change all the properties applied to the element to their parent value',
			},
		],
	},
	animationIterationCount: {
		originalName: 'animation-iteration-count',
		readableName: 'Animation Iteration Count',
		description: 'This property specifies how many times an animation cycle should play',
	},
	animationName: {
		originalName: 'animation-name',
		readableName: 'Animation Name',
		description:
			'This property defines a list of animations that apply. The initial value is none',
	},
	animationPlayState: {
		originalName: 'animation-play-state',
		readableName: 'Animation Play State',
		description:
			'The property defines pauses and resumes animations. JavaScript can affect this and any other CSS properties while animations are running. Setting a paused animation to "running" will resume the animation from the point it was paused',
		allowedValues: [
			{
				value: 'running',
				description: 'This property is used to run or resume the animation',
			},
			{
				value: 'paused',
				description: 'This property is used to pause the animation',
			},
			{
				value: 'initial',
				description:
					'This property helps to change all the properties applied to the element to their initial value',
			},
			{
				value: 'inherit',
				description:
					'This property helps to change all the properties applied to the element to their parent value',
			},
		],
	},
	animationTimingFunction: {
		originalName: 'animation-timing-function',
		readableName: 'Animation Timing Function',
		description:
			'The property determines the speed curve of an animation. The speed curve defines the TIME an animation uses to change from one set of CSS styles to another. The speed curve is used to make the changes smoothly',
		hasOtherValues: true,
		allowedValues: [
			{
				value: 'linear',
				description:
					'This property determines the same speed from start to end for an animation',
			},
			{
				value: 'ease',
				description:
					'Default value. The animation has a slow start, then fast, before it ends slowly',
			},
			{
				value: 'ease-in',
				description: 'The animation has a slow start',
			},
			{
				value: 'ease-out',
				description: 'The animation has a slow end',
			},
			{
				value: 'ease-in-out',
				description: 'The animation has both a slow start and a slow end',
			},
			{
				value: 'step-start',
				description: 'This property equivalent to steps(1, start)',
			},
			{
				value: 'step-end',
				description: 'This property equivalent to steps(1, end)',
			},
			{
				value: 'initial',
				description:
					'This property helps to change all the properties applied to the element to their initial value',
			},
			{
				value: 'inherit',
				description:
					'This property helps to change all the properties applied to the element to their parent value',
			},
		],
	},
	appearance: {
		originalName: 'appearance',
		readableName: 'Appearance',
		description:
			'The property enables web authors to get some control over how some native elements are styled. They can also make the components look like other native elements',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. There will be no special styling is applied',
			},
			{
				value: 'normal',
				description: 'This property helps to render the element as normal',
			},
			{
				value: 'icon',
				description: 'This property helps to render the element as small picture',
			},
			{
				value: 'window',
				description: 'This property helps to render the element as viewport',
			},
			{
				value: 'button',
				description: 'This property helps to render the element as button',
			},
			{
				value: 'menu',
				description:
					'This property helps to render the element as a set of options for the user to choose from',
			},
			{
				value: 'field',
				description: 'This property helps to render the element as an input field',
			},
			{
				value: 'initial',
				description:
					'This property helps to change all the properties applied to the element to their initial value',
			},
			{
				value: 'inherit',
				description:
					'This property helps to change all the properties applied to the element to their parent value',
			},
		],
	},
	aspectRatio: {
		originalName: 'aspect-ratio',
		readableName: 'Aspect Ratio',
		description:
			'this property determines an aspect ratio is a ratio between the width and height of something, noted as width:height. For example, 1:1',
	},
	azimuth: {
		originalName: 'azimuth',
		readableName: 'Azimuth',
		description:
			'This property is an aural property that helps you create surround sound on audio devices',
		hasOtherValues: true,
		allowedValues: [
			{
				value: 'left-side',
				description: 'This property defines the Same as "270deg". With "behind", "270deg"',
			},
			{
				value: 'far-left',
				description: 'This property defines the Same as "300deg". With "behind", "240deg"',
			},
			{
				value: 'left',
				description: 'This property defines the Same as "320deg". With "behind", "220deg"',
			},
			{
				value: 'center-left',
				description: 'This property defines the Same as "240deg". With "behind", "200deg"',
			},
			{
				value: 'center',
				description: 'This property defines the Same as "0deg". With "behind", "180deg"',
			},
			{
				value: 'center-right',
				description: 'This property defines the Same as "20deg". With "behind", "160deg"',
			},
			{
				value: 'right',
				description: 'This property defines the Same as "400deg". With "behind", "140deg"',
			},
			{
				value: 'far-right',
				description: 'This property defines the Same as "60deg". With "behind", "120deg"',
			},
			{
				value: 'rightside',
				description: 'This property defines the Same as "90deg". With "behind", "90deg"',
			},
			{
				value: 'leftwards',
				description:
					'This property used to moves the sound to the left, relative to the current angle - it subtracts 20 degrees',
			},
			{
				value: 'rightwards',
				description:
					'This property used to moves the sound to the right, relative to the current angle - it adds 20 degrees',
			},
			{
				value: 'inherit',
				description:
					'This property helps to change all the properties applied to the element to their parent value',
			},
		],
	},
	backfaceVisibility: {
		originalName: 'backface-visibility',
		readableName: 'Backface Visibility',
		description:
			'This property specifies the visibility of an element from the back face when facing the user. The back face of an element is a mirror image of the front face being displayed. On rotation this property will be used and user can also choose to see the back face',
		allowedValues: [
			{
				value: 'visible',
				description: 'Default value. The backside will be visible',
			},
			{
				value: 'hidden',
				description: 'The backside will not visible',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	background: {
		originalName: 'background',
		readableName: 'Background',
		description: 'This property allows the user to control the background of any element',
	},
	backgroundAttachment: {
		originalName: 'background-attachment',
		readableName: 'Background Attachment',
		description:
			'This property specifies whether the background images are fixed or scrolls with the rest of the page',
		allowedValues: [
			{
				value: 'scroll',
				description:
					'Default value. This property specifies the background image will scroll with rest of the page.',
			},
			{
				value: 'fixed',
				description:
					'This property specifies the background image will not scroll with the page',
			},
			{
				value: 'local',
				description:
					'This property specifies the background image will scroll with content of an element',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	backgroundBlendMode: {
		originalName: 'background-blend-mode',
		readableName: 'Background Blend Mode',
		description:
			'This property specifies the blending property of each background color and background image.',
		allowedValues: [
			{
				value: 'normal',
				description: 'Default value. The blending mode will remains normal',
			},
			{
				value: 'multiply',
				description: 'This property will help to set the blending mode to multiply',
			},
			{
				value: 'screen',
				description: 'This property will help to set the blending mode to screen',
			},
			{
				value: 'overlay',
				description: 'This property will help to set the blending mode to overlay',
			},
			{
				value: 'darken',
				description: 'This property will help to set the blending mode to darken',
			},
			{
				value: 'lighten',
				description: 'This property will help to set the blending mode to lighten',
			},
			{
				value: 'color-dodge',
				description: 'This property will help to set the blending mode to color-dodge',
			},
			{
				value: 'saturation',
				description: 'This property will help to set the blending mode to saturation',
			},
			{
				value: 'color',
				description: 'This property will help to set the blending mode to color',
			},
			{
				value: 'luminosity',
				description: 'This property will help to set the blending mode to luminosity',
			},
		],
	},
	backgroundClip: {
		originalName: 'background-clip',
		readableName: 'Background Clip',
		description:
			'This property specifies the how far the background color or image should extend within an element',
		allowedValues: [
			{
				value: 'border-box',
				description: 'Default value. The background extends behind the border',
			},
			{
				value: 'padding-box',
				description:
					'This property helps to extends the background to the inside edge of the border',
			},
			{
				value: 'content-box',
				description:
					'This property helps to extends the background to the edge of the content box',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	backgroundColor: {
		originalName: 'background-color',
		readableName: 'Background Color',
		description: 'This property helps to set the background color of an element',
		editorType: 'color',
	},
	backgroundImage: {
		originalName: 'background-image',
		readableName: 'Background Image',
		description:
			'Thi property helps to set one or more background images for an element. A background-image is placed at the top-left corner of an element by default',
	},
	backgroundOrigin: {
		originalName: 'background-origin',
		readableName: 'Background Origin',
		description:
			'This property determines the background positioning area of a background image',
		allowedValues: [
			{
				value: 'padding-box',
				description:
					'Default value. This property determines the background image will start from the upper left corner of the padding edge',
			},
			{
				value: 'border-box',
				description:
					'This property specifies the background image will start from the upper left corner of the border',
			},
			{
				value: 'content-box',
				description:
					'This property determines the background image will start from the upper left corner of the content',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	backgroundPosition: {
		originalName: 'background-position',
		readableName: 'Background Position',
		description: 'This property helps to set the starting position of background image',
	},
	backgroundRepeat: {
		originalName: 'background-repeat',
		readableName: 'Background Repeat',
		description: 'This property will help to repeat the background image',
		allowedValues: [
			{
				value: 'repeat',
				description:
					'Default value. The background image will repeat both vertically and horizontally',
			},
			{
				value: 'repeat-x',
				description: 'This property helps to repeat background image horizontally only',
			},
			{
				value: 'repeat-y',
				description: 'This property helps to repeat background image vertically only',
			},
			{
				value: 'no-repeat',
				description: 'The image will only shown once and background image will not repeat',
			},
			{
				value: 'space',
				description:
					'This property will help to repeat the background-image as much as possible without clipping',
			},
			{
				value: 'round',
				description: 'This property will help to stretch to fill the space',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	backgroundSize: {
		originalName: 'background-size',
		readableName: 'Background Size',
		description: 'This property sets the size of background images',
	},
	bleed: {
		originalName: 'bleed',
		readableName: 'Bleed',
		description:
			'This property is used in paged media to specify the extent of the bleed area outside of the page box',
	},
	blockSize: {
		originalName: 'block-size',
		readableName: 'Block Size',
		description:
			'This property is a logical property and represents height or width for an element. The selection of height or width depends upon the writing-mode',
	},
	border: {
		originalName: 'border',
		readableName: 'Border',
		description:
			'This property is used to style the border of an element. It is the shorthand notation of border-width, border-style, border-color Properties.',
	},
	borderBlock: {
		originalName: 'border-block',
		readableName: 'Border Block',
		description:
			'This property is used for setting the individual logical block border property values in a single place in the style sheet',
	},
	borderBlockColor: {
		editorType: 'color',
		originalName: 'border-block-color',
		readableName: 'Border Block Color',
		description:
			'This property is used to set the individual logical block border-color property values in a single place in the style sheet',
	},
	borderBlockEnd: {
		originalName: 'border-block-end',
		readableName: 'Border Block End',
		description:
			'This property is used to set the individual logical block-end border property values in a single place in the style sheet',
	},
	borderBlockEndColor: {
		editorType: 'color',
		originalName: 'border-block-end-color',
		readableName: 'Border Block End Color',
		description:
			'This property defines the color of the logical block-end border of an element',
	},
	borderBlockEndStyle: {
		originalName: 'border-block-end-style',
		readableName: 'Border Block End Style',
		description: 'This property specifies the border style of the block end',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. This property specifies no border',
			},
			{
				value: 'hidden',
				description: 'This property specifies no border',
			},
			{
				value: 'dotted',
				description: 'This property specifies dotted border',
			},
			{
				value: 'dashed',
				description: 'This property specifies dashed border',
			},
			{
				value: 'solid',
				description: 'This property specifies solid border',
			},
			{
				value: 'double',
				description: 'This property specifies double border',
			},
			{
				value: 'groove',
				description:
					'This property specifies a 3D grooved border. The effect depends on the border-color value',
			},
			{
				value: 'ridge',
				description:
					'This property specifies a 3D ridge border. The effect depends on the border-color value',
			},
			{
				value: 'inset',
				description:
					'This property specifies a 3D inset border. The effect depends on the border-color value',
			},
			{
				value: 'outset',
				description:
					'This property specifies a 3D outset border. The effect depends on the border-color value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderBlockEndWidth: {
		originalName: 'border-block-end-width',
		readableName: 'Border Block End Width',
		description: 'This property specifies the border width of the block end',
	},
	borderBlockStart: {
		originalName: 'border-block-start',
		readableName: 'Border Block Start',
		description:
			'This property defines the width, style, and color for the start side border of a block',
	},
	borderBlockStartColor: {
		editorType: 'color',
		originalName: 'border-block-start-color',
		readableName: 'Border Block Start Color',
		description: 'This property specifies the color for the start side border of a block',
	},
	borderBlockStartStyle: {
		originalName: 'border-block-start-style',
		readableName: 'Border Block Start Style',
		description: 'This property determines the style for the start side border of a block',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. This property specifies no border',
			},
			{
				value: 'hidden',
				description: 'This property specifies no border',
			},
			{
				value: 'dotted',
				description: 'This property specifies dotted border',
			},
			{
				value: 'dashed',
				description: 'This property specifies dashed border',
			},
			{
				value: 'solid',
				description: 'This property specifies solid border',
			},
			{
				value: 'double',
				description: 'This property specifies double border',
			},
			{
				value: 'groove',
				description:
					'This property specifies a 3D grooved border. The effect depends on the border-color value',
			},
			{
				value: 'ridge',
				description:
					'This property specifies a 3D ridge border. The effect depends on the border-color value',
			},
			{
				value: 'inset',
				description:
					'This property specifies a 3D inset border. The effect depends on the border-color value',
			},
			{
				value: 'outset',
				description:
					'This property specifies a 3D outset border. The effect depends on the border-color value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderBlockStartWidth: {
		originalName: 'border-block-start-width',
		readableName: 'Border Block Start Width',
		description: 'This property defines the width for the start side border of a block',
	},
	borderBlockStyle: {
		originalName: 'border-block-style',
		readableName: 'Border Block Style',
		description:
			'This property defines the border style for the start and end sides of a block',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. This property specifies no border',
			},
			{
				value: 'hidden',
				description: 'This property specifies no border',
			},
			{
				value: 'dotted',
				description: 'This property specifies dotted border',
			},
			{
				value: 'dashed',
				description: 'This property specifies dashed border',
			},
			{
				value: 'solid',
				description: 'This property specifies solid border',
			},
			{
				value: 'double',
				description: 'This property specifies double border',
			},
			{
				value: 'groove',
				description:
					'This property specifies a 3D grooved border. The effect depends on the border-color value',
			},
			{
				value: 'ridge',
				description:
					'This property specifies a 3D ridge border. The effect depends on the border-color value',
			},
			{
				value: 'inset',
				description:
					'This property specifies a 3D inset border. The effect depends on the border-color value',
			},
			{
				value: 'outset',
				description:
					'This property specifies a 3D outset border. The effect depends on the border-color value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderBlockWidth: {
		originalName: 'border-block-width',
		readableName: 'Border Block Width',
		description: 'This property defines the width of the logical block borders of an element',
	},
	borderBottom: {
		originalName: 'border-bottom',
		readableName: 'Border Bottom',
		description: 'This property helps to set the bottom border of an element',
	},
	borderBottomColor: {
		editorType: 'color',
		originalName: 'border-bottom-color',
		readableName: 'Border Bottom Color',
		description:
			'This property helps to set the color of bottom border. The default value is color of the text',
	},
	borderBottomLeftRadius: {
		originalName: 'border-bottom-left-radius',
		readableName: 'Border Bottom Left Radius',
		description: 'This property specifies the radius of the bottom-left corner',
	},
	borderBottomRightRadius: {
		originalName: 'border-bottom-right-radius',
		readableName: 'Border Bottom Right Radius',
		description: 'This property specifies the radius of the bottom-right corner',
	},
	borderBottomStyle: {
		originalName: 'border-bottom-style',
		readableName: 'Border Bottom Style',
		description: 'This property helps to set the bottom border style of an element',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. This property specifies no border',
			},
			{
				value: 'hidden',
				description: 'This property specifies no border',
			},
			{
				value: 'dotted',
				description: 'This property specifies dotted border',
			},
			{
				value: 'dashed',
				description: 'This property specifies dashed border',
			},
			{
				value: 'solid',
				description: 'This property specifies solid border',
			},
			{
				value: 'double',
				description: 'This property specifies double border',
			},
			{
				value: 'groove',
				description:
					'This property specifies a 3D grooved border. The effect depends on the border-color value',
			},
			{
				value: 'ridge',
				description:
					'This property specifies a 3D ridge border. The effect depends on the border-color value',
			},
			{
				value: 'inset',
				description:
					'This property specifies a 3D inset border. The effect depends on the border-color value',
			},
			{
				value: 'outset',
				description:
					'This property specifies a 3D outset border. The effect depends on the border-color value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderBottomWidth: {
		originalName: 'border-bottom-width',
		readableName: 'Border Bottom Width',
		description: 'This property helps to spefifies the width of an element bottom border',
	},
	borderCollapse: {
		originalName: 'border-collapse',
		readableName: 'Border Collapse',
		description:
			'This property helps to specifies whether the table borders should collapse into a single border or be separated as in standard HTML',
		allowedValues: [
			{
				value: 'seperate',
				description:
					'Default value. This property defines the borders are seperated and each cell is having its own border',
			},
			{
				value: 'collapse',
				description: 'This property defines the borders are collapsed into single border',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderColor: {
		originalName: 'border-color',
		readableName: 'Border Color',
		description:
			'This property helps to specifies the color of the border line. This property can contain one to four values',
		editorType: 'color',
	},
	borderEndEndRadius: {
		originalName: 'border-end-end-radius',
		readableName: 'Border End End Radius',
		description:
			'This is a logical property that defines the length of both horizontal and vertical radii for the end-end corner of a box i.e. coverting sharp corners into round shape corners',
	},
	borderEndStartRadius: {
		originalName: 'border-end-start-radius',
		readableName: 'Border End Start Radius',
		description:
			'This is a logical property that defines the length of both horizontal and vertical radii for the end-start corner of a box i.e. coverting sharp corners into round shape corners',
	},
	borderImage: {
		originalName: 'border-image',
		readableName: 'Border Image',
		description: 'This property specifies the image to be used around the border of an element',
	},
	borderImageOutset: {
		originalName: 'border-image-outset',
		readableName: 'Border Image Outset',
		description:
			'This property sets the amount by which the border image area extends beyond the border box',
	},
	borderImageRepeat: {
		originalName: 'border-image-repeat',
		readableName: 'Border Image Repeat',
		description: 'This helps whether the border image should be repeated, rounded or stretched',
		allowedValues: [
			{
				value: 'stretch',
				description: 'Default value. The image is stretched to fill the rest of the area',
			},
			{
				value: 'repeat',
				description: 'This property helps to repeat the image to fill the area.',
			},
			{
				value: 'round',
				description:
					'This property helps to repeat the image to fill remaining area. If it does not fill the area with a whole number of repetition, the image is rescaled so it can fit',
			},
			{
				value: 'space',
				description:
					'This property helps to repeat the image to fill remaining area. If still the area is not filled then the extra space is distributed around the tiles',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderImageSlice: {
		originalName: 'border-image-slice',
		readableName: 'Border Image Slice',
		description:
			'This property specifies how to slice the image specified by border-image-source and image can be sliced in nine sections: four corners, four edges and the middle',
	},
	borderImageSource: {
		originalName: 'border-image-source',
		readableName: 'Border Image Source',
		description: 'This property specifies the path of image to be used as a border',
	},
	borderImageWidth: {
		originalName: 'border-image-width',
		readableName: 'Border Image Width',
		description: 'This property helps to set width of the border image',
	},
	borderInline: {
		originalName: 'border-inline',
		readableName: 'Border Inline',
		description:
			'This property specifies the border width, style, and color for the start and end sides',
	},
	borderInlineColor: {
		editorType: 'color',
		originalName: 'border-inline-color',
		readableName: 'Border Inline Color',
		description: 'This property specifies the color for the start and end sides of a block',
	},
	borderInlineEnd: {
		originalName: 'border-inline-end',
		readableName: 'Border Inline End',
		description:
			'This is a logical property that defines width, style, and color for the end side border of a block',
	},
	borderInlineEndColor: {
		editorType: 'color',
		originalName: 'border-inline-end-color',
		readableName: 'Border Inline End Color',
		description: 'This property specifies the color for the end side of a block',
	},
	borderInlineEndStyle: {
		originalName: 'border-inline-end-style',
		readableName: 'Border Inline End Style',
		description: 'This property specifies the style for the end side of a block',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. This property specifies no border',
			},
			{
				value: 'hidden',
				description: 'This property specifies no border',
			},
			{
				value: 'dotted',
				description: 'This property specifies dotted border',
			},
			{
				value: 'dashed',
				description: 'This property specifies dashed border',
			},
			{
				value: 'solid',
				description: 'This property specifies solid border',
			},
			{
				value: 'double',
				description: 'This property specifies double border',
			},
			{
				value: 'groove',
				description:
					'This property specifies a 3D grooved border. The effect depends on the border-color value',
			},
			{
				value: 'ridge',
				description:
					'This property specifies a 3D ridge border. The effect depends on the border-color value',
			},
			{
				value: 'inset',
				description:
					'This property specifies a 3D inset border. The effect depends on the border-color value',
			},
			{
				value: 'outset',
				description:
					'This property specifies a 3D outset border. The effect depends on the border-color value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderInlineEndWidth: {
		originalName: 'border-inline-end-width',
		readableName: 'Border Inline End Width',
		description: 'This property specifies the width for the end side of a block',
	},
	borderInlineStart: {
		originalName: 'border-inline-start',
		readableName: 'Border Inline Start',
		description:
			' This property defines width, style, and color for the start side border of a block',
	},
	borderInlineStartColor: {
		editorType: 'color',
		originalName: 'border-inline-start-color',
		readableName: 'Border Inline Start Color',
		description: 'This property specifies the color for the start side of a block',
	},
	borderInlineStartStyle: {
		originalName: 'border-inline-start-style',
		readableName: 'Border Inline Start Style',
		description: 'This property specifies the style for the start side of a block',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. This property specifies no border',
			},
			{
				value: 'hidden',
				description: 'This property specifies no border',
			},
			{
				value: 'dotted',
				description: 'This property specifies dotted border',
			},
			{
				value: 'dashed',
				description: 'This property specifies dashed border',
			},
			{
				value: 'solid',
				description: 'This property specifies solid border',
			},
			{
				value: 'double',
				description: 'This property specifies double border',
			},
			{
				value: 'groove',
				description:
					'This property specifies a 3D grooved border. The effect depends on the border-color value',
			},
			{
				value: 'ridge',
				description:
					'This property specifies a 3D ridge border. The effect depends on the border-color value',
			},
			{
				value: 'inset',
				description:
					'This property specifies a 3D inset border. The effect depends on the border-color value',
			},
			{
				value: 'outset',
				description:
					'This property specifies a 3D outset border. The effect depends on the border-color value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderInlineStartWidth: {
		originalName: 'border-inline-start-width',
		readableName: 'Border Inline Start Width',
		description: 'This property specifies the width for the start side of a block',
	},
	borderInlineStyle: {
		originalName: 'border-inline-style',
		readableName: 'Border Inline Style',
		description: 'This property determines the style for the start and end sides of a block',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. This property specifies no border',
			},
			{
				value: 'hidden',
				description: 'This property specifies no border',
			},
			{
				value: 'dotted',
				description: 'This property specifies dotted border',
			},
			{
				value: 'dashed',
				description: 'This property specifies dashed border',
			},
			{
				value: 'solid',
				description: 'This property specifies solid border',
			},
			{
				value: 'double',
				description: 'This property specifies double border',
			},
			{
				value: 'groove',
				description:
					'This property specifies a 3D grooved border. The effect depends on the border-color value',
			},
			{
				value: 'ridge',
				description:
					'This property specifies a 3D ridge border. The effect depends on the border-color value',
			},
			{
				value: 'inset',
				description:
					'This property specifies a 3D inset border. The effect depends on the border-color value',
			},
			{
				value: 'outset',
				description:
					'This property specifies a 3D outset border. The effect depends on the border-color value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderInlineWidth: {
		originalName: 'border-inline-width',
		readableName: 'Border Inline Width',
		description: 'This property determines the width for the start and end sides of a block',
	},
	borderLeft: {
		originalName: 'border-left',
		readableName: 'Border Left',
		description:
			'This property always sets the values of all of the properties that it can set, even if they are not specified',
	},
	borderLeftColor: {
		originalName: 'border-left-color',
		readableName: 'Border Left Color',
		description: 'This property specifies the color of an element left border',
		editorType: 'color',
	},
	borderLeftStyle: {
		originalName: 'border-left-style',
		readableName: 'Border Left Style',
		description: 'This property helps to set the style for left border of an element',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. This property specifies no border',
			},
			{
				value: 'hidden',
				description: 'This property specifies no border',
			},
			{
				value: 'dotted',
				description: 'This property specifies dotted border',
			},
			{
				value: 'dashed',
				description: 'This property specifies dashed border',
			},
			{
				value: 'solid',
				description: 'This property specifies solid border',
			},
			{
				value: 'double',
				description: 'This property specifies double border',
			},
			{
				value: 'groove',
				description:
					'This property specifies a 3D grooved border. The effect depends on the border-color value',
			},
			{
				value: 'ridge',
				description:
					'This property specifies a 3D ridge border. The effect depends on the border-color value',
			},
			{
				value: 'inset',
				description:
					'This property specifies a 3D inset border. The effect depends on the border-color value',
			},
			{
				value: 'outset',
				description:
					'This property specifies a 3D outset border. The effect depends on the border-color value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderLeftWidth: {
		originalName: 'border-left-width',
		readableName: 'Border Left Width',
		description: 'This property helps to set the width for left border of an element',
	},
	borderRadius: {
		originalName: 'border-radius',
		readableName: 'Border Radius',
		description:
			'This property is used to specifies the radius of an element i.e, sets the rounded borders and provides the rounded corners around an element, tags, or div',
	},
	borderRight: {
		originalName: 'border-right',
		readableName: 'Border Right',
		description:
			'This property always sets the values of all of the properties that it can set, even if they are not specified',
	},
	borderRightColor: {
		originalName: 'border-right-color',
		readableName: 'Border Right Color',
		description: 'This property helps to set color for right border of an element',
		editorType: 'color',
	},
	borderRightStyle: {
		originalName: 'border-right-style',
		readableName: 'Border Right Style',
		description: 'This property helps to set the style for right border of an element',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. This property specifies no border',
			},
			{
				value: 'hidden',
				description: 'This property specifies no border',
			},
			{
				value: 'dotted',
				description: 'This property specifies dotted border',
			},
			{
				value: 'dashed',
				description: 'This property specifies dashed border',
			},
			{
				value: 'solid',
				description: 'This property specifies solid border',
			},
			{
				value: 'double',
				description: 'This property specifies double border',
			},
			{
				value: 'groove',
				description:
					'This property specifies a 3D grooved border. The effect depends on the border-color value',
			},
			{
				value: 'ridge',
				description:
					'This property specifies a 3D ridge border. The effect depends on the border-color value',
			},
			{
				value: 'inset',
				description:
					'This property specifies a 3D inset border. The effect depends on the border-color value',
			},
			{
				value: 'outset',
				description:
					'This property specifies a 3D outset border. The effect depends on the border-color value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderRightWidth: {
		originalName: 'border-right-width',
		readableName: 'Border Right Width',
		description: 'This property helps to set the width for right border of an element',
	},
	borderSpacing: {
		originalName: 'border-spacing',
		readableName: 'Border Spacing',
		description: 'This property specifies the distance between the borders of adjacent cells.',
	},
	borderStartEndRadius: {
		originalName: 'border-start-end-radius',
		readableName: 'Border Start End Radius',
		description:
			'This is a logical property that defines the length of both horizontal and vertical radii for the start-end corner of a box',
	},
	borderStartStartRadius: {
		originalName: 'border-start-start-radius',
		readableName: 'Border Start Start Radius',
		description:
			'This is a logical property that defines the length of both horizontal and vertical radii for the start-start corner of a box',
	},
	borderStyle: {
		originalName: 'border-style',
		readableName: 'Border Style',
		description: 'This property helps to set the style for border of an element',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. This property specifies no border',
			},
			{
				value: 'hidden',
				description: 'This property specifies no border',
			},
			{
				value: 'dotted',
				description: 'This property specifies dotted border',
			},
			{
				value: 'dashed',
				description: 'This property specifies dashed border',
			},
			{
				value: 'solid',
				description: 'This property specifies solid border',
			},
			{
				value: 'double',
				description: 'This property specifies double border',
			},
			{
				value: 'groove',
				description:
					'This property specifies a 3D grooved border. The effect depends on the border-color value',
			},
			{
				value: 'ridge',
				description:
					'This property specifies a 3D ridge border. The effect depends on the border-color value',
			},
			{
				value: 'inset',
				description:
					'This property specifies a 3D inset border. The effect depends on the border-color value',
			},
			{
				value: 'outset',
				description:
					'This property specifies a 3D outset border. The effect depends on the border-color value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderTop: {
		originalName: 'border-top',
		readableName: 'Border Top',
		description:
			'This property always sets the values of all of the properties that it can set, even if they are not specified',
	},
	borderTopColor: {
		originalName: 'border-top-color',
		readableName: 'Border Top Color',
		description: 'This property helps to set the color for top border of an element',
		editorType: 'color',
	},
	borderTopLeftRadius: {
		originalName: 'border-top-left-radius',
		readableName: 'Border Top Left Radius',
		description: 'This property helps to set the radius for top left border of an element',
	},
	borderTopRightRadius: {
		originalName: 'border-top-right-radius',
		readableName: 'Border Top Right Radius',
		description: 'This property helps to set the radius for top right border of an element',
	},
	borderTopStyle: {
		originalName: 'border-top-style',
		readableName: 'Border Top Style',
		description: 'This property helps to set the top style for border of an element',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. This property specifies no border',
			},
			{
				value: 'hidden',
				description: 'This property specifies no border',
			},
			{
				value: 'dotted',
				description: 'This property specifies dotted border',
			},
			{
				value: 'dashed',
				description: 'This property specifies dashed border',
			},
			{
				value: 'solid',
				description: 'This property specifies solid border',
			},
			{
				value: 'double',
				description: 'This property specifies double border',
			},
			{
				value: 'groove',
				description:
					'This property specifies a 3D grooved border. The effect depends on the border-color value',
			},
			{
				value: 'ridge',
				description:
					'This property specifies a 3D ridge border. The effect depends on the border-color value',
			},
			{
				value: 'inset',
				description:
					'This property specifies a 3D inset border. The effect depends on the border-color value',
			},
			{
				value: 'outset',
				description:
					'This property specifies a 3D outset border. The effect depends on the border-color value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	borderTopWidth: {
		originalName: 'border-top-width',
		readableName: 'Border Top Width',
		description: 'This property helps to set the top width for border of an element',
	},
	borderWidth: {
		originalName: 'border-width',
		readableName: 'Border Width',
		description: 'This property helps to set the width for border of an element',
	},
	bottom: {
		originalName: 'bottom',
		readableName: 'Bottom',
		description:
			' This property has no effect on non-positioned elements but it affects the vertical position of a positioned element',
	},
	boxDecorationBreak: {
		originalName: 'box-decoration-break',
		readableName: 'Box Decoration Break',
		description:
			'This property defines how the border, border-image, box-shadow, margin, clip-path, background and padding of an element is applied when the container for the element is divided.',
		allowedValues: [
			{
				value: 'slice',
				description:
					'Default value. This property applied Box designs to the component in general and break at the edges of the component pieces',
			},
			{
				value: 'clone',
				description:
					'Box decoration apply to each section of the component as though the parts were individual components. Borders wrap the four edges of each section of the component, and foundations are redrawn in full for each part',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	boxShadow: {
		originalName: 'box-shadow',
		readableName: 'Box Shadow',
		description:
			'This property helps to attach the shadows to an element which can be one or more.',
	},
	boxSizing: {
		originalName: 'box-sizing',
		readableName: 'Box Sizing',
		description:
			'This proeprty helps to specify how the width and height of a component are calculated: padding or border will included or not',
		allowedValues: [
			{
				value: 'content-box',
				description:
					'Default value. The Border and padding are not included in this. The width and height properties includes only the content',
			},
			{
				value: 'border-box',
				description:
					'This property includes content, padding and border from width and height properties',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	breakAfter: {
		originalName: 'break-after',
		readableName: 'Break After',
		description:
			'This property helps to tell the browser when to break the page, column, or region after the element the break-after property is applied to, or avoid the element to be split and span across two pages',
		allowedValues: [
			{
				value: 'auto',
				description:
					'Default value. This property automatically breaks the page/column/region after the element',
			},
			{
				value: 'all',
				description:
					'This property helps to insert a page-break right after the principal box',
			},
			{
				value: 'always',
				description: 'This property helps always to insert a page-break after the element',
			},
			{
				value: 'avoid',
				description:
					'This property always avoids a page/column/region break after the element',
			},
			{
				value: 'avoid-column',
				description: 'This property always avoids a column-break after the element',
			},
			{
				value: 'avoid-page',
				description: 'This property avoids a page-break after the element',
			},
			{
				value: 'avoid-region',
				description: 'This property avoids a region-break after the element',
			},
			{
				value: 'column',
				description:
					'This proeprty helps always to insert a column-break after the element',
			},
			{
				value: 'left',
				description:
					'This property helps to format the next page as a left page by inserting one or two page-breaks after the element',
			},
			{
				value: 'page',
				description: 'This property helps always to insert a page-break after the element',
			},
			{
				value: 'recto',
				description:
					'This property helps to format the next page as a recto page by inserting one or two page-breaks after the principal box',
			},
			{
				value: 'region',
				description:
					'This property helps always to insert a region-break after the element',
			},
			{
				value: 'right',
				description:
					'This property helps to format the next page as a right page by inserting one or two page-breaks after the element',
			},
			{
				value: 'verso',
				description:
					'This property helps to format the next page as a verso page by inserting one or two page-breaks after the principal box',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	breakBefore: {
		originalName: 'break-before',
		readableName: 'Break Before',
		description:
			'This property helps to tell the browser whether or not to break the page, column, or region before the element the break-before property is applied to, or avoid the element to be split and span across two pages',
		allowedValues: [
			{
				value: 'auto',
				description:
					'Default value. This property automatically breaks the page/column/region before the element',
			},
			{
				value: 'all',
				description:
					'This property helps to insert a page-break right before the principal box',
			},
			{
				value: 'always',
				description: 'This property helps always to insert a page-break before the element',
			},
			{
				value: 'avoid',
				description:
					'This property always avoids a page/column/region break before the element',
			},
			{
				value: 'avoid-column',
				description: 'This property always avoids a column-break before the element',
			},
			{
				value: 'avoid-page',
				description: 'This property avoids a page-break before the element',
			},
			{
				value: 'avoid-region',
				description: 'This property avoids a region-break before the element',
			},
			{
				value: 'column',
				description:
					'This proeprty helps always to insert a column-break before the element',
			},
			{
				value: 'left',
				description:
					'This property helps to format the next page as a left page by inserting one or two page-breaks before the element',
			},
			{
				value: 'page',
				description: 'This property helps always to insert a page-break before the element',
			},
			{
				value: 'recto',
				description:
					'This property helps to format the next page as a recto page by inserting one or two page-breaks before the principal box',
			},
			{
				value: 'region',
				description:
					'This property helps always to insert a region-break before the element',
			},
			{
				value: 'right',
				description:
					'This property helps to format the next page as a right page by inserting one or two page-breaks before the element',
			},
			{
				value: 'verso',
				description:
					'This property helps to format the next page as a verso page by inserting one or two page-breaks before the principal box',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	breakInside: {
		originalName: 'break-inside',
		readableName: 'Break Inside',
		description:
			'This property helps to tell the browser to avoid breaks inside images, code snippets, tables, and listst.',
		allowedValues: [
			{
				value: 'auto',
				description:
					'Default value. This property automatically breaks the page/column/region inside the element',
			},
			{
				value: 'avoid',
				description:
					'This property always avoids a page/column/region break inside the element',
			},
			{
				value: 'avoid-column',
				description: 'This property always avoids a column-break inside the element',
			},
			{
				value: 'avoid-page',
				description: 'This property avoids a page-break inside the element',
			},
			{
				value: 'avoid-region',
				description: 'This property avoids a region-break inside the element',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	captionSide: {
		originalName: 'caption-side',
		readableName: 'Caption Side',
		description: 'This property specifies the placement of a table caption',
		allowedValues: [
			{
				value: 'top',
				description:
					'Default value. This property helps to put the caption above the table',
			},
			{
				value: 'bottom',
				description: 'This property helps to put the caption below the table',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	caretColor: {
		editorType: 'color',
		originalName: 'caret-color',
		readableName: 'Caret Color',
		description:
			'This property helps to specifies the color of the cursor (caret) in inputs, textareas, or any element that is editable.',
	},
	className: {
		editorType: 'classNameEditor',
		originalName: 'class-name',
		readableName: 'Class Name',
		description: 'This property helps to specifies the class name of an element',
	},
	clear: {
		originalName: 'clear',
		readableName: 'Clear',
		description:
			'This property specifies what should happen with the element that is next to a floating element.',
		allowedValues: [
			{
				value: 'none',
				description:
					'Default value. The element is not pushed below left or right floated elements',
			},
			{
				value: 'left',
				description: 'The element is pushed below left floated elements',
			},
			{
				value: 'right',
				description: 'The element is pushed below right floated elements',
			},
			{
				value: 'both',
				description:
					'The both left and right floated elements are pushed below by the element',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	clip: {
		originalName: 'clip',
		readableName: 'Clip',
		description:
			'This property helps to clip an absolutely positioned element from a rectangle which is specified as four coordinates, all from the top-left corner of the element to be clipped',
	},
	clipPath: {
		originalName: 'clip-path',
		readableName: 'Clip Path',
		description:
			'This property helps you to clip an element to a basic shape or to an SVG source.',
	},
	color: {
		originalName: 'color',
		readableName: 'Color',
		description: 'This property helps to specifies the color of text',
		editorType: 'color',
	},
	colorAdjust: {
		originalName: 'color-adjust',
		readableName: 'Color Adjust',
		description:
			'This property helps the browsers to change the colors and the appearance of an element',
		allowedValues: [
			{
				value: 'economy',
				description:
					'This property helps to make the text more readable, so the browser may leave the images in order to adjust the colors of text',
			},
			{
				value: 'exact',
				description: 'Only on the user request the appearance of the page will change',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	colorInterpolationFilters: {
		originalName: 'color-interpolation-filters',
		readableName: 'Color Interpolation Filters',
		description:
			'This property is used in SVG to specify the color space for imaging operations performed via filter effects',
		allowedValues: [
			{
				value: 'auto',
				description:
					'This property is used for filter effects color operations and if you do not require that color operations occur in a particular color space then you can use this property',
			},
			{
				value: 'sRGB',
				description:
					'This property specifies that filter effects color operations should occur in the sRGB color space',
			},
			{
				value: 'linearRGB',
				description:
					'This property specifies that filter effects color operations should occur in the linear RGB color space',
			},
		],
	},
	columnCount: {
		originalName: 'column-count',
		readableName: 'Column Count',
		description:
			'This property uses to divide a portion of content into a given number of columns',
	},
	columnFill: {
		originalName: 'column-fill',
		readableName: 'Column Fill',
		description: 'This property defines how to fill columns and balance them.',
		allowedValues: [
			{
				value: 'balance',
				description:
					'Default value. The property fills every section with about a similar measure of content but but will not allow the columns to be taller than the height',
			},
			{
				value: 'auto',
				description:
					'The proeprty fills each column until it reaches the height, and do this until it runs out of content',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	columnGap: {
		originalName: 'column-gap',
		readableName: 'Column Gap',
		description: 'This property determines the gap between the columns',
	},
	columnRule: {
		originalName: 'column-rule',
		readableName: 'Column Rule',
		description:
			'This property helps to set the width, style, and color of the line drawn between columns in a multi-column layout',
	},
	columnRuleColor: {
		editorType: 'color',
		originalName: 'column-rule-color',
		readableName: 'Column Rule Color',
		description:
			'The property helps to set the color of rule between columns. Default value depends on the color of element',
	},
	columnRuleStyle: {
		originalName: 'column-rule-style',
		readableName: 'Column Rule Style',
		description:
			'The property helps to set the style of rule between columns. Default value is none',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. This property specifies no rule',
			},
			{
				value: 'hidden',
				description: 'This property specifies no rule',
			},
			{
				value: 'dotted',
				description: 'This property specifies dotted rule',
			},
			{
				value: 'dashed',
				description: 'This property specifies dashed rule',
			},
			{
				value: 'solid',
				description: 'This property specifies solid rule',
			},
			{
				value: 'double',
				description: 'This property specifies double rule',
			},
			{
				value: 'groove',
				description:
					'This property specifies a 3D grooved rule. The effect depends on the width and color values',
			},
			{
				value: 'ridge',
				description:
					'This property specifies a 3D ridge rule. The effect depends on the width and color values',
			},
			{
				value: 'inset',
				description:
					'This property specifies a 3D inset rule. The effect depends on the width and color values',
			},
			{
				value: 'outset',
				description:
					'This property specifies a 3D outset rule. The effect depends on the width and color values',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	columnRuleWidth: {
		originalName: 'column-rule-width',
		readableName: 'Column Rule Width',
		description:
			'The property helps to set the width of rule between columns. Default value is medium',
	},
	columnSpan: {
		originalName: 'column-span',
		readableName: 'Column Span',
		description:
			'This property indicates the number of sections a component should length/span across.',
		allowedValues: [
			{
				value: 'none',
				description:
					'Default value. The property sets an element that should span across one column',
			},
			{
				value: 'all',
				description: 'The property sets an element that should span across all columns',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	columnWidth: {
		originalName: 'column-width',
		readableName: 'Column Width',
		description:
			'The property which specifies the width of column. This is a flexible property',
	},
	columns: {
		originalName: 'columns',
		readableName: 'Columns',
		description:
			'This property sets the number of columns to use when drawing an element contents, as well as those column widths',
	},
	condition: {
		editorType: 'conditionEditor',
		originalName: 'condition',
		readableName: 'Condition',
		description:
			'This property is a feature of css, based on a specific condition the css style will be applied which has a condition of either true or false',
	},
	content: {
		originalName: 'content',
		readableName: 'Content',
		description:
			'This property used to generate the content dynamically (during run time). It is used to generate content ::before & ::after pseudo element',
	},
	contentVisibility: {
		originalName: 'content-visibility',
		readableName: 'Content Visibility',
		description:
			'This property is used to set the content visibility of an element and controls whether or not an element renders its contents at all',
		allowedValues: [
			{
				value: 'visible',
				description: 'This property has no effects and the element rendered as normal',
			},
			{
				value: 'hidden',
				description:
					'This property helps the element to skip its content. The skipped contents must not be accessible to user-agent features, such as find-in-page, tab-order navigation, etc., nor be selectable or focusable',
			},
			{
				value: 'auto',
				description: 'If the element is not relevant to the user, it will skip its content',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	counterIncrement: {
		originalName: 'counter-increment',
		readableName: 'Counter Increment',
		description:
			'This property helps to increases or decreases the value of a CSS counter by a given value',
	},
	counterReset: {
		originalName: 'counter-reset',
		readableName: 'Counter Reset',
		description:
			'This property helps to reset a CSS counter to a given value. The new counter of the given name will be created',
	},
	counterSet: {
		originalName: 'counter-set',
		readableName: 'Counter Set',
		description:
			'This property helps to set css counter to a given value. It can change the value of existing counters, and will only create new counters if there is not already a counter of the given name on the element',
	},
	cursor: {
		originalName: 'cursor',
		readableName: 'Cursor',
		description:
			'This property specifies whenever pointing over an element the mouse cursor will be displayed',
		hasOtherValues: true,
		allowedValues: [
			{
				value: 'alias',
				description: 'This property specifies that an alias of something is to be created',
			},
			{
				value: 'all-scroll',
				description:
					'This property specifies that something can be scrolled in any direction',
			},
			{
				value: 'auto',
				description:
					'Default value. This property specifies cursor will be set by the browser',
			},
			{
				value: 'cell',
				description:
					'This property specifies that a cell (or set of cells) may be selected',
			},
			{
				value: 'context-menu',
				description: 'This property specifies that a context-menu is available',
			},
			{
				value: 'col-resize',
				description: 'This property specifies that the column can be resized horizontally',
			},
			{
				value: 'copy',
				description: 'This property specifies something is to be copied',
			},
			{
				value: 'crosshair',
				description: 'This property specifies the cursor render as a crosshair',
			},
			{
				value: 'default',
				description: 'This property specifies the default cursor',
			},
			{
				value: 'e-resize',
				description:
					'This property specifies that an edge of a box is to be moved right (east)',
			},
			{
				value: 'ew-resize',
				description: 'This property specifies the bidirectional resize cursor',
			},
			{
				value: 'grab',
				description: 'This property specifies that something can be grabbed',
			},
			{
				value: 'grabbing',
				description: 'This property specifies something can be grabbed',
			},
			{
				value: 'help',
				description: 'This property specifies that the help is available',
			},
			{
				value: 'move',
				description: 'This property specifies something is to be moved',
			},
			{
				value: 'n-resize',
				description:
					'This property specifies that an edge of a box is to be moved up (north)',
			},
			{
				value: 'ne-resize',
				description:
					'This property specifies that an edge of a box is to be moved up and right (north/east)',
			},
			{
				value: 'nesw-resize',
				description: 'This property specifies a bidirectional resize cursor',
			},
			{
				value: 'ns-resize',
				description: 'This property specifies a bidirectional resize cursor',
			},
			{
				value: 'nw-resize',
				description:
					'This property specifies that an edge of a box is to be moved up and left (north/west)',
			},
			{
				value: 'nwse-resize',
				description: 'This property specifies a bidirectional resize cursor',
			},
			{
				value: 'no-drop',
				description: 'This property specifies that the dragged item cannot be dropped here',
			},
			{
				value: 'none',
				description: 'This property specifies no cursor will be render for the element',
			},
			{
				value: 'not-allowed',
				description:
					'This property specifies that the requested action will not be executed',
			},
			{
				value: 'pointer',
				description:
					'This property specifies that the cursor is a pointer and indicates a link',
			},
			{
				value: 'progress',
				description: 'This property specifies that the program is busy (in progress)',
			},
			{
				value: 'row-resize',
				description: 'This property specifies that the row can be resized vertically',
			},
			{
				value: 's-resize',
				description:
					'This property specifies that an edge of a box is to be moved down (south)',
			},
			{
				value: 'se-resize',
				description:
					'This property specifies that an edge of a box is to be moved down and right (south/east)',
			},
			{
				value: 'sw-resize',
				description:
					'This property specifies that an edge of a box is to be moved down and left (south/west)',
			},
			{
				value: 'text',
				description: 'This property specifies text that may be selected',
			},
			{
				value: 'URL',
				description:
					'This property specifies a comma separated list of URLs to custom cursors',
			},
			{
				value: 'vertical-text',
				description: 'This property specifies vertical-text that may be selected',
			},
			{
				value: 'w-resize',
				description:
					'This property specifies that an edge of a box is to be moved left (west)',
			},
			{
				value: 'wait',
				description: 'This property specifies that the program is busy',
			},
			{
				value: 'zoom-in',
				description: 'This property specifies that something can be zoomed in',
			},
			{
				value: 'zoom-out',
				description: 'This property specifies that something can be zoomed out',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	direction: {
		originalName: 'direction',
		readableName: 'Direction',
		description:
			'This property helps to set direction of text,horizontal overflow and table columns',
		allowedValues: [
			{
				value: 'ltr',
				description:
					'Default value. This property helps text direction to go from left-to-right',
			},
			{
				value: 'rtl',
				description: 'This property helps text direction to go from right-to-left',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	display: {
		originalName: 'display',
		readableName: 'Display',
		description: 'This property helps to specifies the display behavior of an element',
		allowedValues: [
			{
				value: 'inline',
				description:
					'This property displays an element as an inline element (like <span>). Any height and width properties will have no effect',
			},
			{
				value: 'block',
				description:
					'This property helps to displays an element as a block element (like <p>). It starts on a new line, and takes up the whole width',
			},
			{
				value: 'contents',
				description:
					'This property helps to make the container disappear, making the child elements children of the element the next level up in the DOM',
			},
			{
				value: 'flex',
				description:
					'This property helps to displays an element as a block-level flex container',
			},
			{
				value: 'grid',
				description:
					'This property helps to displays an element as a block-level grid container',
			},
			{
				value: 'inline-block',
				description:
					'This property helps to display an element as an inline-level block container. The element itself is formatted as an inline element, but you can apply height and width values',
			},
			{
				value: 'inline-flex',
				description:
					'This property helps to display an element as an inline-level flex container',
			},
			{
				value: 'inline-grid',
				description:
					'This property helps to display an element as an inline-level grid container',
			},
			{
				value: 'inline-table',
				description:
					'This property helps to display an element as an inline-level table container',
			},
			{
				value: 'list-item',
				description: 'This property helps the element to behave like a <li> element',
			},
			{
				value: 'run-in',
				description:
					'This property helps to display an element as either block or inline, depending on context',
			},
			{
				value: 'table',
				description: 'This property helps the element to behave like a <table> element',
			},
			{
				value: 'table-caption',
				description: 'This property helps the element to behave like a <caption> element',
			},
			{
				value: 'table-column-group',
				description: 'This property helps the element to behave like a <colgroup> element',
			},
			{
				value: 'table-header-group',
				description: 'This property helps the element to behave like a <thead> element',
			},
			{
				value: 'table-footer-group',
				description: 'This property helps the element to behave like a <tfoot> element',
			},
			{
				value: 'table-row-group',
				description: 'This property helps the element to behave like a <tbody> element',
			},
			{
				value: 'table-cell',
				description: 'This property helps the element to behave like a <td> element',
			},
			{
				value: 'table-column',
				description: 'This property helps the element to behave like a <col> element',
			},
			{
				value: 'table-row',
				description: 'This property helps the element to behave like a <tr> element',
			},
			{
				value: 'none',
				description: 'The property will completely removed the element',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	elevation: {
		originalName: 'elevation',
		readableName: 'Elevation',
		description:
			'This property helps you to specifiy the direction angle of the light source from the XY plane towards the Z-axis',
	},
	emptyCells: {
		originalName: 'empty-cells',
		readableName: 'Empty Cells',
		description:
			'This property specifies weather or not to display borders on empty cells in a table',
		allowedValues: [
			{
				value: 'show',
				description: 'Default value. This property helps to display borders on empty cells',
			},
			{
				value: 'hide',
				description: 'This property helps to hide borders on empty cells',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	filter: {
		originalName: 'filter',
		readableName: 'Filter',
		description:
			'This property provides access to effects like blur or color shifting on an element rendering before the element is displayed',
	},
	flex: {
		originalName: 'flex',
		readableName: 'Flex',
		description:
			'This property helps to sets the flexible length on flexible items. If there are no flexible items, the flex property will not have any effect',
	},
	flexBasis: {
		originalName: 'flex-basis',
		readableName: 'Flex Basis',
		description: 'This property helps to set the initial main size of a flex item',
	},
	flexDirection: {
		originalName: 'flex-direction',
		readableName: 'Flex Direction',
		description: 'This property helps to specifies the direction of the flexible items',
		allowedValues: [
			{
				value: 'row',
				description:
					'Default value. The property helps the items to displayed horizontally as a row',
			},
			{
				value: 'row-reverse',
				description: 'The property helps the items to displayed in a row in reverse order',
			},
			{
				value: 'column',
				description:
					'The property helps the items to displayed vertically from top to bottom',
			},
			{
				value: 'column-reverse',
				description:
					'The property helps the items to displayed vertically from bottom to top',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	flexFlow: {
		originalName: 'flex-flow',
		readableName: 'Flex Flow',
		description:
			'This property determines the direction of a particular flex container and its wrapping behavior as well',
	},
	flexGrow: {
		originalName: 'flex-grow',
		readableName: 'Flex Grow',
		description:
			'This property is a sub-property of the Flexible Box Layout module and it specifies how much the item will grow relative to the rest of the flexible items inside the same container.',
	},
	flexShrink: {
		originalName: 'flex-shrink',
		readableName: 'Flex Shrink',
		description:
			'This property specifies how much the item can shrink relative to the rest of the flexible items',
	},
	flexWrap: {
		originalName: 'flex-wrap',
		readableName: 'Flex Wrap',
		description:
			'This property is used to specify whether flex items should should wrap or not',
		allowedValues: [
			{
				value: 'nowrap',
				description:
					'Default value.This property specifies that the flexible items will not wrap',
			},
			{
				value: 'wrap',
				description: 'This property specifies that the flexible items will wrap if needed',
			},
			{
				value: 'wrap-reverse',
				description:
					'This property specifies that the flexible items will wrap if needed but in reverse order',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	float: {
		originalName: 'float',
		readableName: 'Float',
		description:
			'This property will help to place an element on the left or right side of its container',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. The element will not float',
			},
			{
				value: 'left',
				description: 'The element floats to the left of the container',
			},
			{
				value: 'right',
				description: 'The element floats to the right of the container',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	floodColor: {
		editorType: 'color',
		originalName: 'flood-color',
		readableName: 'Flood Color',
		description:
			'This property indicates what color to use to flood the current filter primitive subregion and it can be applied to any element',
	},
	floodOpacity: {
		originalName: 'flood-opacity',
		readableName: 'Flood Opacity',
		description:
			'This property is a presentation attribute for SVG elements and used in SVG to define the opacity value to use across the entire filter primitive subregion',
	},
	font: {
		originalName: 'font',
		readableName: 'Font',
		description: 'This is a shorthand property for font-style, font-family and font-weight',
	},
	fontFamily: {
		originalName: 'font-family',
		readableName: 'Font Family',
		description: 'This property specifies the font for an element.',
	},
	fontFeatureSettings: {
		originalName: 'font-feature-settings',
		readableName: 'Font Feature Settings',
		description:
			'This property helps to sets special font characters such as ligatures, figures and positioning in fonts that include OpenType layout features.',
	},
	fontKerning: {
		originalName: 'font-kerning',
		readableName: 'Font Kerning',
		description:
			'This property controls the usage of the kerning information i.e how letters are spaced, stored in a font',
		allowedValues: [
			{
				value: 'auto',
				description:
					'Default value. The browser will decide font Kerning should be applied or not',
			},
			{
				value: 'normal',
				description: 'This determines the font kerning will apply',
			},
			{
				value: 'none',
				description: 'This determines the font kerning will not apply',
			},
		],
	},
	fontLanguageOverride: {
		originalName: 'font-language-override',
		readableName: 'Font Language Override',
		description:
			'This property is used to controls the use of the language-specific glyphs and this can also overrides the typeface behavior for a specific language',
	},
	fontOpticalSizing: {
		originalName: 'font-optical-sizing',
		readableName: 'Font Optical Sizing',
		description:
			'The property defines the auto setting allows browsers to modify the characters of font to suite the font size and pixel density',
		allowedValues: [
			{
				value: 'auto',
				description:
					'Default value. This property helps to allow the browsers to optimize text at different font sizes for legibility',
			},
			{
				value: 'none',
				description: 'This property can prevents the browsers from modifying text',
			},
		],
	},
	fontSize: {
		originalName: 'font-size',
		readableName: 'Font Size',
		description: 'This property specifies the size of the font',
	},
	fontSizeAdjust: {
		originalName: 'font-size-adjust',
		readableName: 'Font Size Adjust',
		description:
			' This property helps to gives the better control over the font size and used to adjusts the font size based on the height of lowercase rather than capital letters',
	},
	fontStretch: {
		originalName: 'font-stretch',
		readableName: 'Font Stretch',
		description:
			'This property helps to make the text wider or narrower compare to the default width of the font',
		allowedValues: [
			{
				value: 'ultra-condensed',
				description: 'This property sets the text as narrow as it gets',
			},
			{
				value: 'extra-condensed',
				description:
					'The text will be narrower than condensed, but not as narrow as ultra-condensed',
			},
			{
				value: 'condensed',
				description:
					'The text will be narrower than semi-condensed, but not as narrow as extra-condensed',
			},
			{
				value: 'semi-condensed',
				description:
					'The property helps to makes the text narrower than normal, but not as narrow as condensed',
			},
			{
				value: 'normal',
				description: 'Default value. There will be no stretching of font',
			},
			{
				value: 'semi-expanded',
				description:
					'The property helps to set the text wider than normal, but not as wide as expanded',
			},
			{
				value: 'expanded',
				description:
					'The property helps to set the text wider than semi-expanded, but not as wide as extra-expanded',
			},
			{
				value: 'extra-expanded',
				description:
					'The property helps to set the text wider than expanded, but not as wide as ultra-expanded',
			},
			{
				value: 'ultra-expanded',
				description: 'This property sets the text as wide as it gets',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	fontStyle: {
		originalName: 'font-style',
		readableName: 'Font Style',
		description: 'This property helps to apply different styles to the font',
		allowedValues: [
			{
				value: 'normal',
				description:
					'Default value. The font style will be displayed normal on the browser',
			},
			{
				value: 'italic',
				description: 'The font style will be displayed as italic on the browser',
			},
			{
				value: 'oblique',
				description: 'The font style will be displayed as oblique on the browser',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	fontSynthesis: {
		originalName: 'font-synthesis',
		readableName: 'Font Synthesis',
		description:
			'This property controls whether user agents are allowed to synthesize bold or oblique font faces when a font family lacks bold or italic faces',
	},
	fontVariant: {
		originalName: 'font-variant',
		readableName: 'Font Variant',
		description: 'This property helps to convert all lowercase letters into uppercase letters',
		allowedValues: [
			{
				value: 'normal',
				description: 'Default value. The font will be displayed normal on the browser',
			},
			{
				value: 'small-caps',
				description: 'The small-caps font will be displayed on the browser',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	fontVariantAlternates: {
		originalName: 'font-variant-alternates',
		readableName: 'Font Variant Alternates',
		description:
			'This property deals specifically with selecting alternate glyphs and allows you to control the selection of alternate glyphs for a given character within a font',
	},
	fontVariantCaps: {
		originalName: 'font-variant-caps',
		readableName: 'Font Variant Caps',
		description:
			'This property specifically deals with small caps, petite caps, unicase, and titling caps and allows the selection of alternate glyphs used for small or petite capitals or for titling',
		allowedValues: [
			{
				value: 'normal',
				description: 'Default value. The font will be displayed normal on the browser',
			},
			{
				value: 'small-caps',
				description: 'This property displays the small-caps font on the browser',
			},
			{
				value: 'all-small-caps',
				description:
					'This property enables display of small capitals for both upper and lowercase letters',
			},
			{
				value: 'petite-caps',
				description: 'This property enables display of petite capitals',
			},
			{
				value: 'all-petite-caps',
				description:
					'This property enables display of petite capitals for both upper and lowercase letters',
			},
			{
				value: 'unicase',
				description:
					'This property enables display of mixture of small capitals for uppercase letters with normal lowercase letters',
			},
			{
				value: 'titling-caps',
				description: 'This property enables display of titling capitals',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	fontVariantEastAsian: {
		originalName: 'font-variant-east-asian',
		readableName: 'Font Variant East Asian',
		description:
			'This property allows you to control glyph substitution and sizing in East Asian text',
	},
	fontVariantEmoji: {
		originalName: 'font-variant-emoji',
		readableName: 'Font Variant Emoji',
		description: '',
	},
	fontVariantLigatures: {
		originalName: 'font-variant-ligatures',
		readableName: 'Font Variant Ligatures',
		description:
			'This property determines the ligatures and contextual forms which are ways of combining glyphs to produce more harmonized forms',
		allowedValues: [
			{
				value: 'normal',
				description:
					'Default value. The property helps the keyword to leads the activation of the usual ligatures and contextual forms needed for correct rendering',
			},
			{
				value: 'none',
				description:
					'This keyword specifies that all ligatures and contextual forms are disabled, even common ones',
			},
		],
	},
	fontVariantNumeric: {
		originalName: 'font-variant-numeric',
		readableName: 'Font Variant Numeric',
		description:
			'This property deals specifically with numeric forms and allows you to specify control over numerical forms',
	},
	fontVariantPosition: {
		originalName: 'font-variant-position',
		readableName: 'Font Variant Position',
		description:
			'The property allows us to take advantage of typographic subscript and superscript glyphs',
		allowedValues: [
			{
				value: 'normal',
				description:
					'This property helps to deactivates the alternate superscript and subscript glyphs',
			},
			{
				value: 'sub',
				description: 'The property helps to enables the subscript variants',
			},
			{
				value: 'super',
				description: 'The property helps to enables the superscript variants',
			},
			{
				value: 'unset',
				description:
					'This property helps to set all the properties to their parent value if they are inheritable or to their initial value if not inheritable',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	fontWeight: {
		originalName: 'font-weight',
		readableName: 'Font Weight',
		description: 'This property specifies how thin or thick the characters in text will look',
		allowedValues: [
			{
				value: 'normal',
				description: 'Default value. This property defines normal characters',
			},
			{
				value: 'bold',
				description: 'This property defines thick characters',
			},
			{
				value: 'bolder',
				description: 'This property defines thicker characters',
			},
			{
				value: 'lighter',
				description: 'This property defines lighter characters',
			},
			{
				value: '100',
			},
			{
				value: '200',
			},
			{
				value: '300',
			},
			{
				value: '400',
			},
			{
				value: '500',
			},
			{
				value: '600',
			},
			{
				value: '700',
			},
			{
				value: '800',
			},
			{
				value: '900',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	footnoteDisplay: {
		originalName: 'footnote-display',
		readableName: 'Footnote Display',
		description:
			'This property determines whether a footnote is displayed as a block element or inline element',
		allowedValues: [
			{
				value: 'block',
				description:
					'This property helps to place the footnote element in the footnote area as a block element',
			},
			{
				value: 'inline',
				description:
					'This property helps to place the footnote element in the footnote area as a inline element',
			},
			{
				value: 'compact',
				description:
					'The user agent determines whether a given footnote element is placed as a block element or an inline element',
			},
		],
	},
	footnotePolicy: {
		originalName: 'footnote-policy',
		readableName: 'Footnote Policy',
		description:
			'This property allows authors some influence over the rendering of difficult pages',
	},
	forcedColorAdjust: {
		originalName: 'forced-color-adjust',
		readableName: 'Forced Color Adjust',
		description:
			'This property allows authors to opt certain elements out of forced colors mode',
		allowedValues: [
			{
				value: 'auto',
				description:
					'Default value. This property determines the user agent adjusted the colors of an element in forced colors mode',
			},
			{
				value: 'none',
				description:
					'This property defines the user agents are not automatically adjusted the colors of an element in forced colors mode',
			},
		],
	},
	gap: {
		originalName: 'gap',
		readableName: 'Gap',
		description:
			'This property helps to specifies the size of gap between the rows and columns',
	},
	grid: {
		originalName: 'grid',
		readableName: 'Grid',
		description:
			'The property sets all of the explicit and implicit grid properties in a single declaration',
	},
	gridArea: {
		originalName: 'grid-area',
		readableName: 'Grid Area',
		description:
			'This property specifies a grid item size and location within a grid by contributing a line, a span to its grid placement',
	},
	gridAutoColumns: {
		originalName: 'grid-auto-columns',
		readableName: 'Grid Auto Columns',
		description: 'This property is used to set a size for the columns in a grid layout',
	},
	gridAutoFlow: {
		originalName: 'grid-auto-flow',
		readableName: 'Grid Auto Flow',
		description:
			'This property helps to controls how auto-placed items get inserted in the grid',
		allowedValues: [
			{
				value: 'row',
				description: 'Default value. The items will be placed by filling each row',
			},
			{
				value: 'column',
				description: 'The items will be placed by filling each column',
			},
			{
				value: 'dense',
				description: 'The items will be placed by filling any holes in the grid',
			},
			{
				value: 'row dense',
				description:
					'The items will be placed by filling each row and also fills any holes in the grid',
			},
			{
				value: 'column dense',
				description:
					'The items will be placed by filling each column and also fills any holes in the grid',
			},
		],
	},
	gridAutoRows: {
		originalName: 'grid-auto-rows',
		readableName: 'Grid Auto Rows',
		description: 'This property used to sets a size for the columns in a grid layout',
	},
	gridColumn: {
		originalName: 'grid-column',
		readableName: 'Grid Column',
		description:
			'This property is used to organize elements into columns and specifies a grid item size, location within a grid column',
	},
	gridColumnEnd: {
		originalName: 'grid-column-end',
		readableName: 'Grid Column End',
		description:
			'This property specifies from which column to end displaying the item and how many columns an item will span',
	},
	gridColumnGap: {
		originalName: 'grid-column-gap',
		readableName: 'Grid Column Gap',
		description:
			'This property used to define the size of gap between the columns in a grid container',
	},
	gridColumnStart: {
		originalName: 'grid-column-start',
		readableName: 'Grid Column Start',
		description: 'This property specifies from which column to start displaying the item',
	},
	gridGap: {
		originalName: 'grid-gap',
		readableName: 'Grid Gap',
		description:
			'This property specifies the size of the gap between the rows and columns in a grid container',
	},
	gridRow: {
		originalName: 'grid-row',
		readableName: 'Grid Row',
		description:
			'This property is used to organize elements into rows and specifies a grid item size, location within a grid layout',
	},
	gridRowEnd: {
		originalName: 'grid-row-end',
		readableName: 'Grid Row End',
		description:
			'This property specifies from which row to end displaying the item and how many rows an item will span',
	},
	gridRowGap: {
		originalName: 'grid-row-gap',
		readableName: 'Grid Row Gap',
		description:
			'This property used to define the size of gap between the rows in a grid container',
	},
	gridRowStart: {
		originalName: 'grid-row-start',
		readableName: 'Grid Row Start',
		description: 'This property specifies from which row to start displaying the item',
	},
	gridTemplate: {
		originalName: 'grid-template',
		readableName: 'Grid Template',
		description: 'This property contains three properties i.e, area, column and row',
	},
	gridTemplateAreas: {
		originalName: 'grid-template-areas',
		readableName: 'Grid Template Areas',
		description:
			'This property specifies areas within the grid layout and user can name grid items by using the grid-area property',
	},
	gridTemplateColumns: {
		originalName: 'grid-template-columns',
		readableName: 'Grid Template Columns',
		description: 'This property helps to set the size(s) of the columns and rows',
	},
	gridTemplateRows: {
		originalName: 'grid-template-rows',
		readableName: 'Grid Template Rows',
		description: 'This property helps to set the size(s) of the columns and rows',
	},
	hangingPunctuation: {
		originalName: 'hanging-punctuation',
		readableName: 'Hanging Punctuation',
		description:
			'The property specifies where the punctuation mark may be placed, outside the line box at the start or at the end of a full line of text',
		allowedValues: [
			{
				value: 'none',
				description:
					'There will be no punctuation mark may be placed outside the line box at the start or at the end of a full line of text',
			},
			{
				value: 'first',
				description:
					'This property specifies the punctuation mark may hang outside the start edge of the first line',
			},
			{
				value: 'last',
				description:
					'This property specifies the punctuation mark may hang outside the end edge of the last line',
			},
			{
				value: 'allow-end',
				description:
					'This property specifies that punctuation mark may hang outside the end edge of all lines. If the punctuation does not otherwise fit prior to justification',
			},
			{
				value: 'force-end',
				description:
					'This property specifies that punctuation mark may hang outside the end edge of all lines. If justification is enabled on this line, then it will force the punctuation to hang',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	height: {
		originalName: 'height',
		readableName: 'Height',
		description: 'This property helps to sets the height of an element',
	},
	hyphens: {
		originalName: 'hyphens',
		readableName: 'Hyphens',
		description:
			'The property specifies how words should be hyphenated when text wraps across multiple lines',
	},
	imageOrientation: {
		originalName: 'image-orientation',
		readableName: 'Image Orientation',
		description: 'This provides a way to specify a rotation to be applied to an image',
	},
	imageRendering: {
		originalName: 'image-rendering',
		readableName: 'Image Rendering',
		description: 'This property is used to set an image scaling algorithm.',
		allowedValues: [
			{
				value: 'auto',
				description: 'The property represents the scaling algorithm is UA dependent',
			},
			{
				value: 'smooth',
				description:
					'The property represents the image should be scaled with an algorithm that maximizes the appearance of the image',
			},
			{
				value: 'high-quality',
				description:
					'The property represents the identical to smooth, but with a preference for higher-quality scaling',
			},
			{
				value: 'crisp-edges',
				description:
					'The property represents the image must be scaled with an algorithm that preserves contrast and edges in the image',
			},
			{
				value: 'pixelated',
				description:
					'When scaling the image up, the nearest-neighbor algorithm must be used, so that the image appears to be composed of large pixels.',
			},
		],
	},
	imageResolution: {
		originalName: 'image-resolution',
		readableName: 'Image Resolution',
		description:
			'The property specifies the intrinsic resolution of all raster images used in or on the element.',
	},
	initialLetter: {
		originalName: 'initial-letter',
		readableName: 'Initial Letter',
		description:
			'The property specifies the first letter and the number of lines it occupies. for example, the newspapers where the first letter is larger than the rest of the content.',
	},
	initialLetterAlign: {
		originalName: 'initial-letter-align',
		readableName: 'Initial Letter Align',
		description: 'The property specifies the alignment of initial letters within a paragraph',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The user agent selects the value which corresponds to the language of the text.',
			},
			{
				value: 'alphabetic',
				description:
					'As described above, the cap height of the initial letter aligns with the cap height of the first line of text',
			},
			{
				value: 'hanging',
				description:
					'The hanging baseline of the initial letter aligns with the hanging baseline of the first line of text.',
			},
			{
				value: 'ideographic',
				description: 'The initial letter is centered in the N-line area.',
			},
		],
	},
	inlineSize: {
		originalName: 'inline-size',
		readableName: 'Inline Size',
		description:
			'This property defines the horizontal or vertical size of an elements block, depending on its writing mode',
	},
	inlineSizing: {
		originalName: 'inline-sizing',
		readableName: 'Inline Sizing',
		description:
			'This property is used to define the horizontal or vertical size of an element’s block',
	},
	inset: {
		originalName: 'inset',
		readableName: 'Inset',
		description:
			'This property is a shorthand that corresponds to the top, right, bottom, and/or left properties',
	},
	insetBlock: {
		originalName: 'inset-block',
		readableName: 'Inset Block',
		description:
			'The property is a shorthand logical property that sets the length that an element is offset in the block direction combining inset-block-start and inset-block-end',
	},
	insetBlockEnd: {
		originalName: 'inset-block-end',
		readableName: 'Inset Block End',
		description:
			'The property is used to define logical block end offset, not for the inline offset or logical block',
	},
	insetBlockStart: {
		originalName: 'inset-block-start',
		readableName: 'Inset Block Start',
		description:
			'The property is used to define logical block start offset, not for the inline offset or logical block',
	},
	insetInline: {
		originalName: 'inset-inline',
		readableName: 'Inset Inline',
		description:
			'The property defines the logical start and end offsets of an element in the inline direction',
	},
	insetInlineEnd: {
		originalName: 'inset-inline-end',
		readableName: 'Inset Inline End',
		description:
			'This property is used to define logical inline end offset, not for the block offset or logical block',
	},
	insetInlineStart: {
		originalName: 'inset-inline-start',
		readableName: 'Inset Inline Start',
		description:
			'This property is used to define logical inline start offset, not for the block offset or logical block',
	},
	isolation: {
		originalName: 'isolation',
		readableName: 'Isolation',
		description:
			'The isolation property allows to create a new stacking context. It can be used with the mix-blend-mode property',
		allowedValues: [
			{
				value: 'auto',
				description:
					'Default value. If the property is set to auto, a stacking context is created in case background-blend-mode and mix-blend-mode are applied to the element',
			},
			{
				value: 'isolate',
				description: 'Creates a stacking context on an element, and isolates the group.',
			},
			{
				value: 'initial',
				description: 'Makes the property use its default value.',
			},
			{
				value: 'inherit',
				description: 'Inherits the property from its parents element.',
			},
		],
	},
	justifyContent: {
		originalName: 'justify-content',
		readableName: 'Justify Content',
		description:
			'This property helps browser to add space between and around content items along the main-axis of a flex container',
		allowedValues: [
			{
				value: 'flex-start',
				description:
					'Default value. This property helps to place items at the beginning of the container',
			},
			{
				value: 'flex-end',
				description: 'This property helps to place items at the end of the container',
			},
			{
				value: 'center',
				description: 'This property helps to place items at the center of the container',
			},
			{
				value: 'space-between',
				description: 'The space will be added between items',
			},
			{
				value: 'space-around',
				description:
					'This property helps to add space before, between, and after the items',
			},
			{
				value: 'space-evenly',
				description: 'This property helps to add equal space around the items',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	justifyItems: {
		originalName: 'justify-items',
		readableName: 'Justify Items',
		description:
			'This proeprty is a sub-property of the CSS Box Alignment Module which basically controls the alignment of grid items within their scope. justify-items aligns grid items along the row (inline) axis',
		allowedValues: [
			{
				value: 'flex-start',
				description:
					'Default value. This property helps to place items at the beginning of the container',
			},
			{
				value: 'flex-end',
				description: 'This property helps to place items at the end of the container',
			},
			{
				value: 'center',
				description: 'This property helps to place items at the center of the container',
			},
			{
				value: 'space-between',
				description: 'The space will be added between items',
			},
			{
				value: 'space-around',
				description:
					'This property helps to add space before, between, and after the items',
			},
			{
				value: 'space-evenly',
				description: 'This property helps to add equal space around the items',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	justifySelf: {
		originalName: 'justify-self',
		readableName: 'Justify Self',
		description:
			'This property can be used to override any alignment that has been set at the container level using the justify-items property',
		allowedValues: [
			{
				value: 'auto',
				description:
					'This property uses the value provided by the justify-items property on the parent container. If the element has no parent, then this value computes to normal',
			},
			{
				value: 'normal',
				description: 'The alignment will be default for the layout mode in this property',
			},
			{
				value: 'stretch',
				description:
					'Items are stretched such as the cross-size of the items margin box is the same as the line while still respecting min-height, min-width, max-height, and max-height constraints',
			},
		],
	},
	left: {
		originalName: 'left',
		readableName: 'Left',
		description:
			'This property used to specify the horizontal position of a positioned element',
	},
	letterSpacing: {
		originalName: 'letter-spacing',
		readableName: 'Letter Spacing',
		description:
			'This property is used to increases or decreases the space between characters in a text according to requirements',
	},
	lightingColor: {
		editorType: 'color',
		originalName: 'lighting-color',
		readableName: 'Lighting Color',
		description:
			'This property is used in SVG to defines the color of the light source for lighting filter primitives',
	},
	lineBreak: {
		originalName: 'line-break',
		readableName: 'Line Break',
		description:
			'This property defines the point at which two lines of text are divided when working with punctuation and symbols',
		allowedValues: [
			{
				value: 'auto',
				description: 'By default line break rule it will break the text',
			},
			{
				value: 'loose',
				description:
					'The property defines it will break text using the least restrictive line break rule. Typically used for short lines, such as in newspapers',
			},
			{
				value: 'normal',
				description:
					'The property defines by common line break rule it will break the text',
			},
			{
				value: 'strict',
				description:
					'The property defines by most stringent line break rule it will break the text',
			},
		],
	},
	lineClamp: {
		originalName: 'line-clamp',
		readableName: 'Line Clamp',
		description:
			'This property helps to truncates a text at a specified number of lines if user tell it the desirable number of lines',
		allowedValues: [
			{
				value: 'none',
				description: 'The property has no maximum number of lines and also no truncation',
			},
			{
				value: 'integer',
				description:
					'The property helps to set the maximum number of lines before truncating the content and then displays an ellipsis',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	lineGrid: {
		originalName: 'line-grid',
		readableName: 'Line Grid',
		description:
			'The property specifies a new baseline grid for the element instead of the default behavior which is to match its parent line grid',
	},
	lineHeight: {
		originalName: 'line-height',
		readableName: 'Line Height',
		description: 'This property helps to set the height of a line',
	},
	linePadding: {
		originalName: 'line-padding',
		readableName: 'Line Padding',
		description: '',
		allowedValues: [],
	},
	lineSnap: {
		originalName: 'line-snap',
		readableName: 'Line Snap',
		description: 'This proeprty helps to controls how line boxes snap to a line-grid',
		allowedValues: [
			{
				value: 'none',
				description: 'The property has line boxes stack normally',
			},
			{
				value: 'baseline',
				description: 'The property snap to the line grid that applies to the element',
			},
			{
				value: 'contain',
				description: 'The property helps to center the line boxes between baselines',
			},
		],
	},
	listStyle: {
		originalName: 'list-style',
		readableName: 'List Style',
		description: 'This property specifies the styles of list-item markers (bullet points)',
		allowedValues: [
			{
				value: 'list-style-type',
				description:
					'This property helps to set the type of list-item marker and its default value is "disc"',
			},
			{
				value: 'list-style-position',
				description:
					'This property helps to set the position of list-item marker and its default value is "outside"',
			},
			{
				value: 'list-style-image',
				description:
					'This property added an image by replacing list-item marker and its default value is "none',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	listStyleImage: {
		originalName: 'list-style-image',
		readableName: 'List Style Image',
		description: 'This property added an image by replacing list-item marker(bullet points)',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. No image will be displayed',
			},
			{
				value: 'url',
				description:
					'The property specifies the path to the image to be used as a list-item marker',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	listStylePosition: {
		originalName: 'list-style-position',
		readableName: 'List Style Position',
		description: 'This property specifies the position of list-item marker(bullet points)',
		allowedValues: [
			{
				value: 'inside',
				description:
					'The property specifies the bullet points which will be present inside the list item',
			},
			{
				value: 'outside',
				description:
					'Default value. The property specifies the bullet points which will be outside the list item',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	listStyleType: {
		originalName: 'list-style-type',
		readableName: 'List Style Type',
		description:
			'This property specifies what type of list-item marker will be there in a list.',
		allowedValues: [
			{
				value: 'disc',
				description: 'Default value. This specifies a filled circle marker',
			},
			{
				value: 'armenian',
				description: 'This property specifies the marker is traditional Armenian numbering',
			},
			{
				value: 'circle',
				description: 'The property represents the marker as a circle',
			},
			{
				value: 'cjk-ideographic',
				description: 'The marker is plain ideographic numbers',
			},
			{
				value: 'decimal',
				description: 'This property specifies the marker as a number',
			},
			{
				value: 'decimal-leading-zero',
				description:
					'This property specifies the marker as a number with leading zeros (01, 02, 03, etc.)',
			},
			{
				value: 'georgian',
				description: 'This property specifies the marker as traditional Georgian numbering',
			},
			{
				value: 'hebrew',
				description: 'This property specifies the marker as traditional Hebrew numbering',
			},
			{
				value: 'hiragana',
				description: 'This property specifies the marker as traditional Hiragana numbering',
			},
			{
				value: 'hiragana-iroha',
				description: 'This property specifies the marker as traditional Hiragana numbering',
			},
			{
				value: 'katakana',
				description: 'This property specifies the marker as traditional Katakana numbering',
			},
			{
				value: 'katakana-iroha',
				description:
					'This property specifies the marker as traditional Katakana iroha numbering',
			},
			{
				value: 'lower-alpha',
				description: 'This property specifies the marker as lower-alpha (a, b, c, d, etc.)',
			},
			{
				value: 'lower-greek',
				description: 'This property specifies the marker as lower-greek',
			},
			{
				value: 'lower-latin',
				description: 'This property specifies the marker as lower-latin (a, b, c, d, etc.)',
			},
			{
				value: 'lower-roman',
				description:
					'This property specifies the marker as lower-roman (i, ii, iii, iv, etc.)',
			},
			{
				value: 'none',
				description: 'No marker will be shown',
			},
			{
				value: 'square',
				description: 'This property specifies the marker as a square',
			},
			{
				value: 'upper-alpha',
				description: 'This property specifies the marker as upper-alpha (A, B, C, D, etc.)',
			},
			{
				value: 'upper-greek',
				description: 'This property specifies the marker as upper-greek',
			},
			{
				value: 'upper-latin',
				description: 'This property specifies the marker as upper-latin (A, B, C, D, etc.)',
			},
			{
				value: 'upper-roman',
				description:
					'This property specifies the marker as upper-roman (I, II, III, IV, etc.)',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	margin: {
		originalName: 'margin',
		readableName: 'Margin',
		description: 'This property helps to add space around an element',
	},
	marginBlock: {
		originalName: 'margin-block',
		readableName: 'Margin Block',
		description:
			'The property helps to create space around the element in the inline direction which is determined by the element’s direction, text-orientation and writing-mode of the element. This property act just like setting margin-top and margin-bottom and also works in two directions instead of four',
		allowedValues: [
			{
				value: 'marginBlockEnd',
				description:
					'This property defines the logical block end margin of an element which is determined by the element’s direction, text-orientatio and writing-mode of the element',
			},
			{
				value: 'marginBlockEnd',
				description:
					'This property defines the logical block start margin of an element which is determined by the element’s direction, text-orientatio and writing-mode of the element',
			},
		],
	},
	marginBlockEnd: {
		originalName: 'margin-block-end',
		readableName: 'Margin Block End',
		description:
			'This property defines the logical block end margin of an element which is determined by the element’s direction, text-orientatio and writing-mode of the element',
	},
	marginBlockStart: {
		originalName: 'margin-block-start',
		readableName: 'Margin Block Start',
		description:
			'This property defines the logical block start margin of an element which is determined by the element’s direction, text-orientatio and writing-mode of the element',
	},
	marginBottom: {
		originalName: 'margin-bottom',
		readableName: 'Margin Bottom',
		description: 'This property used to set the bottom margin of an element',
	},
	marginBreak: {
		originalName: 'margin-break',
		readableName: 'Margin Break',
		description: 'This property helps to adjoin the margins at break points',
		allowedValues: [
			{
				value: 'auto',
				description:
					'When a forced break occurs there, adjoining margins before the break are truncated, but margins after the break are preserved',
			},
			{
				value: 'keep',
				description: 'The margins are not truncated which adjoins a fragmentation break',
			},
			{
				value: 'discard',
				description:
					'The margins are always truncated which adjoins a fragmentation break, including at the start and end of a fragmentation context',
			},
		],
	},
	marginInline: {
		originalName: 'margin-inline',
		readableName: 'Margin Inline',
		description:
			'This property helps to set the logical properties of an element i.e, the values of margin-inline-start and margin-inline-end',
	},
	marginInlineEnd: {
		originalName: 'margin-inline-end',
		readableName: 'Margin Inline End',
		description:
			'This property defines the logical inline end margin of an element which is determined by the element’s direction, text-orientatio and writing-mode of the element',
	},
	marginInlineStart: {
		originalName: 'margin-inline-start',
		readableName: 'Margin Inline Start',
		description:
			'This property defines the logical inline start margin of an element which is determined by the element’s direction, text-orientatio and writing-mode of the element',
	},
	marginLeft: {
		originalName: 'margin-left',
		readableName: 'Margin Left',
		description: 'This property used to set the left margin of an element',
	},
	marginRight: {
		originalName: 'margin-right',
		readableName: 'Margin Right',
		description: 'This property used to set the right margin of an element',
	},
	marginTop: {
		originalName: 'margin-top',
		readableName: 'Margin Top',
		description: 'This property used to set the top margin of an element',
	},
	marginTrim: {
		originalName: 'margin-trim',
		readableName: 'Margin Trim',
		description:
			'This property allows the container to trim the margins of its children where they adjoin the edges of the container',
		allowedValues: [
			{
				value: 'none',
				description: 'There will be no margins trim by the container in this property',
			},
			{
				value: 'in-flow',
				description:
					'The property represents the block-axis margins adjacent to the box edges are truncated to zero',
			},
			{
				value: 'all',
				description:
					'The property trims the margins of in-flow boxes and floats whose margins coincide with the edge of container content',
			},
		],
	},
	markerOffset: {
		originalName: 'marker-offset',
		readableName: 'Marker Offset',
		description:
			'The property can be used in bulleted lists for specifying the distance between the nearest border edges of a marker box (or bullet) and its associated principal box',
		allowedValues: [
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
			{
				value: 'unset',
				description:
					'This property sets all properties to their parent value if they are inheritable or to their initial value if not inheritable',
			},
		],
	},
	marks: {
		originalName: 'marks',
		readableName: 'Marks',
		description:
			'This property is used to setup crop marks and cross marks on paged media and used with the @page rule',
		allowedValues: [
			{
				value: 'crop',
				description: 'The property directs that crop marks be placed on the page',
			},
			{
				value: 'cross',
				description: 'The property causes the user agent to add cross marks to the page',
			},
			{
				value: 'none',
				description: 'There will be no mask should be placed on the page in this property',
			},
		],
	},
	mask: {
		originalName: 'mask',
		readableName: 'Mask',
		description:
			'This property is a graphical operation that can fully or partially hide the portions of an element or object',
		allowedValues: [
			{
				value: 'mask-reference',
				description: 'The property helps to set the mask image source',
			},
			{
				value: 'masking-mode',
				description: 'The property helps to set the masking mode of the mask image',
			},
			{
				value: 'position',
				description: 'The property helps to set the position of the mask image',
			},
			{
				value: 'bg-size',
				description: 'The property helps to set the size of the mask image',
			},
			{
				value: 'repeat-style',
				description: 'The property helps to set the repetition of the mask image',
			},
			{
				value: 'geometry-box',
				description:
					'The property helps to set the area that is affected by the mask image',
			},
			{
				value: 'compositing-operator',
				description:
					'The property helps to set the compositing operation used on the current mask layer',
			},
		],
	},
	maskBorder: {
		originalName: 'mask-border',
		readableName: 'Mask Border',
		description: 'The property helps to create a mask along the border edge of an element',
		allowedValues: [
			{
				value: 'mask-border-source',
				description:
					'This property determines the source image used to create the mask border of an element',
			},
			{
				value: 'mask-border-slice',
				description:
					'This property can specified the values up to four and the dimensions for slicing the source image into regions',
			},
			{
				value: 'mask-border-width',
				description:
					'This property determines the width of the border mask and may be specified the values up to four',
			},
			{
				value: 'mask-border-outset',
				description:
					'This property determines distance of the border mask from the outside edge of an element and may be specified the values up to four',
			},
			{
				value: 'mask-border-repeat',
				description:
					'This property determines how the edge regions of the source image are adjusted to fit the dimensions of the border mask and may be specified the values up to two',
			},
			{
				value: 'mask-border-mode',
				description:
					'This property determines whether the source image is treated as a luminance mask or alpha mask',
			},
		],
	},
	maskBorderMode: {
		originalName: 'mask-border-mode',
		readableName: 'Mask Border Mode',
		description:
			'This property determines whether the source image is treated as a luminance mask or alpha mask',
		allowedValues: [
			{
				value: 'alpha',
				description:
					'The property helps to indicates the keyword, that the transparency/alpha values of the mask border image should be used as the mask values',
			},
			{
				value: 'luminance',
				description:
					'The property helps to indicates the keyword, that the luminance values of the mask border image should be used as the mask values',
			},
		],
	},
	maskBorderRepeat: {
		originalName: 'mask-border-repeat',
		readableName: 'Mask Border Repeat',
		description:
			'This property determines how the edge regions of the source image are adjusted to fit the dimensions of the border mask and may be specified the values up to two',
		allowedValues: [
			{
				value: 'stretch',
				description:
					'The property determines to fill the gap between each border, the edge regions of the source image are stretched',
			},
			{
				value: 'repeat',
				description:
					'The property determines to fill the gap between each border, the edge regions of the source image are repeated. The tiles may be clipped to achieve the proper fit',
			},
			{
				value: 'round',
				description:
					'The property determines to fill the gap between each border, the edge regions of the source image are repeated. The tiles may be stretched to achieve the proper fit',
			},
			{
				value: 'space',
				description:
					'The property determines to fill the gap between each border, the edge regions of the source image are repeated. The extra space will be distributed in between tiles to achieve the proper fit',
			},
		],
	},
	maskBorderSlice: {
		originalName: 'mask-border-slice',
		readableName: 'Mask Border Slice',
		description:
			'The property is used to divide the source image into regions, which are then dynamically applied to the final mask border',
	},
	maskBorderSource: {
		originalName: 'mask-border-source',
		readableName: 'Mask Border Source',
		description:
			'This property determines the source image used to create the mask border of an element',
		allowedValues: [
			{
				value: 'none',
				description: 'There will be no mask border is used',
			},
			{
				value: 'image',
				description: 'This property used the image reference for the mask border',
			},
		],
	},
	maskBorderWidth: {
		originalName: 'mask-border-width',
		readableName: 'Mask Border Width',
		description:
			'This property determines the width of the border mask and may be specified the values up to four',
	},
	maskClip: {
		originalName: 'mask-clip',
		readableName: 'Mask Clip',
		description:
			'The property specified the area which is affected by a mask and also the painted content of an element must be restricted to this area',
		allowedValues: [
			{
				value: 'content-box',
				description:
					'The property has the painted content which is clipped to the content box',
			},
			{
				value: 'padding-box',
				description:
					'The property has the painted content which is clipped to the padding box',
			},
			{
				value: 'border-box',
				description:
					'The property has the painted content which is clipped to the border box',
			},
			{
				value: 'margin-box',
				description:
					'The property has the painted content which is clipped to the margin box',
			},
			{
				value: 'fill-box',
				description:
					'The property has the painted content which is clipped to the object bounding box',
			},
			{
				value: 'stroke-box',
				description:
					'The property has the painted content which is clipped to the stroke bounding box',
			},
			{
				value: 'view-box',
				description: 'The property uses the nearest SVG viewport as the reference box',
			},
			{
				value: 'no-clip',
				description: 'There will be no clipped for painted content in this property',
			},
		],
	},
	maskComposite: {
		originalName: 'mask-composite',
		readableName: 'Mask Composite',
		description:
			'This property helps to represents a compositing operation used on the current mask layer with the mask layers below it',
		allowedValues: [
			{
				value: 'add',
				description: 'The property helps to place the source over the destination',
			},
			{
				value: 'subtract',
				description:
					'The property helps to place the source, where it falls outside of the destination',
			},
			{
				value: 'intersect',
				description:
					'The parts of source that overlap the destination, replace the destination',
			},
			{
				value: 'exclude',
				description: 'The non-overlapping regions of source and destination are combined',
			},
		],
	},
	maskImage: {
		originalName: 'mask-image',
		readableName: 'Mask Image',
		description:
			'The property sets the image that is used as mask layer for an element. By default this means the alpha channel of the mask image will be multiplied with the alpha channel of the element',
		allowedValues: [
			{
				value: 'none',
				description:
					'The property helps the keywords to interpreted as an opaque white image layer',
			},
			{
				value: 'image',
				description: 'The property helps an image value to be used as mask image layer',
			},
		],
	},
	maskMode: {
		originalName: 'mask-mode',
		readableName: 'Mask Mode',
		description:
			'The property sets whether the mask reference is treated as a luminance or alpha mask',
		allowedValues: [
			{
				value: 'alpha',
				description:
					'The property helps to indicates the keyword, that the transparency (alpha channel) values of the mask layer image should be used as the mask values',
			},
			{
				value: 'luminance',
				description:
					'The property helps to indicates the keyword, that the luminance values of the mask layer image should be used as the mask values',
			},
			{
				value: 'match-source',
				description:
					'The property defines if the mask-image property is of type <mask-source>, the luminance values of the mask layer image should be used as the mask values',
			},
		],
	},
	maskOrigin: {
		originalName: 'mask-origin',
		readableName: 'Mask Origin',
		description: 'This property helps to determines the origin of a mask',
		allowedValues: [
			{
				value: 'content-box',
				description: 'The property has the position related to content box',
			},
			{
				value: 'padding-box',
				description: 'The property has the position related to padding box',
			},
			{
				value: 'border-box',
				description: 'The property has the position related to border box',
			},
			{
				value: 'margin-box',
				description: 'The property has the position related to margin box',
			},
			{
				value: 'fill-box',
				description: 'The property has the position related to object bounding box',
			},
			{
				value: 'stroke-box',
				description: 'The property has the position related to stroke bounding box',
			},
			{
				value: 'view-box',
				description: 'The property uses the nearest SVG viewport as the reference box',
			},
		],
	},
	maskPosition: {
		originalName: 'mask-position',
		readableName: 'Mask Position',
		description:
			'The property helps to set the initial position of mask which is relative to the mask position layer set by mask-origin, for each defined mask image',
		allowedValues: [
			{
				value: 'position',
				description:
					'The position can be set outside of the element box and one to four values representing a 2D position regarding the edges of the element box',
			},
		],
	},
	maskRepeat: {
		originalName: 'mask-repeat',
		readableName: 'Mask Repeat',
		description:
			'The property helps to determines how mask images are repeated and also the images can be repeated along the horizontal axis, the vertical axis, both axes, or not repeated at all',
		allowedValues: [
			{
				value: 'repeat-style',
				description:
					'The property can have one or two value syntax. The first value represents the horizontal repetition behavior and the second value represents the vertical behavior',
			},
		],
	},
	maskSize: {
		originalName: 'mask-size',
		readableName: 'Mask Size',
		description:
			'The property helps to determines the sizes of the mask images. The size of the image can be fully or partially constrained in order to preserve its intrinsic ratio',
	},
	maskType: {
		originalName: 'mask-type',
		readableName: 'Mask Type',
		description:
			'This property helps to determines the type of the mask and sets whether an SVG <mask> element is used as a luminance or an alpha mask',
		allowedValues: [
			{
				value: 'alpha',
				description:
					'The property helps to indicates the keyword, that the associated mask image is a luminance mask',
			},
			{
				value: 'luminance',
				description:
					'The property helps to indicates the keyword, that the associated mask image is an alpha mask',
			},
		],
	},
	maxBlockSize: {
		originalName: 'max-block-size',
		readableName: 'Max Block Size',
		description:
			'This property is used to create the maximum size of an element in the direction opposite that of the writing direction',
	},
	maxHeight: {
		originalName: 'max-height',
		readableName: 'Max Height',
		description: 'This property used to set the maximum height of an element',
	},
	maxLines: {
		originalName: 'max-lines',
		readableName: 'Max Lines',
		description:
			'The property is used to limit a block content to a maximum number of lines before being cropped out',
		allowedValues: [
			{
				value: 'none',
				description: 'There are no maximum number of lines are specified',
			},
			{
				value: 'integer',
				description:
					'The property sets the number of lines before content is discarded and negative values are not allowed',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	maxWidth: {
		originalName: 'max-width',
		readableName: 'Max Width',
		description: 'This property is used to set the maximum width of an element',
	},
	minHeight: {
		originalName: 'min-height',
		readableName: 'Min Height',
		description: 'This property is used to set the minimum height of an element',
	},
	minWidth: {
		originalName: 'min-width',
		readableName: 'Min Width',
		description: 'This property is used to set the minimum width of an element',
	},
	mixBlendMode: {
		originalName: 'mix-blend-mode',
		readableName: 'Mix Blend Mode',
		description:
			'This property helps to set how an content should blend with the content of the parent and background of the element',
		allowedValues: [
			{
				value: 'normal',
				description: 'Default value. The blending mode will set to normal in this property',
			},
			{
				value: 'multiply',
				description: 'The blending mode will set to multiply in this property',
			},
			{
				value: 'screen',
				description: 'The blending mode will set to screen in this property',
			},
			{
				value: 'overlay',
				description: 'The blending mode will set to overplay in this property',
			},
			{
				value: 'darken',
				description: 'The blending mode will set to darken in this property',
			},
			{
				value: 'lighten',
				description: 'The blending mode will set to lighten in this property',
			},
			{
				value: 'color-dodge',
				description: 'The blending mode will set to color-dodge in this property',
			},
			{
				value: 'color-burn',
				description: 'The blending mode will set to color-burn in this property',
			},
			{
				value: 'difference',
				description: 'The blending mode will set to difference in this property',
			},
			{
				value: 'exclusion',
				description: 'The blending mode will set to exclusion in this property',
			},
			{
				value: 'hue',
				description: 'The blending mode will set to hue in this property',
			},
			{
				value: 'saturation',
				description: 'The blending mode will set to saturation in this property',
			},
			{
				value: 'color',
				description: 'The blending mode will set to color in this property',
			},
			{
				value: 'luminosity',
				description: 'The blending mode will set to luminosity in this property',
			},
		],
	},
	navDown: {
		originalName: 'nav-down',
		readableName: 'Nav Down',
		description:
			'This property specifies where the focus will be placed when the user navigates with the down arrow key',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The property helps browser to determines which element to navigate the focus to',
			},
			{
				value: 'unset',
				description:
					'This property sets all properties to their parent value if they are inheritable or to their initial value if not inheritable',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	navLeft: {
		originalName: 'nav-left',
		readableName: 'Nav Left',
		description:
			'The property specifies where the focus will be placed when the user navigates with the left arrow key',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The property helps browser to determines which element to navigate the focus to',
			},
			{
				value: 'unset',
				description:
					'This property sets all properties to their parent value if they are inheritable or to their initial value if not inheritable',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	navRight: {
		originalName: 'nav-right',
		readableName: 'Nav Right',
		description:
			'The property specifies where the focus will be placed when the user navigates with the right arrow key',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The property helps browser to determines which element to navigate the focus to',
			},
			{
				value: 'unset',
				description:
					'This property sets all properties to their parent value if they are inheritable or to their initial value if not inheritable',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	navUp: {
		originalName: 'nav-up',
		readableName: 'Nav Up',
		description:
			'The property specifies where the focus will be placed when the user navigates with the up arrow key',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The property helps browser to determines which element to navigate the focus to',
			},
			{
				value: 'unset',
				description:
					'This property sets all properties to their parent value if they are inheritable or to their initial value if not inheritable',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	objectFit: {
		originalName: 'object-fit',
		readableName: 'Object Fit',
		description:
			'This property is used to specify how an <img> or <video> should be resized to fit its container',
		allowedValues: [
			{
				value: 'fill',
				description:
					'Default value. The property specifies if user wants to fill the element content box then the replaced content will be sized',
			},
			{
				value: 'contain',
				description:
					'The property defines the replaced content is scaled to maintain its aspect ratio while fitting within the elements content box',
			},
			{
				value: 'cover',
				description:
					'The property defines the replaced content is sized to maintain its aspect ratio while filling the elements entire content box',
			},
			{
				value: 'none',
				description: 'The property defines the replaced content will not resized',
			},
			{
				value: 'scale-down',
				description:
					'The property specifies the content is sized as if none or contain were specified',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	objectPosition: {
		originalName: 'object-position',
		readableName: 'Object Position',
		description:
			'The property is used together with object-fit to specify how an <img> or <video> should be positioned with x/y coordinates inside its own content box',
		allowedValues: [
			{
				value: 'position',
				description:
					'The property is used to specifies the position of the video and images inside its content box. The first value will be controls by x-axis and the second value will control by y-axis',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	offset: {
		originalName: 'offset',
		readableName: 'Offset',
		description:
			'The property helps to set all the properties required for animating an element along a defined path and also can be used as shorthand property for offset-position, offset-path etc',
		allowedValues: [
			{
				value: 'offset-position',
				description: 'The property determines the initial position of the offset path',
			},
			{
				value: 'offset-path',
				description: 'The property determines a movement path for an element to follow',
			},
			{
				value: 'offset-distance',
				description: 'The property determines the position along the offset-path',
			},
			{
				value: 'offset-anchor',
				description:
					'The property determines an anchor point of the box along the offset path',
			},
			{
				value: 'offset-rotate',
				description: 'The property determines the orientation of an element',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	offsetAnchor: {
		originalName: 'offset-anchor',
		readableName: 'Offset Anchor',
		description: 'The property determines an anchor point of the box along the offset path',
	},
	offsetDistance: {
		originalName: 'offset-distance',
		readableName: 'Offset Distance',
		description: 'The property determines the position along the offset-path',
	},
	offsetPath: {
		originalName: 'offset-path',
		readableName: 'Offset Path',
		description: 'The property determines a movement path for an element to follow',
		allowedValues: [
			{
				value: 'path',
				description: 'The property specifies a path in the SVG coordinates syntax',
			},
			{
				value: 'none',
				description: 'The property specifies there will be no motion path at all',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	offsetPosition: {
		originalName: 'offset-position',
		readableName: 'Offset Position',
		description: 'The property determines the initial position of the offset path',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The property determines the initial position is the position of the box which is specified with position property',
			},
			{
				value: 'position',
				description:
					'The property determines the initial position, with the the containing block as the positioning area and a dimensionless point (zero-sized box) as the object area',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	offsetRotate: {
		originalName: 'offset-rotate',
		readableName: 'Offset Rotate',
		description: 'The property determines the orientation of an element',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The property defines the object will rotated by the angle of the direction of the offset path',
			},
			{
				value: 'reverse',
				description:
					'The property defines the object will rotated by the angle of the direction of the offset path along with 180 degrees',
			},
			{
				value: 'angle',
				description:
					'The property defines by the specified rotation angle, the box has a constant clockwise rotation transformation applied to it',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	opacity: {
		originalName: 'opacity',
		readableName: 'Opacity',
		description:
			'This property is uesd to set the transparency-level i.e the clarity level of the image for an element',
	},
	order: {
		originalName: 'order',
		readableName: 'Order',
		description:
			'This property is used to specify the order of a flexible item inside the flex or grid container',
	},
	orphans: {
		originalName: 'orphans',
		readableName: 'Orphans',
		description:
			'This property is the first line of a paragraph that appears alone at the bottom of a page and is used to specify the minimum number of lines of a block-level container that can be left at the bottom of a page or column',
		allowedValues: [
			{
				value: 'integer',
				description:
					'The property determines the number of lines that can be left at the end of a page or column. Negative values are invalid',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	outline: {
		originalName: 'outline',
		readableName: 'Outline',
		description:
			'This property is a line drawn around an element, outside of its border to make the element unique',
		allowedValues: [
			{
				value: 'outline-width',
				description:
					'This property is used to specify the width of the outline for an element',
			},
			{
				value: 'outline-style',
				description:
					'This property is used to specify the style of the outline for an element',
			},
			{
				value: 'outline-color',
				description:
					'This property is used to specify the color of the outline for an element',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	outlineColor: {
		originalName: 'outline-color',
		readableName: 'Outline Color',
		description: 'This property is used to specify the color of the outline for an element',
		allowedValues: [
			{
				value: 'invert',
				description:
					'Default vaule. The property helps to perform a color inversion. This ensures that the outline is visible, regardless of color background',
			},
			{
				value: 'color',
				description:
					'This property is used to specify the color of the outline for an element',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	outlineOffset: {
		originalName: 'outline-offset',
		readableName: 'Outline Offset',
		description:
			'The property is used to add space between an outline and border of an element',
	},
	outlineStyle: {
		originalName: 'outline-style',
		readableName: 'Outline Style',
		description: 'This property is used to specify the style of the outline for an element',
		allowedValues: [
			{
				value: 'none',
				description: 'Default value. There will be no outline value',
			},
			{
				value: 'hidden',
				description: 'The property specifies the hidden outline value',
			},
			{
				value: 'dotted',
				description: 'The property specifies the dotted outline value',
			},
			{
				value: 'dashed',
				description: 'The property specifies the dashed outline value',
			},
			{
				value: 'solid',
				description: 'The property specifies the solid outline value',
			},
			{
				value: 'double',
				description: 'The property specifies the double outline value',
			},
			{
				value: 'groove',
				description:
					'The property specifies a 3D groove outline value. The effect will depend on the outline-color value',
			},
			{
				value: 'ridge',
				description:
					'The property specifies a 3D ridge outline value. The effect will depend on the outline-color value',
			},
			{
				value: 'inset',
				description:
					'The property specifies a 3D inset outline value. The effect will depend on the outline-color value',
			},
			{
				value: 'outset',
				description:
					'The property specifies a 3D outset outline value. The effect will depend on the outline-color value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	outlineWidth: {
		originalName: 'outline-width',
		readableName: 'Outline Width',
		description: 'This property is used to specify the width of the outline for an element',
	},
	overflow: {
		originalName: 'overflow',
		readableName: 'Overflow',
		description:
			'When an element content is too big to fit in its block then overflow happens. This property defines what should happen if content overflows an element box',
		allowedValues: [
			{
				value: 'visible',
				description:
					'Default value. The content is not clipped and may be rendered outside the padding box',
			},
			{
				value: 'hidden',
				description:
					'The property defines the overflow is clipped, but rest of the content will be invisible',
			},
			{
				value: 'scroll',
				description:
					'The property defines the overflow is clipped, but a scroll-bar is added to see the rest of the content',
			},
			{
				value: 'auto',
				description:
					'The property specifies if the overflow is clipped, then the scroll-bar should be added to see the rest of the content',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	overflowAnchor: {
		originalName: 'overflow-anchor',
		readableName: 'Overflow Anchor',
		description:
			'The property provides a way to opt out of the browser scroll anchoring behavior, which adjusts scroll position to minimize content shifts. This property is enabled by default in any supported browser',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The property helps making an element an anchor by adjusting scroll anchoring position',
			},
			{
				value: 'none',
				description:
					'This property helps to make the content reflow by disables the scroll anchoring',
			},
		],
	},
	overflowBlock: {
		originalName: 'overflow-block',
		readableName: 'Overflow Block',
		description:
			'This property can be used to test how the output device handles content that overflows the initial containing block along the block axis',
		allowedValues: [
			{
				value: 'visible',
				description:
					'The property specifies the content is not clipped and may be rendered outside the block start and block end edges of padding box',
			},
			{
				value: 'hidden',
				description:
					'The property specifies the content is clipped if necessary to fit the block dimension in the padding box and there will be no scrollbars provided',
			},
			{
				value: 'scroll',
				description:
					'The property specifies the content is clipped if necessary to fit the block dimension in the padding box. Browsers display scrollbars whether or not any content is actually clipped',
			},
			{
				value: 'auto',
				description:
					'The property depends on the user agent. If content fits inside the padding box, it looks the same as visible, but still establishes a new block-formatting context. Desktop browsers provide scrollbars if content overflows',
			},
		],
	},
	overflowClipMargin: {
		originalName: 'overflow-clip-margin',
		readableName: 'Overflow Clip Margin',
		description:
			'This property determines how far outside its bounds an element is allowed to paint before being clipped',
	},
	overflowInline: {
		originalName: 'overflow-inline',
		readableName: 'Overflow Inline',
		description:
			'The property determines what shows when content overflows the inline start and end edges of a box',
		allowedValues: [
			{
				value: 'visible',
				description:
					'The property determines the content is not clipped and may be rendered outside the inline start and end edges of the padding box',
			},
			{
				value: 'hidden',
				description:
					'The property determines the content is clipped if necessary to fit the inline dimension in the padding box',
			},
			{
				value: 'scroll',
				description:
					'The property determines the content is clipped if necessary to fit in the padding box in the inline dimension',
			},
			{
				value: 'auto',
				description:
					'The browsers provide scrollbars if content overflows. Depends on the user agent. If content fits inside the padding box, it looks the same as visible, but still establishes a new block-formatting context',
			},
		],
	},
	overflowWrap: {
		originalName: 'overflow-wrap',
		readableName: 'Overflow Wrap',
		description:
			'This property applies to inline elements and helps to avoid an unusually long string of text causing layout problems due to overflow',
		allowedValues: [
			{
				value: 'normal',
				description:
					'The property specifies the lines may only break at normal word break points',
			},
			{
				value: 'anywhere',
				description:
					'The property determines to prevent overflow, an otherwise unbreakable string of characters — like a long word or URL — may be broken at any point if there are no otherwise-acceptable break points in the line',
			},
			{
				value: 'break-word',
				description:
					'The property specifies the normally unbreakable words allowed to be broken at arbitrary points if there are no otherwise acceptable break points in the line',
			},
		],
	},
	overflowX: {
		originalName: 'overflow-x',
		readableName: 'Overflow X',
		description:
			'The property defines what to do when content overflows the content box horizontally(i.e, left and right), such as displaying the content outside of the content box or displaying a horizontal scroll bar',
		allowedValues: [
			{
				value: 'visible',
				description:
					'Default value. The property defines the content is not clipped, and it may be displayed outside of the content box',
			},
			{
				value: 'hidden',
				description:
					'The property defines the content is clipped and there will be no scrolling mechanism provided',
			},
			{
				value: 'scroll',
				description:
					'The property defines the content is clipped and there will be scrolling mechanism provided',
			},
			{
				value: 'auto',
				description:
					'The property should cause a scrolling mechanism to be provided for overflowing boxes',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	overflowY: {
		originalName: 'overflow-y',
		readableName: 'Overflow Y',
		description:
			'The property defines what to do when content overflows the content box vertically(i.e, top and bottom), such as displaying the content outside of the content box or displaying a vertical scroll bar',
		allowedValues: [
			{
				value: 'visible',
				description:
					'Default value. The property defines the content is not clipped, and it may be displayed outside of the content box',
			},
			{
				value: 'hidden',
				description:
					'The property defines the content is clipped and there will be no scrolling mechanism provided',
			},
			{
				value: 'scroll',
				description:
					'The property defines the content is clipped and there will be scrolling mechanism provided',
			},
			{
				value: 'auto',
				description:
					'The property should cause a scrolling mechanism to be provided for overflowing boxes',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	overscrollBehavior: {
		originalName: 'overscroll-behavior',
		readableName: 'Overscroll Behavior',
		description:
			'This property specifies what a browser does when reaching the boundary of a scrolling area',
		allowedValues: [
			{
				value: 'auto',
				description: 'The normal default scroll overflow behavior will occur',
			},
			{
				value: 'contain',
				description:
					'The default scroll overflow behavior is observed inside the element but neighboring scrolling will not occur',
			},
			{
				value: 'none',
				description:
					'The default scroll overflow behavior is prevented and there will be no scroll chaining occurs to neighboring scrolling areas',
			},
		],
	},
	overscrollBehaviorBlock: {
		originalName: 'overscroll-behavior-block',
		readableName: 'Overscroll Behavior Block',
		description:
			'This property specifies the behavior of browser when the block direction boundary of a scrolling area is reached',
		allowedValues: [
			{
				value: 'auto',
				description: 'The normal default scroll overflow behavior will occur',
			},
			{
				value: 'contain',
				description:
					'The default scroll overflow behavior is observed inside the element but neighboring scrolling will not occur',
			},
			{
				value: 'none',
				description:
					'The default scroll overflow behavior is prevented and there will be no scroll chaining occurs to neighboring scrolling areas',
			},
		],
	},
	overscrollBehaviorInline: {
		originalName: 'overscroll-behavior-inline',
		readableName: 'Overscroll Behavior Inline',
		description:
			'This property specifies the behavior of browser when the inline direction boundary of a scrolling area is reached',
		allowedValues: [
			{
				value: 'auto',
				description: 'The normal default scroll overflow behavior will occur',
			},
			{
				value: 'contain',
				description:
					'The default scroll overflow behavior is observed inside the element but neighboring scrolling will not occur',
			},
			{
				value: 'none',
				description:
					'The default scroll overflow behavior is prevented and there will be no scroll chaining occurs to neighboring scrolling areas',
			},
		],
	},
	overscrollBehaviorX: {
		originalName: 'overscroll-behavior-x',
		readableName: 'Overscroll Behavior X',
		description:
			' This property specifies the behavior of browser when the horizontal boundary of a scrolling area is reached',
		allowedValues: [
			{
				value: 'auto',
				description: 'The normal default scroll overflow behavior will occur',
			},
			{
				value: 'contain',
				description:
					'The default scroll overflow behavior is observed inside the element but neighboring scrolling will not occur',
			},
			{
				value: 'none',
				description:
					'The default scroll overflow behavior is prevented and there will be no scroll chaining occurs to neighboring scrolling areas',
			},
		],
	},
	overscrollBehaviorY: {
		originalName: 'overscroll-behavior-y',
		readableName: 'Overscroll Behavior Y',
		description:
			' This property specifies the behavior of browser when the vertical boundary of a scrolling area is reached',
		allowedValues: [
			{
				value: 'auto',
				description: 'The normal default scroll overflow behavior will occur',
			},
			{
				value: 'contain',
				description:
					'The default scroll overflow behavior is observed inside the element but neighboring scrolling will not occur',
			},
			{
				value: 'none',
				description:
					'The default scroll overflow behavior is prevented and there will be no scroll chaining occurs to neighboring scrolling areas',
			},
		],
	},
	padding: {
		originalName: 'padding',
		readableName: 'Padding',
		description:
			'This property clears the area inside the border of the element and introduces extra space between the boundary and the content of the element',
	},
	paddingBlock: {
		originalName: 'padding-block',
		readableName: 'Padding Block',
		description:
			'The property determines the logical block start and end padding of an element, which maps to physical padding properties depending on the writing mode, directionality, and text orientation of an element',
	},
	paddingBlockEnd: {
		originalName: 'padding-block-end',
		readableName: 'Padding Block End',
		description:
			'This property defines the space at the end of content inside a block. The selection of start side depends on the writing-mode',
	},
	paddingBlockStart: {
		originalName: 'padding-block-start',
		readableName: 'Padding Block Start',
		description: 'The property defines the space at the start of content area inside a box',
	},
	paddingBottom: {
		originalName: 'padding-bottom',
		readableName: 'Padding Bottom',
		description:
			'The property determines the space between the bottom sides of content and the border areas',
	},
	paddingInline: {
		originalName: 'padding-inline',
		readableName: 'Padding Inline',
		description:
			'The property determines the space at the start and end sides of the content in the boundaries of a box',
	},
	paddingInlineEnd: {
		originalName: 'padding-inline-end',
		readableName: 'Padding Inline End',
		description: 'The property determines the space at the end side of a content inside a box',
	},
	paddingInlineStart: {
		originalName: 'padding-inline-start',
		readableName: 'Padding Inline Start',
		description:
			'The property determines the space at the start side of a content inside a box',
	},
	paddingLeft: {
		originalName: 'padding-left',
		readableName: 'Padding Left',
		description:
			'The property determines the space between the left sides of content and the border areas',
	},
	paddingRight: {
		originalName: 'padding-right',
		readableName: 'Padding Right',
		description:
			'The property determines the space between the right sides of content and the border areas',
	},
	paddingTop: {
		originalName: 'padding-top',
		readableName: 'Padding Top',
		description:
			'The property determines the space between the top sides of content and the border areas',
	},
	page: {
		originalName: 'page',
		readableName: 'Page',
		description:
			'The property accepts either a <custom-ident> or the auto keyword as its value and is used with paged media to specify a particular type of page on which an element must be displayed',
		allowedValues: [
			{
				value: 'auto',
				description:
					'This property will ensure that its used value is the value specified on its nearest ancestor with a non-auto value',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
			{
				value: 'unset',
				description:
					'The property helps to set all properties to their parent value if they are inheritable or to their initial value if not inheritable',
			},
		],
	},
	pageBreakAfter: {
		originalName: 'page-break-after',
		readableName: 'Page Break After',
		description: 'The property helps to adds a page-break after a specified element',
		allowedValues: [
			{
				value: 'auto',
				description: 'Default value. The page-break will be automatic',
			},
			{
				value: 'always',
				description: 'The property helps to always insert a page-break after the element',
			},
			{
				value: 'avoid',
				description: 'The property is used to avoid a page-break after the element',
			},
			{
				value: 'left',
				description:
					'The property is used to insert the page-break after the element so that the next page is formatted as a left page',
			},
			{
				value: 'right',
				description:
					'The property is used to insert the page-break after the element so that the next page is formatted as a right page',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	pageBreakBefore: {
		originalName: 'page-break-before',
		readableName: 'Page Break Before',
		description: 'The property helps to adds a page-break before a specified element',
		allowedValues: [
			{
				value: 'auto',
				description: 'Default value. The page-break will be automatic',
			},
			{
				value: 'always',
				description: 'The property helps to always insert a page-break after the element',
			},
			{
				value: 'avoid',
				description: 'The property is used to avoid a page-break after the element',
			},
			{
				value: 'left',
				description:
					'The property is used to insert the page-break after the element so that the next page is formatted as a left page',
			},
			{
				value: 'right',
				description:
					'The property is used to insert the page-break after the element so that the next page is formatted as a right page',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	pageBreakInside: {
		originalName: 'page-break-inside',
		readableName: 'Page Break Inside',
		description:
			'This property is used to determine whether a page-break should be avoided inside a specified element',
		allowedValues: [
			{
				value: 'auto',
				description: 'Default value. The page-break will be automatic',
			},
			{
				value: 'avoid',
				description: 'The property is used to avoid a page-break after the element',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	pageOrientation: {
		originalName: 'page-orientation',
		readableName: 'Page Orientation',
		description: '',
		allowedValues: [
			{
				value: '',
				description: '',
			},
			{
				value: '',
				description: '',
			},
			{
				value: '',
				description: '',
			},
		],
	},
	pause: {
		originalName: 'pause',
		readableName: 'Pause',
		description: 'This property determines the pause time before and after the element',
		allowedValues: [
			{
				value: 'pause-after',
				description:
					'This property helps the pause the time after the element. The value for pause-after property in numbers like 10ms',
			},
			{
				value: 'pause-before',
				description:
					'This property helps the pause the time before the element. The value for pause-before property in numbers like 10ms',
			},
		],
	},
	pauseAfter: {
		originalName: 'pause-after',
		readableName: 'Pause After',
		description:
			'This property helps the pause the time after the element. The value for pause-after property in numbers like 10ms',
	},
	pauseBefore: {
		originalName: 'pause-before',
		readableName: 'Pause Before',
		description:
			'This property helps the pause the time before the element. The value for pause-before property in numbers like 10ms',
	},
	perspective: {
		originalName: 'perspective',
		readableName: 'Perspective',
		description:
			'The property specifies to esatablishes a new stacking context and allows the 3-D transformation of children elements',
	},
	perspectiveOrigin: {
		originalName: 'perspective-origin',
		readableName: 'Perspective Origin',
		description:
			'The property specifies the origin of perspective property. This point is located with respect to top and left edges of the element where a user seems to be looking at the transformation of children elements',
		allowedValues: [
			{
				value: 'x-axis',
				description:
					'This property is used to define where the view is placed at the x-axis',
			},
			{
				value: 'y-axis',
				description:
					'This property is used to define where the view is placed at the y-axis',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	pitch: {
		originalName: 'pitch',
		readableName: 'Pitch',
		description:
			'This property is used in aural media (audio) to set the frequency of the voice which specify the average pitch the speaking voice should have',
		allowedValues: [
			{
				value: 'frequency',
				description:
					'The property helps to hold the value for the frequency, possible values are x-high, high, medium, low, x-low',
			},
		],
	},
	pitchRange: {
		originalName: 'pitch-range',
		readableName: 'Pitch Range',
		description:
			'This property is used to determine a change in the pitch range of a voice i.e, the frequency range of the voice',
	},
	placeContent: {
		originalName: 'place-content',
		readableName: 'Place Content',
		description: 'The property helps to aligns the content horizontally and vertically',
		allowedValues: [
			{
				value: 'start',
				description:
					'This property is used to align flex items from the start of the container',
			},
			{
				value: 'end',
				description:
					'This property is used to align flex items from the end of the container',
			},
			{
				value: 'flex-start',
				description: 'This property displays the lines at the start of the flex container',
			},
			{
				value: 'flex-end',
				description: 'This property displays the lines at the end of the flex container',
			},
			{
				value: 'center',
				description: 'This property aligns flex items at the center of the container',
			},
			{
				value: 'space-around',
				description: 'This property distribute space equally around the flex lines',
			},
			{
				value: 'space-between',
				description:
					'This property distribute flex lines space with equal space between them',
			},
			{
				value: 'space-evenly',
				description:
					'This property defines the position with equal spacing between them but the spacing from corners differs',
			},
			{
				value: 'stretch',
				description:
					'Default value. This property defines the line stretched to take the remaining space of the flex container',
			},
		],
	},
	placeItems: {
		originalName: 'place-items',
		readableName: 'Place Items',
		description:
			'The property helps to control the alignment of the child items vertically and horizontally',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The property is used if the items have no parent and is used to defines the absolute positioned',
			},
			{
				value: 'normal',
				description: 'This property represents the "default" alignment for the layout mode',
			},
			{
				value: 'start',
				description:
					'This property is used to align flex items from the start of the container',
			},
			{
				value: 'end',
				description:
					'This property is used to align flex items from the end of the container',
			},
			{
				value: 'flex-start',
				description: 'This property displays the lines at the start of the flex container',
			},
			{
				value: 'flex-end',
				description: 'This property displays the lines at the end of the flex container',
			},
			{
				value: 'center',
				description: 'This property aligns flex items at the center of the container',
			},
			{
				value: 'space-around',
				description: 'This property distribute space equally around the flex lines',
			},
			{
				value: 'space-between',
				description:
					'This property distribute flex lines space with equal space between them',
			},
			{
				value: 'space-evenly',
				description:
					'This property defines the position with equal spacing between them but the spacing from corners differs',
			},
			{
				value: 'stretch',
				description:
					'Default value. This property defines the line stretched to take the remaining space of the flex container',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	placeSelf: {
		originalName: 'place-self',
		readableName: 'Place Self',
		description: 'The property helps to places an element horizontally and vertically',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The property is used if the items have no parent and then this value computes to absolute position of the item',
			},
			{
				value: 'normal',
				description: 'This property represents the "default" alignment for the layout mode',
			},
			{
				value: 'start',
				description:
					'This property is used to align flex items from the start of the container',
			},
			{
				value: 'end',
				description:
					'This property is used to align flex items from the end of the container',
			},
			{
				value: 'flex-start',
				description: 'This property displays the lines at the start of the flex container',
			},
			{
				value: 'flex-end',
				description: 'This property displays the lines at the end of the flex container',
			},
			{
				value: 'center',
				description: 'This property aligns flex items at the center of the container',
			},
			{
				value: 'space-around',
				description: 'This property distribute space equally around the flex lines',
			},
			{
				value: 'space-between',
				description:
					'This property distribute flex lines space with equal space between them',
			},
			{
				value: 'space-evenly',
				description:
					'This property defines the position with equal spacing between them but the spacing from corners differs',
			},
			{
				value: 'stretch',
				description:
					'Default value. This property defines the line stretched to take the remaining space of the flex container',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	playDuring: {
		originalName: 'play-during',
		readableName: 'Play During',
		description:
			'The property is used in audio devices to specify a sound to be played in the background and can manipulate the playing audio',
		allowedValues: [
			{
				value: 'url',
				description:
					'This property value holds the source for the audio tune which will be used as a background tune',
			},
			{
				value: 'mix',
				description:
					'This property value holds the background sound of the element that to be played',
			},
			{
				value: 'repeat',
				description:
					'This property value holds the background sound to be repeated if it finishes before the element is fully rendered',
			},
			{
				value: 'auto',
				description:
					'This property value describe the sound being played for any ancestor element',
			},
			{
				value: 'none',
				description:
					'This property value describe the complete background silence during the rendering of the element',
			},
		],
	},
	pointerEvents: {
		originalName: 'pointer-events',
		readableName: 'Pointer Events',
		description: 'This property defines whether or not an element reacts to pointer events',
		allowedValues: [
			{
				value: 'auto',
				description:
					'Default value. This property defines the element which reacts to pointer events, like :hover and click',
			},
			{
				value: 'none',
				description: 'There will be no event will reacts to the pointer events',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	position: {
		originalName: 'position',
		readableName: 'Position',
		description:
			'The property specifies the position of an element i.e. the position of an element should be either relative to its original position or with respect to parent box',
		allowedValues: [
			{
				value: 'static',
				description:
					'Default value. This property helps to always positions an element according to the normal flow of the page',
			},
			{
				value: 'absolute',
				description:
					'This property is used to position an element relative to the first parent element that has a position other than static',
			},
			{
				value: 'fixed',
				description:
					'The property helps to put the text fixed on the browser. This fixed test is positioned relative to the browser window, and does not move even you scroll the window',
			},
			{
				value: 'relative',
				description:
					'This property is used to set the element relative to its normal position',
			},
			{
				value: 'sticky',
				description:
					'The property defines based on the scroll position of user, the elements are positioned',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	quotes: {
		originalName: 'quotes',
		readableName: 'Quotes',
		description: 'The property helps to set the type of quotation marks for quotations',
		allowedValues: [
			{
				value: 'none',
				description:
					'The "open-quote" and "close-quote" values of the "content" property will not produce any quotation marks',
			},
			{
				value: 'string string string string',
				description:
					'The property determines which quotation marks to use and first two values specifies the first level of quotation embedding, the next two values specifies the next level of quote embedding, etc',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	resize: {
		originalName: 'resize',
		readableName: 'Resize',
		description:
			'This property allows you to specify whether or not an element is resizable by the user, and if so, along which direction',
		allowedValues: [
			{
				value: 'none',
				description:
					'The element is not resizable. The user agent does not present a resizing mechanism on the element, and the user is given no direct manipulation mechanism to resize the element',
			},
			{
				value: 'both',
				description:
					'The element is resizable in both directions (horizontal and vertical). The user agent presents a bidirectional resizing mechanism to allow the user to adjust both the height and the width of the elementThe element is resizable in both directions (horizontal and vertical). The user agent presents a bidirectional resizing mechanism to allow the user to adjust both the height and the width of the element',
			},
			{
				value: 'horizontal',
				description:
					'The element can be resized horizontally. The user agent presents a unidirectional horizontal resizing mechanism to allow the user to adjust only the width of the element',
			},
			{
				value: 'vertical',
				description:
					'The element can be resized vertically. The user agent presents a unidirectional vertical resizing mechanism to allow the user to adjust only the height of the element',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	rest: {
		originalName: 'rest',
		readableName: 'Rest',
		description:
			'This property allow you to define a prosodic boundary before and after a given element when working with speech media',
		allowedValues: [
			{
				value: 'rest-before',
				description:
					'This property allow you to define a prosodic boundary before a given element when working with speech media',
			},
			{
				value: 'rest-after',
				description:
					'This property allow you to define a prosodic boundary after a given element when working with speech media',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
			{
				value: 'unset',
				description:
					'The property determines all properties to their parent value if they are inheritable or to their initial value if not inheritable',
			},
		],
	},
	restAfter: {
		originalName: 'rest-after',
		readableName: 'Rest After',
		description:
			'This property allow you to define a prosodic boundary after a given element when working with speech media',
	},
	restBefore: {
		originalName: 'rest-before',
		readableName: 'Rest Before',
		description:
			'This property allow you to define a prosodic boundary before a given element when working with speech media',
	},
	richness: {
		originalName: 'richness',
		readableName: 'Richness',
		description:
			'This property specifies the richness, or brightness, of the speaking voice. Higher values of richness/brightness have rougher waveforms and tend to carry better than lower richness values with smoother waveforms',
	},
	right: {
		originalName: 'right',
		readableName: 'Right',
		description:
			'This property specifies the right offset for the horizontal positioned elements and does not affect the non-positioned elements. It is one of the four offset properties that are left, top, and bottom',
	},
	rotate: {
		originalName: 'rotate',
		readableName: 'Rotate',
		description:
			'This property used to allows the specify rotation transforms individually and independently of the transform property and also saves having to remember the exact order of transform functions',
	},
	rowGap: {
		originalName: 'row-gap',
		readableName: 'Row Gap',
		description:
			'This property used to set the size of the gap (gutter) between the grid rows of an element',
	},
	scale: {
		originalName: 'scale',
		readableName: 'Scale',
		description:
			'The scale() CSS function defines a transformation that resizes an element on the 2D plane. Because the amount of scaling is defined by a vector, it can resize the horizontal and vertical dimensions at different scales',
		allowedValues: [
			{
				value: 'sx',
				description: "It's number representing the abscissa of the scaling vector",
			},
			{
				value: 'sy',
				description:
					"It's number representing the ordinate of the scaling vector If not defined, its default value is sx, resulting in a uniform scaling that preserves the element's aspect ratio",
			},
		],
	},
	scrollBehavior: {
		originalName: 'scroll-behavior',
		readableName: 'Scroll Behavior',
		description:
			'The scroll-behavior property specifies whether to smoothly animate the scroll position, instead of a straight jump, when the user clicks on a link within a scrollable box',
		allowedValues: [
			{
				value: 'auto',
				description:
					'Default value. This property allows a straight jump scroll effect between elements within the scrolling box',
			},
			{
				value: 'smooth',
				description:
					'This property allows a smooth animated scroll effect between elements within the scrolling box',
			},
			{
				value: 'initial',
				description: 'Sets this property to its default value',
			},
			{
				value: 'inherit',
				description: 'Inherits this property from its parent element',
			},
		],
	},
	scrollMargin: {
		originalName: 'scroll-margin',
		readableName: 'Scroll Margin',
		description:
			'The scroll-margin shorthand property sets all of the scroll margins of an element at once, assigning values much like the margin property does for margins of an element.',
	},
	scrollMarginBlock: {
		originalName: 'scroll-margin-block',
		readableName: 'Scroll Margin Block',
		description:
			'This property is used to set all the scroll margins to the start and end of a scroll element at once',
	},
	scrollMarginBlockEnd: {
		originalName: 'scroll-margin-block-end',
		readableName: 'Scroll Margin Block End',
		description:
			'This property is used to set all the scroll margins to the end side of a scroll element at once',
	},
	scrollMarginBlockStart: {
		originalName: 'scroll-margin-block-start',
		readableName: 'Scroll Margin Block Start',
		description:
			'This property is used to set all the scroll margins to the start side of a scroll element at once',
	},
	scrollMarginBottom: {
		originalName: 'scroll-margin-bottom',
		readableName: 'Scroll Margin Bottom',
		description:
			'This property is used to set all the scroll margins to the bottom of an element at once',
	},
	scrollMarginInline: {
		originalName: 'scroll-margin-inline',
		readableName: 'Scroll Margin Inline',
		description:
			'This property helps to set the scroll margins of an element in the inline dimension',
	},
	scrollMarginInlineEnd: {
		originalName: 'scroll-margin-inline-end',
		readableName: 'Scroll Margin Inline End',
		description:
			'The property defines the margin of the scroll snap area at the end of the inline dimension that is used for snapping this box to the snapport',
	},
	scrollMarginInlineStart: {
		originalName: 'scroll-margin-inline-start',
		readableName: 'Scroll Margin Inline Start',
		description:
			'The property is used to set all the scroll margins to the start of the inline dimension of a scroll element at once',
	},
	scrollMarginLeft: {
		originalName: 'scroll-margin-left',
		readableName: 'Scroll Margin Left',
		description:
			'This property is used to set all scroll margins to the left of an element at once',
	},
	scrollMarginRight: {
		originalName: 'scroll-margin-right',
		readableName: 'Scroll Margin Right',
		description:
			'This property is used to set all scroll margins to the right of an element at once',
	},
	scrollMarginTop: {
		originalName: 'scroll-margin-top',
		readableName: 'Scroll Margin Top',
		description:
			'This property is used to set all scroll margins to the top of an element at once',
	},
	scrollPadding: {
		originalName: 'scroll-padding',
		readableName: 'Scroll Padding',
		description:
			'This property is used to set scroll padding on all sides of an element at once, much like the padding property does for padding on an element',
		allowedValues: [
			{
				value: 'length-percentage',
				description:
					'This property works same as other padding property contains the length in any specific unit for padding',
			},
			{
				value: 'auto',
				description:
					'This property helps to leaves some spaces for padding determined by browsers',
			},
		],
	},
	scrollPaddingBlock: {
		originalName: 'scroll-padding-block',
		readableName: 'Scroll Padding Block',
		description: 'This property sets the scroll padding of an element in the block dimension',
		allowedValues: [
			{
				value: 'length_values',
				description:
					'The property specifies the values defined with length units exp: px, em, vh, etc.',
			},
			{
				value: 'keyword_values',
				description:
					'This property refers to the keyword_values defined with units like auto',
			},
			{
				value: 'Global_Values',
				description:
					'The property refers to the global values like inherit, initial, unset, etc.',
			},
		],
	},
	scrollPaddingBlockEnd: {
		originalName: 'scroll-padding-block-end',
		readableName: 'Scroll Padding Block End',
		description:
			'This property helps to set all the scroll padding to the end of a scroll container in the block dimension at once',
		allowedValues: [
			{
				value: 'length_values',
				description:
					'The property specifies the values defined with length units exp: px, em, vh, etc.',
			},
			{
				value: 'keyword_values',
				description:
					'This property refers to the keyword_values defined with units like auto',
			},
			{
				value: 'Global_Values',
				description:
					'The property refers to the global values like inherit, initial, unset, etc.',
			},
		],
	},
	scrollPaddingBlockStart: {
		originalName: 'scroll-padding-block-start',
		readableName: 'Scroll Padding Block Start',
		description:
			'This property helps to set all the scroll padding to the end of a scroll container in the block dimension at once',
		allowedValues: [
			{
				value: 'length_values',
				description:
					'The property specifies the values defined with length units exp: px, em, vh, etc.',
			},
			{
				value: 'keyword_values',
				description:
					'This property refers to the keyword_values defined with units like auto',
			},
			{
				value: 'Global_Values',
				description:
					'The property refers to the global values like inherit, initial, unset, etc.',
			},
		],
	},
	scrollPaddingBottom: {
		originalName: 'scroll-padding-bottom',
		readableName: 'Scroll Padding Bottom',
		description:
			'The property defines offsets for the bottom of the optimal viewing region of the scrollport: the region used as the target region for placing things in view of the user',
		allowedValues: [
			{
				value: 'length-percentage',
				description:
					'This property works same as other padding property contains the length in any specific unit for padding',
			},
			{
				value: 'auto',
				description:
					'This property helps to leaves some spaces for padding determined by browsers',
			},
		],
	},
	scrollPaddingInline: {
		originalName: 'scroll-padding-inline',
		readableName: 'Scroll Padding Inline',
		description:
			'The property sets the scroll padding to the start and end of a scroll element in the inline dimension',
		allowedValues: [
			{
				value: 'length_values',
				description:
					'The property specifies the values defined with length units exp: px, em, vh, etc.',
			},
			{
				value: 'keyword_values',
				description:
					'This property refers to the keyword_values defined with units like auto',
			},
			{
				value: 'Global_Values',
				description:
					'The property refers to the global values like inherit, initial, unset, etc.',
			},
		],
	},
	scrollPaddingInlineEnd: {
		originalName: 'scroll-padding-inline-end',
		readableName: 'Scroll Padding Inline End',
		description:
			'The property sets the scroll padding to the end edge of a scroll element in the inline dimension',
		allowedValues: [
			{
				value: 'length_values',
				description:
					'The property specifies the values defined with length units exp: px, em, vh, etc.',
			},
			{
				value: 'keyword_values',
				description:
					'This property refers to the keyword_values defined with units like auto',
			},
			{
				value: 'Global_Values',
				description:
					'The property refers to the global values like inherit, initial, unset, etc.',
			},
		],
	},
	scrollPaddingInlineStart: {
		originalName: 'scroll-padding-inline-start',
		readableName: 'Scroll Padding Inline Start',
		description:
			'The property sets the scroll padding to the start edge of a scroll element in the inline dimension',
		allowedValues: [
			{
				value: 'length_values',
				description:
					'The property specifies the values defined with length units exp: px, em, vh, etc.',
			},
			{
				value: 'keyword_values',
				description:
					'This property refers to the keyword_values defined with units like auto',
			},
			{
				value: 'Global_Values',
				description:
					'The property refers to the global values like inherit, initial, unset, etc.',
			},
		],
	},
	scrollPaddingLeft: {
		originalName: 'scroll-padding-left',
		readableName: 'Scroll Padding Left',
		description:
			'This property is used to set all the padding to the left of an scroll container',
		allowedValues: [
			{
				value: 'length_values',
				description:
					'The property specifies the values defined with length units exp: px, em, vh, etc.',
			},
			{
				value: 'keyword_values',
				description:
					'This property refers to the keyword_values defined with units like auto',
			},
			{
				value: 'Global_Values',
				description:
					'The property refers to the global values like inherit, initial, unset, etc.',
			},
		],
	},
	scrollPaddingRight: {
		originalName: 'scroll-padding-right',
		readableName: 'Scroll Padding Right',
		description:
			'This property is used to set all the padding to the right of an scroll container',
		allowedValues: [
			{
				value: 'length_values',
				description:
					'The property specifies the values defined with length units exp: px, em, vh, etc.',
			},
			{
				value: 'keyword_values',
				description:
					'This property refers to the keyword_values defined with units like auto',
			},
			{
				value: 'Global_Values',
				description:
					'The property refers to the global values like inherit, initial, unset, etc.',
			},
		],
	},
	scrollPaddingTop: {
		originalName: 'scroll-padding-top',
		readableName: 'Scroll Padding Top',
		description:
			'This property acts as a magnet on the top of the sliding element that stick to the top of the view-port and stop the scrolling(forcefully) in that place',
		allowedValues: [
			{
				value: 'length-percentage',
				description:
					'This property works same as other padding property contains the length in any specific unit for padding',
			},
			{
				value: 'auto',
				description:
					'This property helps to leaves some spaces for padding determined by browsers',
			},
		],
	},
	scrollSnapAlign: {
		originalName: 'scroll-snap-align',
		readableName: 'Scroll Snap Align',
		description:
			'The scroll-snap-align property specifies the box’s snap position as an alignment of its snap area (as the alignment subject) within its snap container’s snapport (as the alignment container)',
		allowedValues: [
			{
				value: 'keyword_values',
				description:
					'This property refers to the keyword_values defined with units like auto',
			},
			{
				value: 'Global_Values',
				description:
					'The property refers to the global values like inherit, initial, unset, etc.',
			},
		],
	},
	scrollSnapStop: {
		originalName: 'scroll-snap-stop',
		readableName: 'Scroll Snap Stop',
		description:
			'The scroll-snap-stop CSS property defines whether the scroll container is allowed to "pass over" possible snap positions',
		allowedValues: [
			{
				value: 'normal',
				description:
					'Default value. This browser helps the browsers to pass through the snapping position does not stop any specific position',
			},
			{
				value: 'always',
				description: 'This property enable the stop at snapping position',
			},
		],
	},
	scrollSnapType: {
		originalName: 'scroll-snap-type',
		readableName: 'Scroll Snap Type',
		description:
			'This property is useful to stop scrolling at some specific point of the page and its an inbuilt property in the Scroll Snap module. Without the Scroll Snap module, the image gallery will look ridiculous',
		allowedValues: [
			{
				value: 'none',
				description:
					'This property disable the scroll snapping that will ignore the snapping points',
			},
			{
				value: 'x',
				description:
					'This property enables the scroll snapping along with the x-axis that works on snap position of horizontal axis',
			},
			{
				value: 'y',
				description:
					'This property enables the scroll snapping along with the y-axis that works on snap position of vertical axis',
			},
			{
				value: 'block',
				description:
					'This property enables the scroll snapping along with the block-axis that works on snap position of block axis',
			},
			{
				value: 'inline',
				description:
					'This property enables the scroll snapping along with the inline-axis that works on snap position of inline axis',
			},
			{
				value: 'both',
				description:
					'This property enables the scroll snapping with the both-axis included x, y, block and inline axis',
			},
			{
				value: 'mandatory',
				description:
					'This property enables specific strict value that go to the specific scroll position when there is no scrolling',
			},
			{
				value: 'proximity',
				description:
					'This property enables specific strict value that go to the specific scroll position',
			},
		],
	},
	scrollbarColor: {
		editorType: 'color',
		originalName: 'scrollbar-color',
		readableName: 'Scrollbar Color',
		description: 'The property sets the color of the scrollbar track and thumb',
		allowedValues: [
			{
				value: 'auto',
				description: 'The browser is used to set the scrollbar color automatically',
			},
		],
	},
	scrollbarGutter: {
		originalName: 'scrollbar-gutter',
		readableName: 'Scrollbar Gutter',
		description:
			'The scrollbar-gutter CSS property allows authors to reserve space for the scrollbar, preventing unwanted layout changes as the content grows while also avoiding unnecessary visuals when scrolling is not needed.',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The initial value. Classic scrollbars create a gutter when overflow is scroll, or when overflow is auto and the box is overflowing.',
			},
			{
				value: 'stable',
				description:
					'When using classic scrollbars, the gutter will be present if overflow is auto, scroll, or hidden even if the box is not overflowing When using overlay scrollbars, the gutter will not be present',
			},
			{
				value: 'both-edges',
				description:
					'If a gutter would be present on one of the inline start/end edges of the box, another will be present on the opposite edge as well',
			},
			{
				value: 'initial',
				description: 'Sets this property to its default value',
			},
			{
				value: 'inherit',
				description: 'Inherits this property from its parent element',
			},
			{
				value: 'revert',
				description:
					'The revert CSS keyword reverts the cascaded value of the property from its current value to the value the property would have had if no changes had been made by the current style origin to the current element',
			},
			{
				value: 'unset',
				description: 'There will be no changes',
			},
		],
	},
	scrollbarWidth: {
		originalName: 'scrollbar-width',
		readableName: 'Scrollbar Width',
		description:
			'The scrollbar-width property allows the author to set the maximum thickness of an element’s scrollbars when they are shown',
		allowedValues: [
			{
				value: 'auto',
				description: 'The default scrollbar width for the platform',
			},
			{
				value: 'thin',
				description:
					'A thin scrollbar width variant on platforms that provide that option, or a thinner scrollbar than the default platform scrollbar width.',
			},
			{
				value: 'none',
				description: 'No scrollbar shown, however the element will still be scrollable',
			},
		],
	},
	shapeImageThreshold: {
		originalName: 'shape-image-threshold',
		readableName: 'Shape Image Threshold',
		description:
			'The property sets the alpha channel threshold used to extract the shape using an image as the value for shape-outside.',
		allowedValues: [
			{
				value: 'alpha-value',
				description: 'This property is used to set the threshold for extracting the shape',
			},
		],
	},
	shapeInside: {
		originalName: 'shape-inside',
		readableName: 'Shape Inside',
		description: 'The property will define a shape to wrap content within the element',
	},
	shapeMargin: {
		originalName: 'shape-margin',
		readableName: 'Shape Margin',
		description: 'The property sets a margin for a CSS shape created using shape-outside',
	},
	shapeOutside: {
		originalName: 'shape-outside',
		readableName: 'Shape Outside',
		description:
			'The property defines a shape which may be non-rectangular around which adjacent inline content should wrap.',
		allowedValues: [
			{
				value: 'basic-shape',
				description:
					'The property is used to define the shape that should be used to calculate the float area',
			},
		],
	},
	shapePadding: {
		originalName: 'shape-padding',
		readableName: 'Shape Padding',
		description:
			'The property is used to define the shape that the adjacent inline content may wrap around.',
		allowedValues: [
			{
				value: 'circle()',
				description: 'It is used to make circular shapes.',
			},
			{
				value: 'ellipse()',
				description: 'It is used to make elliptical shapes.',
			},
			{
				value: 'inset()',
				description: 'It is used to make rectangular shapes.',
			},
			{
				value: 'polygon()',
				description: 'It is used to make shapes that have more than 3 vertices.',
			},
			{
				value: 'path()',
				description: 'It is used to create shapes which have lines, arcs or curves.',
			},
		],
	},
	size: {
		originalName: 'size',
		readableName: 'Size',
		description:
			'The property defines the size and orientation of the box which is used to represent a page',
	},
	spatialNavigationAction: {
		originalName: 'spatial-navigation-action',
		readableName: 'Spatial Navigation Action',
		description:
			'The property defines the ability to navigate between focusable elements based on their position within a structured document',
	},
	spatialNavigationContain: {
		originalName: 'spatial-navigation-contain',
		readableName: 'Spatial Navigation Contain',
		description: '',
		allowedValues: [],
	},
	spatialNavigationFunction: {
		originalName: 'spatial-navigation-function',
		readableName: 'Spatial Navigation Function',
		description:
			'This property allows the author to indicate which navigation algorithm is reasonable for spatial navigation behavior',
		allowedValues: [
			{
				value: 'normal',
				description:
					'This property helps to moves the focus with the default focus navigation algorithm defined by UA',
			},
			{
				value: 'grid',
				description:
					'This property helps to moves the focus to the element which is aligned most in the navigation direction',
			},
		],
	},
	speak: {
		originalName: 'speak',
		readableName: 'Speak',
		description:
			'The property specifying if a browser should speak the content it reads, such as through a screen reader',
		allowedValues: [
			{
				value: 'auto',
				description:
					'As long as the element is not display: block and is visibility: visible, text will be read aurally.',
			},
			{
				value: 'never',
				description: 'The property specifies text will not be read aurally',
			},
			{
				value: 'always',
				description:
					'The property specifies text will be read aurally, regardless of display value or ancestor values of speak.',
			},
		],
	},
	speakHeader: {
		originalName: 'speak-header',
		readableName: 'Speak Header',
		description:
			'This property is used in aural media to specify whether table headers are spoken before each cell, or only before each cell if that cell uses a different header to the previous cell.',
		allowedValues: [
			{
				value: 'once',
				description: 'The property defines the headers will only be read once',
			},
			{
				value: 'always',
				description:
					'The property defines the contents of the header will be spoken as the preface to every related cell in the table.',
			},
		],
	},
	speakNumeral: {
		originalName: 'speak-numeral',
		readableName: 'Speak Numeral',
		description:
			'This property is used in aural media to specify how to speak numerals (numbers).',
		allowedValues: [
			{
				value: 'digits',
				description: 'The numeral is read one number at a time; e.g., four one two.',
			},
			{
				value: 'continuous',
				description:
					'The numeral is read in a language-dependent fashion; e.g., five hundred eleven.',
			},
		],
	},
	speakPunctuation: {
		originalName: 'speak-punctuation',
		readableName: 'Speak Punctuation',
		description:
			'This property is used in aural media to specify how punctuation (i.e. comma) should be spoken.',
		allowedValues: [
			{
				value: 'code',
				description:
					'Punctuation is spoken literally; e.g.,In closing, I fee that will be read as In closing comma I feel that.',
			},
			{
				value: 'none',
				description: 'Punctuation is rendered as pauses of various length.',
			},
		],
	},
	speechRate: {
		originalName: 'speech-rate',
		readableName: 'Speech Rate',
		description:
			'This property specifies the speaking rate. Note that both absolute and relative keyword values are allowed.',
	},
	stress: {
		originalName: 'stress',
		readableName: 'Stress',
		description:
			'This property is used in aural media (audio), and in conjunction with the pitch-range property, helps to specify peaks in the pitch of the voice',
	},
	stringSet: {
		originalName: 'string-set',
		readableName: 'String Set',
		description:
			'This property accepts a comma-separated list of named strings. Each named string is followed by a content list that specifies which text to copy into the named string',
		allowedValues: [
			{
				value: 'string',
				description: 'This property defines a string. e.g. "foo"',
			},
			{
				value: 'counter',
				description: 'This property defines a counter function',
			},
			{
				value: 'content',
				description:
					'This property defines the function returns the content of elements and pseudo-elements',
			},
		],
	},
	tabSize: {
		originalName: 'tab-size',
		readableName: 'Tab Size',
		description: 'This property determines the width of a tab character',
	},
	tableLayout: {
		originalName: 'table-layout',
		readableName: 'Table Layout',
		description: 'This property is used to display the layout of table',
		allowedValues: [
			{
				value: 'auto',
				description:
					'This property is used to set the automatic table layout on the browser',
			},
			{
				value: 'fixed',
				description: 'This property is used to set a fixed table layout',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	textAlign: {
		originalName: 'text-align',
		readableName: 'Text Align',
		description:
			'This property sets the horizontal alignment of a block element or table-cell box. This means it works like vertical-align but in the horizontal direction.',
		allowedValues: [
			{
				value: 'left',
				description: 'The inline contents are aligned to the left edge of the line box.',
			},
			{
				value: 'right',
				description: 'The inline contents are aligned to the right edge of the line box.',
			},
			{
				value: 'center',
				description: 'The inline contents are centered within the line box.',
			},
			{
				value: 'justify',
				description:
					'The inline contents are justified. Text should be spaced to line up its left and right edges to the left and right edges of the line box, except for the last line.',
			},
			{
				value: 'end',
				description:
					'The same as right if direction is left-to-right and left if direction is right-to-left.',
			},
			{
				value: 'start',
				description:
					'The same as left if direction is left-to-right and right if direction is right-to-left.',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
			{
				value: 'justify-all',
				description: 'Same as justify, but also forces the last line to be justified.',
			},
			{
				value: 'match-parent',
				description:
					'Similar to inherit, but the values start and end are calculated according to the parents direction and are replaced by the appropriate left or right value.',
			},
		],
	},
	textAlignAll: {
		originalName: 'text-align-all',
		readableName: 'Text Align All',
		description: '',
		allowedValues: [],
	},
	textAlignLast: {
		originalName: 'text-align-last',
		readableName: 'Text Align Last',
		description:
			'This property sets how the last line of a block or a line, right before a forced line break, is aligned.',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The affected line is aligned per the value of text-align, unless text-align is justify, in which case the effect is the same as setting text-align-last to start.',
			},
			{
				value: 'left',
				description: 'The inline contents are aligned to the left edge of the line box.',
			},
			{
				value: 'right',
				description: 'The inline contents are aligned to the right edge of the line box.',
			},
			{
				value: 'center',
				description: 'The inline contents are centered within the line box.',
			},
			{
				value: 'justify',
				description:
					'The text is justified. Text should line up their left and right edges to the left and right content edges of the paragraph.',
			},
			{
				value: 'start',
				description:
					'The same as left if direction is left-to-right and right if direction is right-to-left.',
			},
			{
				value: 'end',
				description:
					'The same as right if direction is left-to-right and left if direction is right-to-left.',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	textCombineUpright: {
		originalName: 'text-combine-upright',
		readableName: 'Text Combine Upright',
		description:
			'This property specifies the combination of characters into the space of a single character.',
		allowedValues: [
			{
				value: 'none',
				description: '\tNo special processing.',
			},
			{
				value: 'all',
				description:
					'\tArranges horizontally all consecutive typographic character units within the box such that they take up the space of a single typographic character unit within the vertical line box.',
			},
			{
				value: 'digits',
				description:
					'Displays a sequence of consecutive ASCII digits (U+0030–U+0039) that has as many or fewer characters than the specified integer, such that it takes up the space of a single character within the vertical line box.',
			},
			{
				value: 'initial',
				description: 'Sets the property to its default value.',
			},
			{
				value: 'inherit',
				description: 'Inherits the property from its parent element.',
			},
		],
	},
	textDecoration: {
		originalName: 'text-decoration',
		readableName: 'Text Decoration',
		description:
			'This property sets the appearance of decorative lines on text. It is a shorthand for text-decoration-line, text-decoration-color, text-decoration-style, and the newer text-decoration-thickness property.',
		allowedValues: [
			{
				value: 'text-decoration-line',
				description: 'Sets the kind of decoration used, such as underline or line-through.',
			},
			{
				value: 'text-decoration-color',
				description: 'Sets the color of the decoration.',
			},
			{
				value: 'text-decoration-style',
				description:
					'Sets the style of the line used for the decoration, such as solid, wavy, or dashed.',
			},
			{
				value: 'text-decoration-thickness',
				description: 'Sets the thickness of the line used for the decoration.',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	textDecorationColor: {
		editorType: 'color',
		originalName: 'text-decoration-color',
		readableName: 'Text Decoration Color',
		description:
			'This property sets the color of decorations added to text by text-decoration-line. The color applies to decorations, such as underlines, overlines, strikethroughs, and wavy lines like those used to mark misspellings, in the scope of the propertys value.',
		allowedValues: [
			{
				value: 'color',
				description: 'This property represents the color of the line decoration',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	textDecorationLine: {
		originalName: 'text-decoration-line',
		readableName: 'Text Decoration Line',
		description:
			'This property sets the kind of decoration that is used on text in an element, such as an underline or overline.',
		allowedValues: [
			{
				value: 'none',
				description: 'There will be no text decoration produces',
			},
			{
				value: 'underline',
				description:
					'The property specifies each line of text has a decorative line beneath it',
			},
			{
				value: 'overline',
				description:
					'The property specifies each line of text has a decorative line above it.',
			},
			{
				value: 'line-through',
				description:
					'The property specifies each line of text has a decorative line going through its middle.',
			},
			{
				value: 'blink',
				description:
					'The text blinks (alternates between visible and invisible). Conforming user agents may simply not blink the text. This value is deprecated in favor of CSS animations.',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	textDecorationSkip: {
		originalName: 'text-decoration-skip',
		readableName: 'Text Decoration Skip',
		description:
			'This property sets the kind of decoration that is used on text in an element, such as an underline or overline.',
		allowedValues: [
			{
				value: 'none',
				description: 'There will be no text decoration produces',
			},
			{
				value: 'underline',
				description:
					'The property specifies each line of text has a decorative line beneath it',
			},
			{
				value: 'overline',
				description:
					'The property specifies each line of text has a decorative line above it.',
			},
			{
				value: 'line-through',
				description:
					'The property specifies each line of text has a decorative line going through its middle.',
			},
			{
				value: 'blink',
				description:
					'The text blinks (alternates between visible and invisible). Conforming user agents may simply not blink the text. This value is deprecated in favor of CSS animations.',
			},
		],
	},
	textDecorationStyle: {
		originalName: 'text-decoration-style',
		readableName: 'Text Decoration Style',
		description:
			'This property sets the style of the lines specified by text-decoration-line. The style applies to all lines that are set with text-decoration-line.',
		allowedValues: [
			{
				value: 'solid',
				description: 'This property helps to draws a single line',
			},
			{
				value: 'double',
				description: 'This property helps to draws a double line',
			},
			{
				value: 'dotted',
				description: 'This property helps to draws a dotted line',
			},
			{
				value: 'dashed',
				description: 'This property helps to draws a dashed line',
			},
			{
				value: 'wavy',
				description: 'This property helps to draws a wavy line',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	textDecorationThickness: {
		originalName: 'text-decoration-thickness',
		readableName: 'Text Decoration Thickness',
		description:
			'This property sets the stroke thickness of the decoration line that is used on text in an element, such as a line-through, underline, or overline',
	},
	textEmphasis: {
		originalName: 'text-emphasis',
		readableName: 'Text Emphasis',
		description:
			'This property applies emphasis marks to text (except spaces and control characters)',
		allowedValues: [
			{
				value: 'none',
				description: 'There will be no emphasis marks',
			},
			{
				value: 'filled',
				description: 'Default value. The shape is filled with solid color',
			},
			{
				value: 'open',
				description: 'The shape is hollow.',
			},
			{
				value: 'dot',
				description: 'This property will display small circles as marks',
			},
			{
				value: 'circle',
				description: 'This property will display large circles as marks.',
			},
			{
				value: 'double-circle',
				description: 'This property will display double circles as marks',
			},
			{
				value: 'triangle',
				description: 'This property will display triangles as marks',
			},
			{
				value: 'sesame',
				description: 'This property will display sesames as marks',
			},
			{
				value: 'string',
				description: 'This property will display the given string as marks',
			},
			{
				value: 'color',
				description:
					'This property will defines the color of the mark. If no color is present, it defaults to currentcolor.',
			},
		],
	},
	textEmphasisPosition: {
		originalName: 'text-emphasis-position',
		readableName: 'Text Emphasis Position',
		description:
			'This property sets where emphasis marks are drawn. Like ruby text, if there is not enough room for emphasis marks, the line height is increased.',
		allowedValues: [
			{
				value: 'over',
				description:
					'This property will draw marks over the text in horizontal writing mode',
			},
			{
				value: 'under',
				description:
					'This property will draw marks under the text in horizontal writing mode',
			},
			{
				value: 'right',
				description:
					'This property will draws marks to the right of the text in vertical writing mode',
			},
			{
				value: 'left',
				description:
					'This property will draw marks to the left of the text in vertical writing mode',
			},
		],
	},
	textEmphasisStyle: {
		originalName: 'text-emphasis-style',
		readableName: 'Text Emphasis Style',
		description:
			'This property sets the appearance of emphasis marks. It can also be set, and reset, using the text-emphasis shorthand.',
		allowedValues: [
			{
				value: 'none',
				description: 'There will be no emphasis marks',
			},
			{
				value: 'filled',
				description: 'Default value. The shape is filled with solid color',
			},
			{
				value: 'open',
				description: 'The shape is hollow.',
			},
			{
				value: 'dot',
				description: 'This property will display small circles as marks',
			},
			{
				value: 'circle',
				description: 'This property will display large circles as marks.',
			},
			{
				value: 'double-circle',
				description: 'This property will display double circles as marks',
			},
			{
				value: 'triangle',
				description: 'This property will display triangles as marks',
			},
			{
				value: 'sesame',
				description: 'This property will display sesames as marks',
			},
			{
				value: 'string',
				description: 'This property will display the given string as marks',
			},
		],
	},
	textGroupAlign: {
		originalName: 'text-group-align',
		readableName: 'Text Group Align',
		description: '',
		allowedValues: [],
	},
	textIndent: {
		originalName: 'text-indent',
		readableName: 'Text Indent',
		description:
			'The property sets the length of empty space (indentation) that is put before lines of text in a block.',
	},
	textJustify: {
		originalName: 'text-justify',
		readableName: 'Text Justify',
		description:
			'The property sets what type of justification should be applied to text when text-align: justify; is set on an element.',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The browser chooses the best type of justification for the current situation based on a balance between performance and quality',
			},
			{
				value: 'inter-word',
				description: 'The text is justified by adding space between the words',
			},
			{
				value: 'inter-character',
				description: 'The text is justified by adding space between the characters',
			},
			{
				value: 'none',
				description:
					'The text justification is turned off. This has the same effect as not setting text-align at all',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	textOrientation: {
		originalName: 'text-orientation',
		readableName: 'Text Orientation',
		description:
			'The property sets the orientation of the text characters in a line. It only affects text in vertical mode',
		allowedValues: [
			{
				value: 'mixed',
				description:
					'Rotates the characters of horizontal scripts 90° clockwise. Lays out the characters of vertical scripts naturally. Default value',
			},
			{
				value: 'upright',
				description:
					'Lays out the characters of horizontal scripts naturally (upright), as well as the glyphs for vertical scripts',
			},
			{
				value: 'sideways',
				description:
					'Causes characters to be laid out as they would be horizontally, but with the whole line rotated 90° clockwise',
			},
			{
				value: 'sideways-right',
				description: 'An alias to sideways that is kept for compatibility purposes.',
			},
			{
				value: 'use-glyph-orientation',
				description:
					'On SVG elements, this keyword leads to use the value of the deprecated SVG properties glyph-orientation-vertical and glyph-orientation-horizontal',
			},
		],
	},
	textOverflow: {
		originalName: 'text-overflow',
		readableName: 'Text Overflow',
		description: 'The property sets how hidden overflow content is signaled to users',
		allowedValues: [
			{
				value: 'clip',
				description:
					'Default value. This keyword value will truncate the text at the limit of the content area, therefore the truncation can happen in the middle of a character',
			},
			{
				value: 'ellipsis',
				description:
					'This keyword value will display an ellipsis to represent clipped text. The ellipsis is displayed inside the content area, decreasing the amount of text displayed',
			},
			{
				value: 'string',
				description:
					'The <string> to be used to represent clipped text. The string is displayed inside the content area, shortening the size of the displayed text',
			},
			{
				value: 'fade',
				description:
					'This keyword clips the overflowing inline content and applies a fade-out effect near the edge of the line box with complete transparency at the edge',
			},
		],
	},
	textRendering: {
		originalName: 'text-rendering',
		readableName: 'Text Rendering',
		description:
			'The property provides information to the rendering engine about what to optimize for when rendering text',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The browser makes educated guesses about when to optimize for speed, legibility, and geometric precision while drawing text.',
			},
			{
				value: 'optimizeSpeed',
				description:
					'The browser emphasizes rendering speed over legibility and geometric precision when drawing text. It disables kerning and ligatures.',
			},
			{
				value: 'optimizeLegibility',
				description:
					'The browser emphasizes legibility over rendering speed and geometric precision. This enables kerning and optional ligatures.',
			},
			{
				value: 'geometricPrecision',
				description:
					'The browser emphasizes geometric precision over rendering speed and legibility',
			},
		],
	},
	textShadow: {
		originalName: 'text-shadow',
		readableName: 'Text Shadow',
		description:
			'The text-shadow CSS property adds shadows to text. It accepts a comma-separated list of shadows to be applied to the text and any of its decorations',
		allowedValues: [
			{
				value: 'h-shadow',
				description: 'This property specifies the horizontal distance',
			},
			{
				value: 'v-shadow',
				description: 'This property specifies the vertical distance',
			},
			{
				value: 'blur-radius',
				description:
					'Optional. The property represents the <length> value. The higher the value, the bigger the blur',
			},
			{
				value: 'color',
				description:
					'Optional. The property represents the color of the shadow. It can be specified either before or after the offset values',
			},
			{
				value: 'none',
				description: 'Default value. There will be no shadow',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	textSizeAdjust: {
		originalName: 'text-size-adjust',
		readableName: 'Text Size Adjust',
		description:
			'This property controls the text inflation algorithm used on some smartphones and tablets. Other browsers will ignore this property.',
		allowedValues: [
			{
				value: 'none',
				description: 'This property disables the inflation algorithm of the browser',
			},
			{
				value: 'auto',
				description: 'This property enables the inflation algorithm of the browser',
			},
			{
				value: 'percentage(%)',
				description: 'This property enables the inflation algorithm of the browser',
			},
		],
	},
	textSpaceTrim: {
		originalName: 'text-space-trim',
		readableName: 'Text Space Trim',
		description: '',
		allowedValues: [],
	},
	textSpacing: {
		originalName: 'text-spacing',
		readableName: 'Text Spacing',
		description:
			'This property is controlled by using the letter-spacing, word-spacing, line-height, and text-indent properties',
	},
	textTransform: {
		originalName: 'text-transform',
		readableName: 'Text Transform',
		description:
			'This property specifies how to capitalize an elements text. It can be used to make text appear in all-uppercase or all-lowercase',
		allowedValues: [
			{
				value: 'none',
				description:
					'Is a keyword that prevents the case of all characters from being changed.',
			},
			{
				value: 'capitalize',
				description:
					'Is a keyword that converts the first letter of each word to uppercase',
			},
			{
				value: 'uppercase',
				description: 'Is a keyword that converts all characters to uppercase',
			},
			{
				value: 'lowercase',
				description: 'Is a keyword that converts all characters to lowercase',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	textUnderlineOffset: {
		originalName: 'text-underline-offset',
		readableName: 'Text Underline Offset',
		description:
			'This property sets the offset distance of an underline text decoration line from its original position',
		allowedValues: [
			{
				value: 'auto',
				description: 'The browser chooses the appropriate offset for underlines',
			},
			{
				value: '<length>',
				description:
					'Specifies the offset of underlines as a <length>, overriding the font file suggestion',
			},
			{
				value: '%',
				description:
					'Specifies the offset of underlines as a <percentage> of 1em in the font of an element',
			},
		],
	},
	textUnderlinePosition: {
		originalName: 'text-underline-position',
		readableName: 'Text Underline Position',
		description:
			'This property specifies the position of the underline which is set using the text-decoration properties underline value',
		allowedValues: [
			{
				value: 'auto',
				description:
					'The user agent uses its own algorithm to place the line at or under the alphabetic baseline',
			},
			{
				value: 'from-font',
				description:
					'If the font file includes information about a preferred position, use that value',
			},
			{
				value: 'under',
				description:
					"Forces the line to be set below the alphabetic baseline, at a position where it won't cross any descenders",
			},
			{
				value: 'left',
				description:
					'In vertical writing-modes, this keyword forces the line to be placed on the left side of the text',
			},
			{
				value: 'right',
				description:
					'In vertical writing-modes, this keyword forces the line to be placed on the right side of the text',
			},
			{
				value: 'auto-pos',
				description:
					'This property represents a synonym of auto, which should be used instead',
			},
			{
				value: 'above',
				description: 'This property forces the line to be above the text',
			},
			{
				value: 'below',
				description: 'This property forces the line to be below the text',
			},
		],
	},
	textWrap: {
		originalName: 'text-wrap',
		readableName: 'Text Wrap',
		description: '',
		allowedValues: [],
	},
	top: {
		originalName: 'top',
		readableName: 'Top',
		description:
			'This property is used to affect the vertical position of a positioned element',
	},
	touchAction: {
		originalName: 'touch-action',
		readableName: 'Touch Action',
		description:
			'This property sets how an elements region can be manipulated by a touchscreen user (for example, by zooming features built into the browser)',
		allowedValues: [
			{
				value: 'auto',
				description:
					'This property helps to enable browser handling of all panning and zooming gestures',
			},
			{
				value: 'none',
				description:
					'This property helps to disable browser handling of all panning and zooming gestures',
			},
			{
				value: 'pan-x',
				description:
					'This property helps to enable single-finger horizontal panning gestures',
			},
			{
				value: 'pan-y',
				description:
					'This property helps to enable single-finger vertical panning gestures',
			},
			{
				value: 'manipulation',
				description: 'This property helps to enable panning and pinch zoom gestures',
			},
			{
				value: 'pan-left, pan-right, pan-up, pan-down',
				description:
					'This property helps to enable single-finger gestures that begin by scrolling in the given direction',
			},
			{
				value: 'pinch-zoom',
				description: 'Enable multi-finger panning and zooming of the page',
			},
		],
	},
	transform: {
		originalName: 'transform',
		readableName: 'Transform',
		description:
			'This property lets you rotate, scale, skew, or translate an element. It modifies the coordinate space of the CSS visual formatting model',
		allowedValues: [
			{
				value: '<transform-function>',
				description: 'One or more of the CSS transform functions to be applied',
			},
			{
				value: 'none',
				description: 'This property specifies that no transform should be applied',
			},
		],
	},
	transformBox: {
		originalName: 'transform-box',
		readableName: 'Transform Box',
		description:
			'This property defines the layout box to which the transform and transform-origin properties relate.',
		allowedValues: [
			{
				value: 'content-box',
				description: 'This property defines the content box is used as the reference box',
			},
			{
				value: 'border-box',
				description: 'This property defines the border box is used as the reference box',
			},
			{
				value: 'fill-box',
				description:
					'This property defines theobject bounding box is used as the reference box',
			},
			{
				value: 'stroke-box',
				description:
					'This property defines the stroke bounding box is used as the reference box',
			},
			{
				value: 'view-box',
				description:
					'This property defines the nearest SVG viewport is used as the reference box',
			},
		],
	},
	transformOrigin: {
		originalName: 'transform-origin',
		readableName: 'Transform Origin',
		description: 'The property sets the origin for an elements transformations',
		allowedValues: [
			{
				value: 'x-offset',
				description:
					'This property defines the <length> or a <percentage> describing how far from the left edge of the box the origin of the transform is set',
			},
			{
				value: 'y-offset',
				description:
					'This property defines the <length> or a <percentage> describing how far from the top edge of the box the origin of the transform is set',
			},
			{
				value: 'z-offset',
				description:
					'This property defines the <length> describing how far from the user eye the z=0 origin is set',
			},
		],
	},
	transformStyle: {
		originalName: 'transform-style',
		readableName: 'Transform Style',
		description:
			'The property sets whether children of an element are positioned in the 3D space or are flattened in the plane of the element',
		allowedValues: [
			{
				value: 'flat',
				description:
					'Indicates that the children of the element are lying in the plane of the element itself',
			},
			{
				value: 'preserve-3d',
				description:
					'Indicates that the children of the element should be positioned in the 3D-space',
			},
		],
	},
	transition: {
		originalName: 'transition',
		readableName: 'Transition',
		description: 'The property is used to make some transition effect',
		allowedValues: [
			{
				value: 'transition-property',
				description:
					'The property sets the CSS properties to which a transition effect should be applied',
			},
			{
				value: 'transition-duration',
				description:
					'The property sets the length of time a transition animation should take to complete',
			},
			{
				value: 'transition-timing-function',
				description:
					'This property sets how intermediate values are calculated for CSS properties being affected by a transition effect',
			},
			{
				value: 'transition-delay',
				description:
					'The property specifies the duration to wait before starting a propert transition effect when its value changes',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	transitionDelay: {
		originalName: 'transition-delay',
		readableName: 'Transition Delay',
		description:
			'The property specifies the duration to wait before starting a property transition effect when its value changes',
	},
	transitionDuration: {
		originalName: 'transition-duration',
		readableName: 'Transition Duration',
		description:
			'The property sets the length of time a transition animation should take to complete',
	},
	transitionProperty: {
		originalName: 'transition-property',
		readableName: 'Transition Property',
		description:
			'This property sets the CSS properties to which a transition effect should be applied',
		allowedValues: [
			{
				value: 'none',
				description: 'There will be no properties will transition',
			},
			{
				value: 'all',
				description: 'This property includes all the properties that can transition',
			},
			{
				value: 'property',
				description:
					'This property represents a string identifying the property to which a transition effect should be applied when its value changes.',
			},
		],
	},
	transitionTimingFunction: {
		originalName: 'transition-timing-function',
		readableName: 'Transition Timing Function',
		description:
			'This property sets how intermediate values are calculated for CSS properties being affected by a transition effect',
		allowedValues: [
			{
				value: 'ease',
				description:
					'Default value. This property is represents the transition effect with a slow start, then fast, then end slowly',
			},
			{
				value: 'linear',
				description:
					'This property is represents the transition effect with the same speed from start to end',
			},
			{
				value: 'ease-in',
				description: 'This property is represents the transition effect with a slow start',
			},
			{
				value: 'ease-out',
				description: 'This property is represents the transition effect with a slow end',
			},
			{
				value: 'ease-in-out',
				description:
					'This property represents the transition effect with a slow start and end',
			},
			{
				value: 'step-start',
				description: 'Equal to steps(1, jump-start)',
			},
			{
				value: 'step-end',
				description:
					'The animation stays in its initial state until the end, at which point it jumps directly to its final state',
			},
			{
				value: 'steps(int,start|end)',
				description:
					'Displays the transition along n stops along the transition, displaying each stop for equal lengths of time.',
			},
			{
				value: 'cubic-bezier(n,n,n,n)',
				description:
					'An author defined cubic-Bezier curve, where the p1 and p3 values must be in the range of 0 to 1.',
			},
		],
	},
	translate: {
		originalName: 'translate',
		readableName: 'Translate',
		description:
			'This function repositions an element in the horizontal and/or vertical directions',
		allowedValues: [
			{
				value: 'Single <length-percentage> values',
				description:
					'This value is a <length> or <percentage> representing the abscissa (horizontal, x-coordinate) of the translating vector',
			},
			{
				value: 'Double <length-percentage> values',
				description:
					'This value describes two <length> or <percentage> values representing both the abscissa (x-coordinate) and the ordinate (y-coordinate) of the translating vector',
			},
		],
	},
	unicodeBidi: {
		originalName: 'unicode-bidi',
		readableName: 'Unicode Bidi',
		description:
			'The property determines how bidirectional text in a document is handled and helps together with the direction property',
		allowedValues: [
			{
				value: 'normal',
				description:
					'Default value. There will be no element that does not open an additional level of embedding',
			},
			{
				value: 'embed',
				description:
					'For inline elements, this value opens an additional level of embedding',
			},
			{
				value: 'bidi-override',
				description:
					'For inline elements, this creates an override. For block elements, this creates an override for inline-level descendants not within another block element',
			},
			{
				value: 'isolate',
				description: 'The property helps the element to isolate from its siblings',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	userSelect: {
		originalName: 'user-select',
		readableName: 'User Select',
		description: 'This property controls how the text in an element is allowed to be selected',
		allowedValues: [
			{
				value: 'auto',
				description: 'Default value. The text can be selected if the browser allows it',
			},
			{
				value: 'none',
				description: 'This property prevents the text to be selected',
			},
			{
				value: 'text',
				description: 'This proeprty helps the user to select the text',
			},
			{
				value: 'all',
				description: 'This property will set to its default value',
			},
		],
	},
	verticalAlign: {
		originalName: 'vertical-align',
		readableName: 'Vertical Align',
		description: 'This property is used to set the vertical alignment of an element',
	},
	visibility: {
		originalName: 'visibility',
		readableName: 'Visibility',
		description:
			'This property specifies the visibility of an element i.e, whether or not an element is visible',
		allowedValues: [
			{
				value: 'visible',
				description: 'Default value. The element will be visible',
			},
			{
				value: 'hidden',
				description: 'The element will not visible but still takes the space',
			},
			{
				value: 'collapse',
				description:
					'This property is used to hide an element entirely so that it does not occupy any space in the layout but only when the element is a table element',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	voiceBalance: {
		originalName: 'voice-balance',
		readableName: 'Voice Balance',
		description:
			'This property is property is used in speech media for controlling the balance or spatial distribution of the audio output across a lateral sound stage',
	},
	voiceDuration: {
		originalName: 'voice-duration',
		readableName: 'Voice Duration',
		description:
			'This property is used where synchronization of speech is done with other media',
	},
	voiceFamily: {
		originalName: 'voice-family',
		readableName: 'Voice Family',
		description:
			'This proeprty helps speech media to specify the voice family of the speaking voice',
		allowedValues: [
			{
				value: 'unset',
				description:
					'This property sets all properties to their parent value if they are inheritable or to their initial value if not inheritable',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	voicePitch: {
		originalName: 'voice-pitch',
		readableName: 'Voice Pitch',
		description:
			'This property is used in speech media to specify the baseline pitch of the speaking voice',
	},
	voiceRange: {
		originalName: 'voice-range',
		readableName: 'Voice Range',
		description:
			'This property is used in speech media to specify the pitch range of the speaking voice',
	},
	voiceRate: {
		originalName: 'voice-rate',
		readableName: 'Voice Rate',
		description:
			'This property specifies how fast the synthesized voice speaks when reading out the content',
	},
	voiceStress: {
		originalName: 'voice-stress',
		readableName: 'Voice Stress',
		description:
			'The property is used in speech media to adjust the strength of stress emphasis by the change of timing, loudness and other adjustments',
		allowedValues: [
			{
				value: 'normal',
				description: 'Default value. The property specifies normal emphasis should be used',
			},
			{
				value: 'none',
				description:
					'This property prevents any emphasis on text that would normally be emphasized.',
			},
			{
				value: 'moderate',
				description: 'The property specifies moderate emphasis should be used',
			},
			{
				value: 'strong',
				description: 'The property specifies strong emphasis should be used',
			},
			{
				value: 'reduce',
				description: 'The property specifies reduced emphasis should be used',
			},
			{
				value: 'unset',
				description:
					'This property sets all properties to their parent value if they are inheritable or to their initial value if not inheritable',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	voiceVolume: {
		originalName: 'voice-volume',
		readableName: 'Voice Volume',
		description:
			'This property is used to adjust the volume level of spoken content when the content is being read out by a device such as a screen reader',
		allowedValues: [
			{
				value: 'silent',
				description: 'This property has no sound. The text will be read silently',
			},
			{
				value: 'x-soft',
				description: 'The property specifies the content should read in extra low volume',
			},
			{
				value: 'soft',
				description: 'The property specifies the content should read in low volume',
			},
			{
				value: 'medium',
				description: 'The property specifies the content should read in medium volume',
			},
			{
				value: 'loud',
				description: 'The property specifies the content should read in louder volume',
			},
			{
				value: 'x-loud',
				description:
					'The property specifies the content should read in extra louder volume',
			},
			{
				value: 'unset',
				description:
					'This property sets all properties to their parent value if they are inheritable or to their initial value if not inheritable',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	volume: {
		originalName: 'volume',
		readableName: 'Volume',
		description: 'This property is used for specifying the median volume of the wave form',
		allowedValues: [
			{
				value: 'silent',
				description: 'This property has no sound. The text will be read silently',
			},
			{
				value: 'x-soft',
				description:
					'The property specifies the content should read in extra low volume. Same as "0"',
			},
			{
				value: 'soft',
				description:
					'The property specifies the content should read in low volume. Same as "25"',
			},
			{
				value: 'medium',
				description:
					'The property specifies the content should read in medium volume. Same as "50"',
			},
			{
				value: 'loud',
				description:
					'The property specifies the content should read in louder volume. Same as "75"',
			},
			{
				value: 'x-loud',
				description:
					'The property specifies the content should read in extra louder volume. Same as "100"',
			},
			{
				value: 'unset',
				description:
					'This property sets all properties to their parent value if they are inheritable or to their initial value if not inheritable',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	whiteSpace: {
		originalName: 'white-space',
		readableName: 'White Space',
		description: 'This property helps to handle the white-space inside an element',
		allowedValues: [
			{
				value: 'normal',
				description:
					'Default value. The Sequence of whitespace will collapse into a single whitespace. Text will wrap when necessary',
			},
			{
				value: 'nowrap',
				description:
					'The sequence of whitespace will collapse into a single whitespace. Text will never wrap to the next line. The text continues on the same line until a <br> tag is encountered',
			},
			{
				value: 'pre',
				description:
					'The browser will preserve the whitespace. Text will only wrap on line breaks and Acts like the <pre> tag in HTML',
			},
			{
				value: 'pre-line',
				description:
					'The sequence of whitespace will collapse into a single whitespace. Text will wrap when necessary, and on line breaks',
			},
			{
				value: 'pre-wrap',
				description:
					'The browser will preserve the whitespace. Text will wrap when necessary, and on line breaks',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	widows: {
		originalName: 'widows',
		readableName: 'Widows',
		description:
			'This property controls the minimum number of lines of a paragraph that can fall to a new page',
		allowedValues: [
			{
				value: 'integer',
				description:
					'The proeprty specifies any length unit and negative length values are not permitted',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	width: {
		originalName: 'width',
		readableName: 'Width',
		description: 'This property is used to set the width of an element',
	},
	willChange: {
		originalName: 'will-change',
		readableName: 'Will Change',
		description:
			'This property helps the browsers to know how an element is expected to change and allows you to provide hints to the browser regarding what sort of changes it should expect from an element',
		allowedValues: [
			{
				value: 'auto',
				description: 'The property expresses no particular intent',
			},
			{
				value: 'scroll-position',
				description:
					'This property specifies the author can change the scroll position of the element in the near future',
			},
			{
				value: 'contents',
				description:
					'This property specifies the author can change the content of the element in the near future',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	wordBreak: {
		originalName: 'word-break',
		readableName: 'Word Break',
		description:
			'The property specifies how a word should break or split when reaching the end of a line.',
		allowedValues: [
			{
				value: 'normal',
				description: 'Default value. The property uses default line break rules',
			},
			{
				value: 'break-all',
				description:
					'The property helps to prevent overflow so the word may be broken at any character',
			},
			{
				value: 'keep-all',
				description:
					'The property defines how word breaks should not be used for Chinese/Japanese/Korean (CJK) text. Non-CJK text behavior is the same as value "normal"',
			},
			{
				value: 'break-word',
				description:
					'The property helps to prevent overflow so the word may be broken at arbitrary points',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	wordSpacing: {
		originalName: 'word-spacing',
		readableName: 'Word Spacing',
		description:
			'This property is used to control the space between the words and can increase or decrease the space between words',
	},
	wordWrap: {
		originalName: 'word-wrap',
		readableName: 'Word Wrap',
		description:
			'The property defines whether to break words when the content exceeds the boundaries of its container and is used to break long word and wrap into the next line',
		allowedValues: [
			{
				value: 'normal',
				description: 'The property helps to break the words only at allowed break points',
			},
			{
				value: 'break-word',
				description: 'The property allows unbreakable words to be broken',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	wrapAfter: {
		originalName: 'wrap-after',
		readableName: 'Wrap After',
		description: '',
		allowedValues: [
			{
				value: '',
				description: '',
			},
			{
				value: '',
				description: '',
			},
			{
				value: '',
				description: '',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	wrapBefore: {
		originalName: 'wrap-before',
		readableName: 'Wrap Before',
		description: '',
		allowedValues: [
			{
				value: '',
				description: '',
			},
			{
				value: '',
				description: '',
			},
			{
				value: '',
				description: '',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	wrapFlow: {
		originalName: 'wrap-flow',
		readableName: 'Wrap Flow',
		description:
			'the property specifies how exclusions affect inline content within block-level elements. Elements lay out their inline content in their content area but wrap around exclusion areas',
		allowedValues: [
			{
				value: 'auto',
				description:
					'There will be no exclusion is created. Inline flow content interacts with the element as usual',
			},
			{
				value: 'both',
				description:
					'This property helps the Inline flow so that content can flow on all sides of the exclusion',
			},
			{
				value: 'start',
				description:
					'The Inline flow content can flow around the start edge of the exclusion area but must leave the area next to the end edge of the exclusion empty',
			},
			{
				value: 'end',
				description:
					'The Inline flow content can flow around the start edge of the exclusion area but must leave the area next to the end edge of the exclusion empty',
			},
			{
				value: 'maximum',
				description:
					'Inline flow content can flow around the edge of the exclusion with the smallest available space within the flow content’s containing block, and must leave the other edge of the exclusion empty',
			},
			{
				value: 'minimum',
				description:
					'Inline flow content can flow around the edge of the exclusion with the largest available space within the flow content’s containing block, and must leave the other edge of the exclusion empty',
			},
			{
				value: 'clear',
				description:
					'Inline flow content can only flow before and after the exclusion in the flow content’s block direction, and must leave the areas next to the start and end edges of the exclusion empty',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	wrapInside: {
		originalName: 'wrap-inside',
		readableName: 'Wrap Inside',
		description: '',
		allowedValues: [
			{
				value: '',
				description: '',
			},
			{
				value: '',
				description: '',
			},
			{
				value: '',
				description: '',
			},
			{
				value: 'initial',
				description: 'This property will set to its default value',
			},
			{
				value: 'inherit',
				description: 'This can inherits the properties from its parent element',
			},
		],
	},
	wrapThrough: {
		originalName: 'wrap-through',
		readableName: 'Wrap Through',
		description:
			'The property helps to specifies whether an element inherits its parent’s wrapping context as defined by the wrap-flow property',
		allowedValues: [
			{
				value: 'wrap',
				description:
					'The property helps the element to inherits its parent node’s wrapping context. Its descendant inline content wraps around exclusions defined outside the element',
			},
			{
				value: 'none',
				description:
					'The property helps to element to ignores its parent’s wrapping context. Its descendent inline content only wraps around exclusions defined inside this element.',
			},
		],
	},
	writingMode: {
		originalName: 'writing-mode',
		readableName: 'Writing Mode',
		description:
			'This property changes the alignment of the text so that it can be read horizontally or vertically',
		allowedValues: [
			{
				value: 'horizontal-tb',
				description:
					'This property sets the content flow horizontally from left to right and vertically from top to bottom',
			},
			{
				value: 'vertical-rl',
				description:
					'This property sets the content flow vertically from top to bottom and horizontally from right to left',
			},
			{
				value: 'vertical-lr',
				description:
					'This property sets the content flow vertically from top to bottom and horizontally from left to right',
			},
		],
	},
	zIndex: {
		originalName: 'z-index',
		readableName: 'Z Index',
		description:
			'This property specifies the order of overlapping elements. The higher index elements will be placed on top of elements with a lower index.',
	},
};

export default cssProps;
