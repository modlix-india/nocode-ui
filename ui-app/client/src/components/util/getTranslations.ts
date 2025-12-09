import { LOCAL_STORE_PREFIX } from '../../constants';
import { getDataFromPath ,UrlDetailsExtractor} from '../../context/StoreContext';

export function getTranslations(
	key: string | undefined,
	languageObject: { [key: string]: { [key: string]: string } },
) {
	if (!key) return key;
	if (!languageObject) return key;
	const lang = getDataFromPath(`${LOCAL_STORE_PREFIX}.currentLanguage`, []) ?? 'en';
	if (!languageObject[lang]) return key;
	return languageObject[lang][key] ?? key;
}
