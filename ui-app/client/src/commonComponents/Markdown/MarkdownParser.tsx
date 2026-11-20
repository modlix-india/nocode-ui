import { deepEqual } from '@fincity/kirun-js';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { cyrb53 } from '../../util/cyrb53';
import { shortUUID } from '../../util/shortUUID';
import { parseFootNotesSection } from './parseFootNotesSection';
import { parseTextLine } from './parseTextLine';
import { makeRefsAndRemove } from './utils';
import { ensureLightboxCursor, openImageLightbox } from '../../components/util/ImageLightbox';

export function MarkdownParser({
	componentKey,
	text,
	styles,
	editable,
	onChange,
	className = '',
	imageLightbox = false,
}: Readonly<{
	componentKey: string;
	text: string;
	styles: any;
	editable?: boolean;
	onChange?: (text: string) => void;
	className?: string;
	/** A click on a picture opens it large (all the pictures of this text can be paged). Off while editing. */
	imageLightbox?: boolean;
}>) {
	const [_, setStyleState] = React.useState(styles);
	const [key, setKey] = React.useState(shortUUID());
	const location = useLocation();

	React.useEffect(() => {
		setStyleState((existing: any) => {
			if (deepEqual(existing, styles)) return existing;
			setKey(shortUUID());
			return styles;
		});
	}, [styles, setKey]);

	const lines = text.split('\n');
	let comps: Array<React.JSX.Element | undefined> = [];

	const { footNoteRefs, urlRefs } = makeRefsAndRemove(lines);
	const footNotes = { currentRefNumber: 0, footNoteRefs };

	for (let i = 0; i < lines.length; i++) {
		let { lineNumber, comp } = parseTextLine({
			componentKey,
			lines,
			lineNumber: i,
			editable,
			styles,
			footNotes,
			urlRefs,
			location,
		});
		i = lineNumber;
		if (Array.isArray(comp)) comps.push(...comp);
		else comps.push(comp);
	}

	comps.push(
		...parseFootNotesSection({
			componentKey,
			lines: [],
			lineNumber: lines.length,
			editable,
			styles,
			footNotes,
			urlRefs,
			location,
		}),
	);

	const lightbox = imageLightbox && !editable;
	if (lightbox) ensureLightboxCursor();

	return (
		<div
			key={`${key}-${cyrb53(text)}`}
			className={`_markdown ${lightbox ? '_lightboxImages ' : ''}${className}`}
			style={styles.markdownContainer ?? {}}
			onClick={lightbox ? openClickedPicture : undefined}
		>
			{comps}
		</div>
	);
}

/**
 * A click inside a text with pictures: when it lands on a picture, open the viewer on it with every
 * picture of the same text. The address is the one the small picture already loaded, so a secured
 * file (fetched with the sign in token) needs no second request.
 */
function openClickedPicture(e: React.MouseEvent<HTMLDivElement>) {
	const target = e.target as HTMLElement;
	if (!(target instanceof HTMLImageElement) || !target.classList.contains('_images')) return;
	if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
	const src = target.currentSrc || target.src;
	if (!src) return;
	e.preventDefault();
	const all = Array.from(e.currentTarget.querySelectorAll<HTMLImageElement>('img._images'))
		.filter(img => img.currentSrc || img.src)
		.map(img => ({ src: img.currentSrc || img.src, alt: img.alt }));
	openImageLightbox(
		all,
		Math.max(
			all.findIndex(i => i.src === src),
			0,
		),
	);
}
