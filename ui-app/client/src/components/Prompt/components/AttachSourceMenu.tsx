import React, { useEffect, useRef, useState } from 'react';
import { FileBrowser } from '../../../commonComponents/FileBrowser';
import { Attachment, pickedFileAttachment } from '../attachments';

/**
 * The chat's attach button with its three doors: a file off this machine, or one the client
 * already holds in its static or secured files. The last two open the platform's own FileBrowser
 * (the one BoardChat and the page editor open), not a second implementation of it.
 *
 * Shared by Prompt's input bar and the draft agent's compact composer. Its classes are global and
 * prefixed `_mlxAttach`, styled by ATTACH_SOURCE_MENU_CSS, because the draft agent sits on top of
 * someone else's app and takes no styles from it.
 */
export type FileStore = 'static' | 'secured';

interface AttachSourceMenuProps {
	disabled?: boolean;
	buttonClassName: string;
	icon: string;
	title?: string;
	/** Opens the host's hidden `<input type=file>`. */
	onUploadClick: () => void;
	onPick: (attachment: Attachment, store: FileStore) => void;
	/** Opens the menu above the button (an input bar at the bottom) or below it. */
	direction?: 'up' | 'down';
}

export function AttachSourceMenu({
	disabled,
	buttonClassName,
	icon,
	title = 'Add attachment',
	onUploadClick,
	onPick,
	direction = 'up',
}: Readonly<AttachSourceMenuProps>) {
	const [open, setOpen] = useState(false);
	const [browsing, setBrowsing] = useState<FileStore | null>(null);
	const wrapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const close = (e: MouseEvent) => {
			if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', close);
		return () => document.removeEventListener('mousedown', close);
	}, [open]);

	const choose = (action: () => void) => () => {
		setOpen(false);
		action();
	};

	return (
		<div className="_mlxAttachWrap" ref={wrapRef}>
			<button
				type="button"
				className={buttonClassName}
				onClick={() => setOpen(o => !o)}
				disabled={disabled}
				title={title}
				aria-label={title}
				aria-expanded={open}
			>
				<i className={icon} />
			</button>
			{open ? (
				<div
					className={`_mlxAttachMenu ${direction === 'down' ? '_down' : ''}`}
					role="menu"
				>
					<button type="button" role="menuitem" onClick={choose(onUploadClick)}>
						Upload from this device
					</button>
					<button
						type="button"
						role="menuitem"
						onClick={choose(() => setBrowsing('static'))}
					>
						Choose from static files
					</button>
					<button
						type="button"
						role="menuitem"
						onClick={choose(() => setBrowsing('secured'))}
					>
						Choose from secured files
					</button>
				</div>
			) : null}
			{browsing ? (
				<div className="_mlxAttachBrowserBackdrop" onClick={() => setBrowsing(null)}>
					<div className="_mlxAttachBrowserPanel" onClick={e => e.stopPropagation()}>
						<div className="_mlxAttachBrowserTitle">
							<span>{browsing === 'secured' ? 'Secured files' : 'Static files'}</span>
							<button
								type="button"
								onClick={() => setBrowsing(null)}
								aria-label="Close"
							>
								×
							</button>
						</div>
						<FileBrowser
							resourceType={browsing}
							editOnUpload={false}
							allowMultipleSelection={false}
							selectedFile={''}
							onChange={(url: string, _type: string, directory: boolean) => {
								if (directory || !url) return;
								const store = browsing;
								onPick(
									pickedFileAttachment(
										String(url),
										`att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
									),
									store,
								);
								setBrowsing(null);
							}}
						/>
					</div>
				</div>
			) : null}
		</div>
	);
}

/** The menu and the browser frame. Global classes: see the component's comment. */
export const ATTACH_SOURCE_MENU_CSS = `
._mlxAttachWrap { position: relative; display: inline-flex; }
._mlxAttachMenu {
	position: absolute;
	bottom: calc(100% + 6px);
	left: 0;
	z-index: 2147483000;
	display: flex;
	flex-direction: column;
	min-width: 200px;
	padding: 4px;
	border-radius: 8px;
	border: 1px solid rgba(17, 24, 39, 0.12);
	background: #ffffff;
	box-shadow: 0 6px 24px rgba(17, 24, 39, 0.12);
	font: 500 13px/1.3 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
._mlxAttachMenu._down { bottom: auto; top: calc(100% + 6px); }
._mlxAttachMenu button {
	all: unset;
	cursor: pointer;
	text-align: left;
	padding: 7px 9px;
	border-radius: 6px;
	color: #374151;
}
._mlxAttachMenu button:hover { background: #f3f4f6; color: #111827; }
._mlxAttachBrowserBackdrop {
	position: fixed;
	inset: 0;
	z-index: 2147483001;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.35);
}
._mlxAttachBrowserPanel {
	width: min(920px, 92vw);
	height: min(620px, 82vh);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	border-radius: 10px;
	background: #ffffff;
	box-shadow: 0 18px 60px rgba(0, 0, 0, 0.25);
}
._mlxAttachBrowserTitle {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 14px;
	border-bottom: 1px solid rgba(17, 24, 39, 0.1);
	font: 600 14px/1.3 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
	color: #111827;
}
._mlxAttachBrowserTitle button {
	all: unset;
	cursor: pointer;
	font-size: 20px;
	line-height: 1;
	color: #6b7280;
	padding: 0 4px;
}
._mlxAttachBrowserPanel > :last-child { flex: 1; min-height: 0; }
`;
