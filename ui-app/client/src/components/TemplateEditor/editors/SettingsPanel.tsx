import React from 'react';
import { TemplateTypeKey } from '../util/templateTypes';

interface SettingsPanelProps {
	template: any;
	type: TemplateTypeKey;
	onChange: (t: any) => void;
}

// Template-level settings: language resolution + per-type delivery/render options.
export default function SettingsPanel({ template, type, onChange }: Readonly<SettingsPanelProps>) {
	const set = (field: string, val: any) => onChange({ ...(template ?? {}), [field]: val });

	return (
		<div className="_settingsPanel">
			<label className="_field">
				<span>Default language</span>
				<input
					value={template?.defaultLanguage ?? ''}
					placeholder="en"
					onChange={e => set('defaultLanguage', e.target.value)}
				/>
			</label>
			<label className="_field">
				<span>Language expression (FreeMarker)</span>
				<input
					value={template?.languageExpression ?? ''}
					placeholder="${user.language!'en'}"
					onChange={e => set('languageExpression', e.target.value)}
				/>
			</label>

			{type === 'email' && (
				<>
					<label className="_field">
						<span>From expression</span>
						<input
							value={template?.fromExpression ?? ''}
							placeholder="${from!'no-reply@example.com'}"
							onChange={e => set('fromExpression', e.target.value)}
						/>
					</label>
					<label className="_field">
						<span>To expression (; separated)</span>
						<input
							value={template?.toExpression ?? ''}
							placeholder="${email}"
							onChange={e => set('toExpression', e.target.value)}
						/>
					</label>
				</>
			)}

			{type === 'pdf' && (
				<div className="_pdfHint">
					<p>
						<strong>PDF page setup</strong>
					</p>
					<p>
						Control page size, margins and running headers/footers with CSS{' '}
						<code>@page</code> inside the body HTML:
					</p>
					<pre>{`@page {
  size: A4;
  margin: 20mm;
  @top-center { content: "Header"; }
  @bottom-right { content: "Page " counter(page); }
}`}</pre>
				</div>
			)}
		</div>
	);
}
