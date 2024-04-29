import { languages } from 'monaco-editor';
import React, { useEffect } from 'react';
import { DesktopIcon, MobileIcon, TabletIcon } from './EmailEditorIcons';

const LANGUAGE_CODES = [
	'ab',
	'aa',
	'af',
	'ak',
	'sq',
	'am',
	'ar',
	'an',
	'hy',
	'as',
	'av',
	'ae',
	'ay',
	'az',
	'bm',
	'ba',
	'eu',
	'be',
	'bn',
	'bi',
	'bs',
	'br',
	'bg',
	'my',
	'ca',
	'ch',
	'ce',
	'ny',
	'zh',
	'cu',
	'cv',
	'kw',
	'co',
	'cr',
	'hr',
	'cs',
	'da',
	'dv',
	'nl',
	'dz',
	'en',
	'eo',
	'et',
	'ee',
	'fo',
	'fj',
	'fi',
	'fr',
	'fy',
	'ff',
	'gd',
	'gl',
	'lg',
	'ka',
	'de',
	'el',
	'kl',
	'gn',
	'gu',
	'ht',
	'ha',
	'he',
	'hz',
	'hi',
	'ho',
	'hu',
	'is',
	'io',
	'ig',
	'id',
	'ia',
	'ie',
	'iu',
	'ik',
	'ga',
	'it',
	'ja',
	'jv',
	'kn',
	'kr',
	'ks',
	'kk',
	'km',
	'ki',
	'rw',
	'ky',
	'kv',
	'kg',
	'ko',
	'kj',
	'ku',
	'lo',
	'la',
	'lv',
	'li',
	'ln',
	'lt',
	'lu',
	'lb',
	'mk',
	'mg',
	'ms',
	'ml',
	'mt',
	'gv',
	'mi',
	'mr',
	'mh',
	'mn',
	'na',
	'nv',
	'nd',
	'nr',
	'ng',
	'ne',
	'no',
	'nb',
	'nn',
	'ii',
	'oc',
	'oj',
	'or',
	'om',
	'os',
	'pi',
	'ps',
	'fa',
	'pl',
	'pt',
	'pa',
	'qu',
	'ro',
	'rm',
	'rn',
	'ru',
	'se',
	'sm',
	'sg',
	'sa',
	'sc',
	'sr',
	'sn',
	'sd',
	'si',
	'sk',
	'sl',
	'so',
	'st',
	'es',
	'su',
	'sw',
	'ss',
	'sv',
	'tl',
	'ty',
	'tg',
	'ta',
	'tt',
	'te',
	'th',
	'bo',
	'ti',
	'to',
	'ts',
	'tn',
	'tr',
	'tk',
	'tw',
	'ug',
	'uk',
	'ur',
	'uz',
	've',
	'vi',
	'vo',
	'wa',
	'cy',
	'wo',
	'xh',
	'yi',
	'yo',
	'za',
	'zu',
];

export default function EmailEditor({
	template = {},
	onChange,
}: {
	template: any;
	onChange: (template: any) => void;
}) {
	const [currentLanguage, setCurrentLanguage] = React.useState<string>('en');
	const [pageMode, setPageMode] = React.useState<string>('DESKTOP');

	return (
		<>
			<div className="editor">
				<div className="textEditors">
					<div className="language">
						Language:
						<select
							value={currentLanguage}
							onChange={v => setCurrentLanguage(v.target.value)}
						>
							{LANGUAGE_CODES.map(e => (
								<option key={e} value={e}>
									{e}
								</option>
							))}
						</select>
					</div>
					<span className="label">Subject :</span>
					<input
						value={template[currentLanguage]?.subject ?? ''}
						onChange={v =>
							onChange({
								...template,
								[currentLanguage]: {
									body: template?.[currentLanguage]?.body ?? '',
									subject: v.target.value,
								},
							})
						}
					/>
					<span className="label">Body :</span>
					<textarea
						value={template[currentLanguage]?.body ?? ''}
						onChange={v =>
							onChange({
								...template,
								[currentLanguage]: {
									body: v.target.value,
									subject: template?.[currentLanguage]?.subject ?? '',
								},
							})
						}
					></textarea>
				</div>
				<div className="iframeContainer">
					<div className="deviceSizes">
						<div
							className={`_icon ${pageMode == 'DESKTOP' ? '_selected' : ''}`}
							onClick={() => setPageMode('DESKTOP')}
						>
							<DesktopIcon />
						</div>
						<div
							className={`_icon ${pageMode == 'TABLET' ? '_selected' : ''}`}
							onClick={() => setPageMode('TABLET')}
						>
							<TabletIcon />
						</div>
						<div
							className={`_icon ${pageMode == 'MOBILE' ? '_selected' : ''}`}
							onClick={() => setPageMode('MOBILE')}
						>
							<MobileIcon />
						</div>
					</div>
					<iframe
						className={`${pageMode}`}
						srcDoc={template[currentLanguage]?.body ?? '--NO BODY--'}
					></iframe>
				</div>
			</div>
		</>
	);
}
