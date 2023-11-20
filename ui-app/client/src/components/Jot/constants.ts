import { duplicate } from '@fincity/kirun-js';
import { setData } from '../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../types/common';
import { shortUUID } from '../../util/shortUUID';
import { runEvent } from '../util/runEvent';

export const LOCAL_STORAGE_PREFIX = window.isDesignMode ? 'designMode_' : '';

export const DEFAULT_PAPER = {
	paperId: shortUUID(),
	name: 'Paper 1',
	shapes: [],
};

export const DEFAULT_DOCUMENT = {
	name: 'Untitled Doc',
	defaultPaperSize: 'INFINITE',
	defaultPaperColor: '#FFFFFF',
	defaultPaperBackround: 'DOTTED',
	currentPaperId: DEFAULT_PAPER.paperId,
	version: 1,
	papers: [duplicate(DEFAULT_PAPER)],
};

export function savePersonalizationCurry(
	personalizationPath: string,
	pageName: string,
	onChangePersonalization: any,
	locationHistory: Array<LocationHistory>,
	pageDefinition: PageDefinition,
) {
	if (!onChangePersonalization) return (key: string, value: any) => {};
	let handle: any = -1;

	return (key: string, value: any) => {
		if (handle !== -1) clearTimeout(handle);

		setData(`${personalizationPath}.${key}`, value, pageName);
		handle = setTimeout(() => {
			(async () =>
				await runEvent(
					onChangePersonalization,
					'pageEditorSave',
					pageName,
					locationHistory,
					pageDefinition,
				))();
		}, 2000);
	};
}
