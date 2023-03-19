import { ContextMenuDetails } from '../components/ContextMenu';
import PageOperations from './PageOperations';

interface MasterFunctionOptions {
	iframe: HTMLIFrameElement;
	editPageDefinition: any;
	defPath: string | undefined;
	personalization: any;
	personalizationPath: string | undefined;
	onSelectedComponentChange: (key: string) => void;
	operations: PageOperations;
	onContextMenu: (m: ContextMenuDetails) => void;
}
export const MASTER_FUNCTIONS = new Map<
	string,
	(options: MasterFunctionOptions, payload: any) => void
>([
	[
		'SLAVE_STARTED',
		options => {
			options.iframe.contentWindow?.postMessage({
				type: 'EDITOR_TYPE',
				payload: 'PAGE',
			});

			options.iframe.contentWindow?.postMessage({
				type: 'EDITOR_DEFINITION',
				payload: options.editPageDefinition,
			});

			options.iframe.contentWindow?.postMessage({
				type: 'EDITOR_PERSONALIZATION',
				payload: options.personalization,
			});
		},
	],
	['SLAVE_SELECTED', (options, payload) => options?.onSelectedComponentChange(payload)],
	[
		'SLAVE_DROPPED_SOMETHING',
		(options, { componentKey, droppedData }) =>
			options.operations.droppedOn(componentKey, droppedData),
	],
	['SLAVE_CONTEXT_MENU', (options, payload) => options.onContextMenu(payload)],
]);
