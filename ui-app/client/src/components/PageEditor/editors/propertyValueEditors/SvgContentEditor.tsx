import { duplicate } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import { ComponentDefinition } from '../../../../types/common';
import { sanitizeSvg } from '../../../Svg/sanitizeSvg';
import { fetchSvgText, resolveSvgUrl } from '../../../Svg/svgSource';
import { PageOperations } from '../../functions/PageOperations';
import { SvgEditorModal } from '../svgEditor/SvgEditorModal';

interface SvgContentEditorProps {
	value: string;
	onChange: (markup: string) => void;
	pageOperations: PageOperations;
	selectedComponent?: string;
}

export function SvgContentEditor({
	value,
	onChange,
	pageOperations,
	selectedComponent,
}: Readonly<SvgContentEditorProps>) {
	const [draft, setDraft] = useState(value ?? '');
	const [open, setOpen] = useState(false);
	const [initialMarkup, setInitialMarkup] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => setDraft(value ?? ''), [value]);

	const commitDraft = () => {
		if (draft !== (value ?? '')) onChange(draft);
	};

	// On edit-start: if svgContent is empty but src is set, fetch+sanitize the
	// source, store it as svgContent, and clear src (the component becomes
	// markup-owned). Returns the markup to seed the editor with.
	const resolveMarkupForEdit = async (): Promise<string | undefined> => {
		const def = selectedComponent
			? pageOperations.getComponentDefinition(selectedComponent)
			: undefined;
		const content = (def?.properties?.svgContent?.value as string) ?? draft ?? '';
		if (content) return content;

		const src = def?.properties?.src?.value as string | undefined;
		if (!src || !def) return '';

		const markup = sanitizeSvg(await fetchSvgText(resolveSvgUrl(src, window.location)));
		if (!markup) {
			setError(
				'Could not load the SVG from its source (a cross-origin source may block fetching). Paste markup instead.',
			);
			return undefined;
		}

		const newDef = duplicate(def) as ComponentDefinition;
		if (!newDef.properties) newDef.properties = {};
		newDef.properties.svgContent = { value: markup };
		delete newDef.properties.src;
		pageOperations.componentChanged(newDef);
		return markup;
	};

	const openEditor = async () => {
		setError('');
		setBusy(true);
		try {
			const markup = await resolveMarkupForEdit();
			if (markup === undefined) return; // fetch failed; error already shown
			setInitialMarkup(markup);
			setOpen(true);
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="_svgContentEditor">
			<div className="_smallEditorContainer">
				<textarea
					className="_peInput"
					value={draft}
					placeholder="<svg>...</svg>"
					onChange={e => setDraft(e.target.value)}
					onBlur={commitDraft}
					onKeyDown={e => {
						if (e.key === 'Escape') setDraft(value ?? '');
					}}
				/>
				<button
					type="button"
					className="_pillTag fa fa-solid fa-vector-square"
					title="Open SVG editor"
					disabled={busy || !selectedComponent}
					onClick={openEditor}
				/>
			</div>
			{error ? <div className="_svgContentEditorError">{error}</div> : null}
			{open ? (
				<SvgEditorModal
					initialMarkup={initialMarkup}
					onSave={onChange}
					onClose={() => setOpen(false)}
				/>
			) : null}
		</div>
	);
}
