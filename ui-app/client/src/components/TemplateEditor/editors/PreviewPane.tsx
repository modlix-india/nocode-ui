import React from 'react';
import { DesktopIcon, MobileIcon, TabletIcon } from './EmailEditorIcons';
import { PreviewFormat } from '../util/templateTypes';

export type PreviewDevice = 'DESKTOP' | 'TABLET' | 'MOBILE';

interface PreviewPaneProps {
	format: PreviewFormat;
	html?: string;
	pdfUrl?: string;
	loading: boolean;
	error?: string;
	device: PreviewDevice;
	onDevice: (d: PreviewDevice) => void;
	onRefresh: () => void;
	// When present (the type has a subject), the preview shows the subject line as the inbox will:
	// filled with the sample data. It is edited in the editor column, not here.
	subjectValue?: string;
	// The subject as the server rendered it with the sample data (merge fields filled).
	renderedSubject?: string;
}

// Server-rendered preview: iframe for html, embedded pdf for pdf, styled text for whatsapp/sms.
export default function PreviewPane({
	format,
	html,
	pdfUrl,
	loading,
	error,
	device,
	onDevice,
	onRefresh,
	subjectValue,
	renderedSubject,
}: Readonly<PreviewPaneProps>) {
	// Until the first render comes back, a subject without merge fields is already what shows.
	let shownSubject = renderedSubject;
	if (typeof shownSubject !== 'string')
		shownSubject = (subjectValue ?? '').includes('${') ? '' : (subjectValue ?? '');
	return (
		<div className="_previewPane">
			<div className="_previewToolbar">
				<span className="_previewTitle">Preview</span>
				{format === 'html' && (
					<div className="_deviceSizes">
						<button
							className={`_icon ${device === 'DESKTOP' ? '_selected' : ''}`}
							onClick={() => onDevice('DESKTOP')}
							title="Desktop"
						>
							<DesktopIcon />
						</button>
						<button
							className={`_icon ${device === 'TABLET' ? '_selected' : ''}`}
							onClick={() => onDevice('TABLET')}
							title="Tablet"
						>
							<TabletIcon />
						</button>
						<button
							className={`_icon ${device === 'MOBILE' ? '_selected' : ''}`}
							onClick={() => onDevice('MOBILE')}
							title="Mobile"
						>
							<MobileIcon />
						</button>
					</div>
				)}
				<button className="_refreshButton" onClick={onRefresh} title="Refresh preview">
					<i className="fa fa-solid fa-rotate-right" /> Refresh
				</button>
				{loading && <span className="_previewLoading">Rendering…</span>}
			</div>

			{subjectValue !== undefined && (
				<div className="_previewSubject">
					<span>Subject</span>
					<strong>{shownSubject.trim() !== '' ? shownSubject : '(no subject)'}</strong>
				</div>
			)}

			{error && <div className="_previewError">{error}</div>}

			<div className="_previewBody">
				{format === 'pdf' &&
					(pdfUrl ? (
						<iframe title="PDF Preview" className="_pdfPreview" src={pdfUrl} />
					) : (
						<div className="_previewPlaceholder">
							{loading
								? 'Rendering PDF…'
								: 'Add content (or switch to Code) to preview the PDF.'}
						</div>
					))}

				{format === 'html' && (
					<div className={`_htmlPreviewWrap ${device}`}>
						<iframe
							title="HTML Preview"
							className={`_htmlPreview ${device}`}
							srcDoc={html ?? '<!-- empty -->'}
						/>
					</div>
				)}

				{format === 'text' && (
					<div className="_textPreview">
						{html && html.trim() !== '' ? (
							html
						) : (
							<span className="_previewPlaceholder">No message content.</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
