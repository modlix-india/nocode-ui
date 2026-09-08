import { duplicate } from '@fincity/kirun-js';
import { ContextMenuDetails } from '../components/ContextMenu';
import { PageOperations } from './PageOperations';

interface MasterFunctionOptions {
	screenType: 'desktop' | 'tablet' | 'mobile';
	desktopIframe: HTMLIFrameElement | null;
	tabletIframe: HTMLIFrameElement | null;
	mobileIframe: HTMLIFrameElement | null;
	editPageDefinition: any;
	defPath: string | undefined;
	personalization: any;
	personalizationPath: string | undefined;
	onSelectedComponentChange: (key: string, multi: boolean) => void;
	onSelectedSubComponentChange: (key: string) => void;
	operations: PageOperations;
	onContextMenu: (m: ContextMenuDetails) => void;
	onSlaveStore: (screenType: string, payload: any) => void;
	selectedComponent: string;
	styleSelectorPref: any;
	setStyleSelectorPref: (pref: any) => void;
	onDebugExecution?: (debugMessage: any) => void;
	onDefinitionIgnored?: (detail: { wanted: string; showing: string | null }) => void;
}
export const MASTER_FUNCTIONS = new Map<
	string,
	(options: MasterFunctionOptions, payload: any) => void
>([
	[
		'SLAVE_STARTED',
		options => {
			[
				{ frame: options.desktopIframe, screenType: 'desktop' },
				{ frame: options.tabletIframe, screenType: 'tablet' },
				{ frame: options.mobileIframe, screenType: 'mobile' },
			]
				.filter(obj => obj.frame != undefined || obj.frame != null)
				.forEach(({ frame, screenType }) => {
					// The '*' is load-bearing. postMessage(msg) with no target origin
					// takes the options overload, whose targetOrigin defaults to '/'
					// -- same origin as the sender -- so the message is dropped
					// silently, with no error, for a cross-origin frame. The canvases
					// run on their own draft-edit hostname, and EDITOR_TYPE is what
					// turns design mode on inside them: without it the helper
					// components never render and nothing in the canvas is selectable.
					frame!.contentWindow?.postMessage(
						{ type: 'EDITOR_TYPE', payload: { type: 'PAGE', screenType } },
						'*',
					);

					frame!.contentWindow?.postMessage(
						{ type: 'EDITOR_DEFINITION', payload: options.editPageDefinition },
						'*',
					);

					frame!.contentWindow?.postMessage(
						{ type: 'EDITOR_PERSONALIZATION', payload: options.personalization },
						'*',
					);
				});
		},
	],
	[
		'SLAVE_SELECTED',
		(options, payload) => {
			options?.onSelectedComponentChange(payload, false);
			udpateDeviceSelection(payload, options);
		},
	],
	[
		'SLAVE_SELECTED_MULTI',
		(options, payload) => {
			options?.onSelectedComponentChange(payload, true);
			udpateDeviceSelection(options.selectedComponent, options);
		},
	],
	['SLAVE_SELECTED_SUB', (options, payload) => options?.onSelectedSubComponentChange(payload)],
	[
		'SLAVE_DROPPED_SOMETHING',
		(options, { componentKey, droppedData }) =>
			options.operations.droppedOn(componentKey, droppedData),
	],
	[
		'SLAVE_CONTEXT_MENU',
		(options, payload) =>
			options.onContextMenu({
				...payload,
				menuPosition: toMasterPosition(payload?.menuPosition, options),
			}),
	],
	['SLAVE_STORE', (options, payload) => options.onSlaveStore(options.screenType, payload)],
	['SLAVE_COMP_CHANGED', (options, payload) => options.operations.componentChanged(payload)],
	[
		'SLAVE_COMP_PROP_CHANGED',
		(options, payload) => options.operations.componentPropChanged(payload),
	],
	['SLAVE_DEBUG_EXECUTION', (options, payload) => options.onDebugExecution?.(payload)],
	// The preview navigated away, so it refused a definition push. Surfaced
	// rather than swallowed: without it, every edit silently does nothing.
	['SLAVE_DEFINITION_IGNORED', (options, payload) => options.onDefinitionIgnored?.(payload)],
]);

/**
 * A point in the preview's own viewport, placed in the editor's.
 *
 * The slave used to do this itself by reading the iframe element out of
 * `parent.window.document`. That is cross-origin now the preview runs on its own
 * draft-edit hostname, so it sends raw `clientX/clientY` and the arithmetic moved
 * here, where the element and its scale factor already are.
 */
function toMasterPosition(
	point: { x: number; y: number } | undefined,
	options: MasterFunctionOptions,
): { x: number; y: number } {
	if (!point) return { x: 0, y: 0 };

	const frames = {
		tablet: options.tabletIframe,
		mobile: options.mobileIframe,
		desktop: options.desktopIframe,
	};
	const frame = frames[options.screenType] ?? options.desktopIframe;

	if (!frame) return point;

	const rect = frame.getBoundingClientRect();
	const sf = frame.dataset.scaleFactor ? Number.parseInt(frame.dataset.scaleFactor) : 1;

	return { x: point.x * sf + rect.left, y: point.y * sf + rect.top };
}

function udpateDeviceSelection(key: string, options: MasterFunctionOptions) {
	if (!key) return;

	const newPrefs = duplicate(options.styleSelectorPref ?? {});
	if (!newPrefs[key]) newPrefs[key] = {};
	if (options.screenType === 'desktop' && !newPrefs[key].screenSize) {
		return;
	}

	if (options.screenType === 'desktop') {
		delete newPrefs[key].screenSize;
	} else {
		newPrefs[key].screenSize = {
			value:
				options.screenType === 'tablet'
					? 'TABLET_LANDSCAPE_SCREEN_SMALL'
					: 'MOBILE_LANDSCAPE_SCREEN_SMALL',
		};
	}
	options.setStyleSelectorPref(newPrefs);
}
