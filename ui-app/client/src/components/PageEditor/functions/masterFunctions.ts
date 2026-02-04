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
					frame!.contentWindow?.postMessage({
						type: 'EDITOR_TYPE',
						payload: { type: 'PAGE', screenType },
					});

					frame!.contentWindow?.postMessage({
						type: 'EDITOR_DEFINITION',
						payload: options.editPageDefinition,
					});

					frame!.contentWindow?.postMessage({
						type: 'EDITOR_PERSONALIZATION',
						payload: options.personalization,
					});
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
	['SLAVE_CONTEXT_MENU', (options, payload) => options.onContextMenu(payload)],
	['SLAVE_STORE', (options, payload) => options.onSlaveStore(options.screenType, payload)],
	['SLAVE_COMP_CHANGED', (options, payload) => options.operations.componentChanged(payload)],
	[
		'SLAVE_COMP_PROP_CHANGED',
		(options, payload) => options.operations.componentPropChanged(payload),
	],
	['SLAVE_DEBUG_EXECUTION', (options, payload) => options.onDebugExecution?.(payload)],
]);

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
