import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';

/**
 * A full screen picture viewer (lightbox) for pictures shown small inside text, such as the
 * pictures attached to a comment.
 *
 * It is opened from code, not rendered by a component: the markdown parser has no place in the
 * page tree to keep it, so `openImageLightbox` mounts one viewer at the end of the body and takes
 * it away when it is closed. Only one viewer is open at a time.
 *
 * The picture is shown at its own size and shape (never stretched or cropped): it only shrinks to
 * fit the window. Several pictures from the same place can be paged with the arrow buttons or the
 * Left and Right keys. Escape, the close button or a click outside the picture closes it.
 *
 * Secured files are not fetched here. The caller passes the address the small picture already
 * loaded (the blob address of the secured file), so the viewer shows the same full file at once.
 */
export interface LightboxImage {
	src: string;
	alt?: string;
}

/** Pictures in text that opens them get the zoom cursor. One rule for the page, added the first time it is needed. */
export function ensureLightboxCursor(): void {
	if (typeof document === 'undefined' || document.getElementById('image-lightbox-cursor')) return;
	const style = document.createElement('style');
	style.id = 'image-lightbox-cursor';
	style.textContent = '._markdown._lightboxImages img._images { cursor: zoom-in; }';
	document.head.appendChild(style);
}

let host: HTMLDivElement | undefined;
let root: Root | undefined;
let previousFocus: Element | null = null;

export function closeImageLightbox(): void {
	root?.unmount();
	host?.remove();
	root = undefined;
	host = undefined;
	if (previousFocus instanceof HTMLElement) previousFocus.focus();
	previousFocus = null;
}

export function openImageLightbox(images: LightboxImage[], index = 0): void {
	const list = images.filter(i => !!i.src);
	if (!list.length || typeof document === 'undefined') return;
	if (root) closeImageLightbox();
	previousFocus = document.activeElement;
	host = document.createElement('div');
	host.setAttribute('data-image-lightbox', '');
	document.body.appendChild(host);
	root = createRoot(host);
	root.render(
		<ImageLightbox images={list} start={Math.min(Math.max(index, 0), list.length - 1)} />,
	);
}

const BUTTON: React.CSSProperties = {
	position: 'absolute',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: 40,
	height: 40,
	padding: 0,
	border: 'none',
	borderRadius: '50%',
	background: 'rgba(255,255,255,0.16)',
	color: '#fff',
	fontSize: 22,
	lineHeight: 1,
	cursor: 'pointer',
};

export function ImageLightbox({
	images,
	start,
}: Readonly<{ images: LightboxImage[]; start: number }>) {
	const [index, setIndex] = useState(start);
	const closeRef = useRef<HTMLButtonElement>(null);
	const many = images.length > 1;

	const step = useCallback(
		(by: number) => setIndex(i => (i + by + images.length) % images.length),
		[images.length],
	);

	useEffect(() => {
		closeRef.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeImageLightbox();
			else if (many && e.key === 'ArrowLeft') step(-1);
			else if (many && e.key === 'ArrowRight') step(1);
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [many, step]);

	const current = images[index];
	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label={current.alt || 'Picture'}
			onClick={closeImageLightbox}
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 2147483000,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'rgba(0,0,0,0.86)',
			}}
		>
			<img
				src={current.src}
				alt={current.alt ?? ''}
				onClick={e => e.stopPropagation()}
				style={{
					maxWidth: '92vw',
					maxHeight: '88vh',
					objectFit: 'contain',
					background: '#fff',
					boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
				}}
			/>
			<button
				ref={closeRef}
				type="button"
				aria-label="Close"
				onClick={e => {
					e.stopPropagation();
					closeImageLightbox();
				}}
				style={{ ...BUTTON, top: 16, right: 16 }}
			>
				×
			</button>
			{many && (
				<>
					<button
						type="button"
						aria-label="Previous picture"
						onClick={e => {
							e.stopPropagation();
							step(-1);
						}}
						style={{ ...BUTTON, left: 16, top: '50%', transform: 'translateY(-50%)' }}
					>
						‹
					</button>
					<button
						type="button"
						aria-label="Next picture"
						onClick={e => {
							e.stopPropagation();
							step(1);
						}}
						style={{ ...BUTTON, right: 16, top: '50%', transform: 'translateY(-50%)' }}
					>
						›
					</button>
					<div
						style={{
							position: 'absolute',
							bottom: 16,
							left: 0,
							right: 0,
							textAlign: 'center',
							color: '#fff',
							fontSize: 13,
						}}
					>
						{index + 1} / {images.length}
					</div>
				</>
			)}
		</div>
	);
}
