import { getDataFromPath } from '../../context/StoreContext';

export function getTranslations(
	key: string | undefined,
	languageObject: { [key: string]: { [key: string]: string } },
) {
	if (!key) return key;
	if (!languageObject) return key;
	const lang = getDataFromPath('Store.currentLanguage', []) ?? 'en';
	if (!languageObject[lang]) return key;
	return languageObject[lang][key] ?? key;
}
