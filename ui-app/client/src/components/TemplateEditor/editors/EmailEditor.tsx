import React from 'react';
import { DesktopIcon, MobileIcon, TabletIcon } from './EmailEditorIcons';
import { LANGUAGE_CODES } from '../commons';

export default function EmailEditor({
	template = {},
	onChange,
}: Readonly<{
	template: any;
	onChange: (template: any) => void;
}>) {
	const [currentLanguage, setCurrentLanguage] = React.useState<string>('en');
	const [pageMode, setPageMode] = React.useState<string>('DESKTOP');

	return (
	<div className="editor">
		<div className="textEditors">
			<div className="language">
				Language: <select
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
				<button
					className={`_icon ${pageMode == 'DESKTOP' ? '_selected' : ''}`}
					onClick={() => setPageMode('DESKTOP')}
				>
					<DesktopIcon />
				</button>
				<button
					className={`_icon ${pageMode == 'TABLET' ? '_selected' : ''}`}
					onClick={() => setPageMode('TABLET')}
				>
					<TabletIcon />
				</button>
				<button
					className={`_icon ${pageMode == 'MOBILE' ? '_selected' : ''}`}
					onClick={() => setPageMode('MOBILE')}
				>
					<MobileIcon />
				</button>
			</div>
			<iframe
				title="Email Editor"
				className={`${pageMode}`}
				srcDoc={template[currentLanguage]?.body ?? '--NO BODY--'}
			></iframe>
		</div>
	</div>
	);
}
