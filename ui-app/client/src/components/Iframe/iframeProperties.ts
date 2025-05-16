import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition, ComponentPropertyGroup } from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'src',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'source',
		group: ComponentPropertyGroup.BASIC,
		description: 'The URL of the page to embed.',
	},
	{
		name: 'width',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'width',
		group: ComponentPropertyGroup.BASIC,
		description: 'The width of the frame in CSS pixels, dont add px.',
		defaultValue: '650',
	},
	{
		name: 'height',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'height',
		group: ComponentPropertyGroup.BASIC,
		description: 'The height of the frame in CSS pixels, dont add px.',
		defaultValue: '420',
	},
	{
		name: 'name',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'name',
		group: ComponentPropertyGroup.BASIC,
		description: 'A targetable name for the embedded browsing context.',
	},
	{
		name: 'srcdoc',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'srcdoc',
		group: ComponentPropertyGroup.ADVANCED,
		description: 'Inline HTML to embed, overriding the src attribute.',
	},
	{
		name: 'sandbox',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'sandbox',
		group: ComponentPropertyGroup.ADVANCED,
		multiValued:true,
		description: 'Applies extra restrictions to the content in the frame. ',
		enumValues: [
			{
				name: 'allow-downloads',
				displayName: 'allow-downloads',
				description: 'Allows downloading files through the iframe.',
			},
			{
				name: 'allow-downloads-without-user-activation',
				displayName: 'allow-downloads-without-user-activation',
				description: 'Allows downloading files without user interaction.',
			},
			{
				name: 'allow-forms',
				displayName: 'allow-forms',
				description: 'Allows form submission.',
			},
			{
				name: 'allow-modals',
				displayName: 'allow-modals',
				description: 'Allows opening modal windows.',
			},
			{
				name: 'allow-orientation-lock',
				displayName: 'allow-orientation-lock',
				description: 'Allows locking screen orientation.',
			},
			{
				name: 'allow-pointer-lock',
				displayName: 'allow-pointer-lock',
				description: 'Allows using Pointer Lock API.',
			},
			{
				name: 'allow-popups',
				displayName: 'allow-popups',
				description: 'Allows popups (window.open(), target="_blank", etc.).',
			},
			{
				name: 'allow-popups-to-escape-sandbox',
				displayName: 'allow-popups-to-escape-sandbox',
				description: 'Allows popups to open windows without inheriting sandbox restrictions.',
			},
			{
				name: 'allow-presentation',
				displayName: 'allow-presentation',
				description: 'Allows using Presentation API.',
			},
			{
				name: 'allow-same-origin',
				displayName: 'allow-same-origin',
				description: 'Allows the iframe to maintain its origin.',
			},
			{
				name: 'allow-scripts',
				displayName: 'allow-scripts',
				description: 'Allows running scripts.',
			},
			{
				name: 'allow-storage-access-by-user-activation',
				displayName: 'allow-storage-access-by-user-activation',
				description: 'Allows access to storage with user activation.',
			},
			{
				name: 'allow-top-navigation',
				displayName: 'allow-top-navigation',
				description: 'Allows navigating the top-level browsing context.',
			},
			{
				name: 'allow-top-navigation-by-user-activation',
				displayName: 'allow-top-navigation-by-user-activation',
				description: 'Allows top navigation with user activation.',
			},
			{
				name: 'allow-top-navigation-to-custom-protocols',
				displayName: 'allow-top-navigation-to-custom-protocols',
				description: 'Allows navigation to custom protocols.',
			},
			{
				name: 'allow-top-navigation-with-user-activation',
				displayName: 'allow-top-navigation-with-user-activation',
				description: 'Allows top navigation with user activation.',
			},
			{
				name: '',
				displayName: 'Maximum Restrictions',
				description: 'Applies all sandbox restrictions.',
			}
		]
	},
	{
		name: 'referrerpolicy',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'referrerpolicy',
		group: ComponentPropertyGroup.ADVANCED,
		description: "Indicates which referrer to send when fetching the frame's resource:",
		defaultValue: 'no-referrer-when-downgrade',
		enumValues: [
			{
				name: 'no-referrer',
				displayName: 'no-referrer',
				description: 'No referrer information is sent along with requests.',
			},
			{
				name: 'no-referrer-when-downgrade',
				displayName: 'no-referrer-when-downgrade',
				description: 'Send full referrer info to same or more secure destinations, no referrer to less secure destinations.',
			},
			{
				name: 'origin',
				displayName: 'origin',
				description: 'Only send the origin of the document as the referrer.',
			},
			{
				name: 'origin-when-cross-origin',
				displayName: 'origin-when-cross-origin',
				description: 'Send full referrer to same origin, only send origin for cross-origin requests.',
			},
			{
				name: 'same-origin',
				displayName: 'same-origin',
				description: 'Send referrer info to same-origin, no referrer for cross-origin.',
			},
			{
				name: 'strict-origin',
				displayName: 'strict-origin',
				description: 'Send origin to same or more secure destinations, no referrer to less secure destinations.',
			},
			{
				name: 'strict-origin-when-cross-origin',
				displayName: 'strict-origin-when-cross-origin',
				description: 'Same origin: full referrer. Cross-origin: origin only if same/more secure, no referrer if less secure.',
			},
			{
				name: 'unsafe-url',
				displayName: 'unsafe-url',
				description: 'Send full referrer info with all requests, regardless of security.',
			},
			{
				name: '',
				displayName: 'Default Browser Policy',
				description: 'Use the default referrer policy of the browser.',
			}
		]
	},
	{
		name: 'loading',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'loading',
		description: 'loading type of the iframe',
		defaultValue: 'lazy',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: 'eager',
				displayName: 'eager',
				description: 'The iframe loads immediately, even if it is not within the initial viewport.',
			},
			{
				name: 'lazy',
				displayName: 'lazy',
				description: 'The iframe loads lazily, only when it is within the initial viewport.',
			}
		]
	},
	{
		name: 'allowfullscreen',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'allowfullscreen',
		description: 'To activate fullscreen mode by',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'allow',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'allow',
		group: ComponentPropertyGroup.ADVANCED,
		description: 'allow of the iframe',

		enumValues: [
			{
				name: 'accelerometer',
				displayName: 'accelerometer',
				description: 'Allows access to accelerometer sensor data.',
			},
			{
				name: 'autoplay',
				displayName: 'autoplay',
				description: 'Allows automatic playback of media.',
			},
			{
				name: 'camera',
				displayName: 'camera',
				description: 'Allows access to video input devices.',
			},
			{
				name: 'clipboard-write',
				displayName: 'clipboard-write',
				description: 'Allows writing to the clipboard.',
			},
			{
				name: 'display-capture',
				displayName: 'display-capture',
				description: 'Allows capturing screen contents.',
			},
			{
				name: 'encrypted-media',
				displayName: 'encrypted-media',
				description: 'Allows playback of encrypted media.',
			},
			{
				name: 'fullscreen',
				displayName: 'fullscreen',
				description: 'Allows fullscreen mode.',
			},
			{
				name: 'geolocation',
				displayName: 'geolocation',
				description: 'Allows access to location data.',
			},
			{
				name: 'gyroscope',
				displayName: 'gyroscope',
				description: 'Allows access to gyroscope sensor data.',
			},
			{
				name: 'microphone',
				displayName: 'microphone',
				description: 'Allows access to audio input devices.',
			},
			{
				name: 'payment',
				displayName: 'payment',
				description: 'Allows access to the Payment Request API.',
			},
			{
				name: 'picture-in-picture',
				displayName: 'picture-in-picture',
				description: 'Allows Picture-in-Picture mode.',
			},
			{
				name: 'web-share',
				displayName: 'web-share',
				description: 'Allows access to the Web Share API.',
			},
			{
				name: 'ambient-light-sensor',
				displayName: 'ambient-light-sensor',
				description: 'Allows access to ambient light sensor data.',
			},
			{
				name: 'battery',
				displayName: 'battery',
				description: 'Allows access to battery information.',
			},
			{
				name: 'clipboard-read',
				displayName: 'clipboard-read',
				description: 'Allows reading from clipboard.',
			},
			{
				name: 'document-domain',
				displayName: 'document-domain',
				description: 'Allows setting document.domain.',
			},
			{
				name: 'execution-while-not-rendered',
				displayName: 'execution-while-not-rendered',
				description: 'Allows execution when frame is not rendered.',
			},
			{
				name: 'execution-while-out-of-viewport',
				displayName: 'execution-while-out-of-viewport',
				description: 'Allows execution when frame is outside viewport.',
			},
			{
				name: 'hid',
				displayName: 'hid',
				description: 'Allows access to WebHID API.',
			},
			{
				name: 'idle-detection',
				displayName: 'idle-detection',
				description: 'Allows detecting when user is idle.',
			},
			{
				name: 'magnetometer',
				displayName: 'magnetometer',
				description: 'Allows access to magnetometer sensor data.',
			},
			{
				name: 'midi',
				displayName: 'midi',
				description: 'Allows access to MIDI devices.',
			},
			{
				name: 'publickey-credentials-get',
				displayName: 'publickey-credentials-get',
				description: 'Allows access to WebAuthn API.',
			},
			{
				name: 'screen-wake-lock',
				displayName: 'screen-wake-lock',
				description: 'Allows keeping screen awake.',
			},
			{
				name: 'serial',
				displayName: 'serial',
				description: 'Allows access to Web Serial API.',
			},
			{
				name: 'speaker-selection',
				displayName: 'speaker-selection',
				description: 'Allows selection of audio output devices.',
			},
			{
				name: 'usb',
				displayName: 'usb',
				description: 'Allows access to WebUSB API.',
			},
			{
				name: 'xr-spatial-tracking',
				displayName: 'xr-spatial-tracking',
				description: 'Allows access to WebXR spatial tracking.',
			}
		]
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
];
const stylePropertiesDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	iframe: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
