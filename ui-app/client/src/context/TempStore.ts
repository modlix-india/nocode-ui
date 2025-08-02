import { duplicate, ObjectValueSetterExtractor } from '@fincity/kirun-js';
import { TEMP_STORE_PREFIX } from '../constants';

const tempStore = {};

export const tempStoreExtractor = new ObjectValueSetterExtractor(
	tempStore,
	`${TEMP_STORE_PREFIX}.`,
);

globalThis.getTempStore = () => duplicate(tempStoreExtractor.getStore());

export function makeTempPath(path: string, pageName: string): string {
	const index = path.indexOf('.');
	if (index === -1) return `${TEMP_STORE_PREFIX}.${path}`;
	if (path.startsWith('Page.'))
		return `${TEMP_STORE_PREFIX}._page.${pageName}.${path.substring(index + 1)}`;
	return `${TEMP_STORE_PREFIX}._${path.substring(0, index)}.${path.substring(index + 1)}`;
}
