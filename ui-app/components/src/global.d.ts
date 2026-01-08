// Global type declarations for Modlix UI components

declare global {
	// CDN and asset configuration
	var cdnPrefix: string | undefined;
	var cdnReplacePlus: boolean | undefined;
	var cdnResizeOptionsType: string | undefined;
	var cdnStripAPIPrefix: boolean | undefined;
	var __LOCAL_STATIC_PREFIX__: string | null | undefined;

	// Style properties cache
	var styleProperties: Record<string, any>;

	// Application context
	var domainAppCode: string | undefined;
	var domainClientCode: string | undefined;
	var appDefinitionResponse: any;
	var pageDefinitionResponse: any;
	var pageDefinitionRequestPageName: string | undefined;

	// Design mode flags
	var designMode: string | undefined; // 'PAGE', 'FILLER_VALUE_EDITOR', etc.
	var isDesignMode: boolean | undefined;
	var isDebugMode: boolean | undefined;
	var isFullDebugMode: boolean | undefined;

	// Screen and UI state
	var screenType: string | undefined;

	// Store access functions
	var getStore: (() => any) | undefined;
	var getTempStore: (() => any) | undefined;

	// Editor functions
	var fillerValueEditor: any;
	var pageEditor: any;
	var determineRightClickPosition: ((e: MouseEvent) => { x: number; y: number }) | undefined;

	// D3 library (when loaded)
	var d3: any;

	// Window extensions
	interface Window {
		lastInteracted: number | undefined;
		addDesignModeChangeListener: ((callback: () => void) => void) | undefined;
		raiseDesignModeChangeEvent: (() => void) | undefined;
	}
}

export {};
