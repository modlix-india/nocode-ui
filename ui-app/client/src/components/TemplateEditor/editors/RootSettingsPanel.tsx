import React from 'react';

// Root / body layout options for the visual editor. These feed compileBlocksToHtml's shell
// (page + content background, content width, font). Shown in the right panel in Visual mode when
// no block is selected. Stored on template.design.options and applied when blocks are compiled.
export interface RootOptions {
	maxWidth?: number;
	bodyBg?: string;
	contentBg?: string;
	fontFamily?: string;
}

const FONT_PRESETS: { value: string; label: string }[] = [
	{ value: '', label: 'Default (system)' },
	{ value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
	{ value: "'Inter', -apple-system, Roboto, sans-serif", label: 'Inter' },
	{ value: "Georgia, 'Times New Roman', serif", label: 'Georgia (serif)' },
	{ value: "'Courier New', Courier, monospace", label: 'Courier (mono)' },
];

interface RootSettingsPanelProps {
	options: RootOptions;
	onChange: (patch: RootOptions) => void;
}

export default function RootSettingsPanel({ options, onChange }: Readonly<RootSettingsPanelProps>) {
	const o = options ?? {};
	return (
		<div className="_blockProps _rootSettings">
			<div className="_bpHeader">
				<span>Body &amp; layout</span>
			</div>
			<p className="_panelHint">
				Applies to the whole email frame. Select a block to edit that block instead.
			</p>

			<label className="_bpField">
				<span>Content width (px)</span>
				<input
					className="_bpInput"
					type="number"
					value={o.maxWidth ?? ''}
					placeholder="600"
					onChange={e =>
						onChange({ maxWidth: e.target.value === '' ? undefined : Number(e.target.value) })
					}
				/>
			</label>

			<label className="_bpField">
				<span>Page background</span>
				<div className="_bpColor">
					<input
						type="color"
						value={o.bodyBg ?? '#f4f4f4'}
						onChange={e => onChange({ bodyBg: e.target.value })}
					/>
					<input
						className="_bpInput"
						value={o.bodyBg ?? ''}
						placeholder="#f4f4f4"
						onChange={e => onChange({ bodyBg: e.target.value || undefined })}
					/>
				</div>
			</label>

			<label className="_bpField">
				<span>Content background</span>
				<div className="_bpColor">
					<input
						type="color"
						value={o.contentBg ?? '#ffffff'}
						onChange={e => onChange({ contentBg: e.target.value })}
					/>
					<input
						className="_bpInput"
						value={o.contentBg ?? ''}
						placeholder="#ffffff"
						onChange={e => onChange({ contentBg: e.target.value || undefined })}
					/>
				</div>
			</label>

			<label className="_bpField">
				<span>Font family</span>
				<select
					className="_bpInput"
					value={o.fontFamily ?? ''}
					onChange={e => onChange({ fontFamily: e.target.value || undefined })}
				>
					{FONT_PRESETS.map(f => (
						<option key={f.label} value={f.value}>
							{f.label}
						</option>
					))}
				</select>
			</label>
		</div>
	);
}
