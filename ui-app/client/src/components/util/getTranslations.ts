import React from 'react';
import { getData } from '../../context/StoreContext';

export function getTranslations(
	key: string,
	languageObject: { [key: string]: { [key: string]: string } },
) {
	if (!languageObject) return key;
	const lang = getData('Store.currentLanguage') ?? 'en';
	if (!languageObject[lang]) return key;
	return languageObject[lang][key] ?? key;
}
