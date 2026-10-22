import React, { useEffect, useRef, useState } from 'react';
import { FileBrowser } from '../../../commonComponents/FileBrowser';
import { getDataFromPath } from '../../../context/StoreContext';
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
	/** Both browsers open in `/<appCode>`; empty means the app hosting the page. */
	appCode?: string;
}

export function AttachSourceMenu({
	disabled,
	buttonClassName,
	icon,
	title = 'Add attachment',
	onUploadClick,
	onPick,
	direction = 'up',
	appCode,
}: Readonly<AttachSourceMenuProps>) {
	const app = appCode || ((getDataFromPath('Store.application.appCode', []) as string) ?? '');
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
							// The app's own folder first, in either store; empty there, the user
							// goes up a level or uploads, which creates it.
							startLocation={app ? `/${app}` : undefined}
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
/* The FileBrowser's own sheet is sized for the page editor and takes the host app's type and
   button styles, which broke it inside the chat: labels ran into each other, tiles left a ragged
   gap, and the buttons sat against the edge. Inside this panel it gets its own layout. */
._mlxAttachBrowserPanel ._fileBrowser {
	min-width: 0;
	min-height: 0;
	gap: 12px;
	padding: 12px 16px 14px;
	box-sizing: border-box;
	font: 400 13px/1.35 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
	color: #111827;
}
._mlxAttachBrowserPanel ._fileBrowser * { box-sizing: border-box; }
._mlxAttachBrowserPanel ._fileBrowser ._searchUploadContainer { height: auto; gap: 8px; flex-wrap: wrap; }
._mlxAttachBrowserPanel ._fileBrowser ._searchInputContainer {
	flex: 1 1 220px;
	max-width: 320px;
	height: 34px;
	padding: 0 12px;
	gap: 8px;
	border: 1px solid rgba(17, 24, 39, 0.15);
	border-radius: 8px;
	background: #ffffff;
	color: #6b7280;
}
._mlxAttachBrowserPanel ._fileBrowser ._searchInputContainer input {
	flex: 1;
	min-width: 0;
	padding: 0;
	font: inherit;
	color: #111827;
	background: transparent;
}
._mlxAttachBrowserPanel ._fileBrowser button,
._mlxAttachBrowserPanel ._fileBrowser ._upload {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 34px;
	padding: 0 12px;
	margin: 0;
	border: 1px solid rgba(17, 24, 39, 0.15);
	border-radius: 8px;
	background: #ffffff;
	color: #111827;
	box-shadow: none;
	font: 500 13px/1 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
	cursor: pointer;
}
._mlxAttachBrowserPanel ._fileBrowser button:hover,
._mlxAttachBrowserPanel ._fileBrowser ._upload:hover { background: #f3f4f6; }
._mlxAttachBrowserPanel ._fileBrowser button:disabled {
	cursor: default;
	background: #ffffff;
	border-color: rgba(17, 24, 39, 0.12);
	color: #9ca3af;
}
._mlxAttachBrowserPanel ._fileBrowser ._upload svg,
._mlxAttachBrowserPanel ._fileBrowser ._upload img { width: 16px; height: 16px; }
._mlxAttachBrowserPanel ._fileBrowser ._filesContainer { gap: 8px; min-height: 0; overflow: hidden; }
._mlxAttachBrowserPanel ._fileBrowser ._pathContainer {
	flex-wrap: wrap;
	align-items: center;
	gap: 6px;
	min-height: 24px;
	font-size: 13px;
	color: #374151;
}
._mlxAttachBrowserPanel ._fileBrowser ._pathFolderImage { width: 20px; height: 20px; background-size: contain; }
._mlxAttachBrowserPanel ._fileBrowser ._pathPart { cursor: pointer; }
._mlxAttachBrowserPanel ._fileBrowser ._pathPart:last-of-type { font-weight: 600; color: #111827; }
._mlxAttachBrowserPanel ._fileBrowser ._files {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
	grid-auto-rows: 112px;
	align-content: start;
	gap: 10px;
	padding: 10px;
	border: 1px solid rgba(17, 24, 39, 0.08);
	border-radius: 8px;
	background: #f9fafb;
	box-shadow: none;
	overflow: auto;
}
._mlxAttachBrowserPanel ._fileBrowser ._files._progressBar { display: flex; }
._mlxAttachBrowserPanel ._fileBrowser ._files ._eachFile {
	width: auto;
	height: auto;
	min-width: 0;
	border-radius: 8px;
	background: #ffffff;
	overflow: hidden;
}
._mlxAttachBrowserPanel ._fileBrowser ._files ._eachFile::after { border-radius: 8px; border-color: rgba(17, 24, 39, 0.1); }
._mlxAttachBrowserPanel ._fileBrowser ._files ._eachFile._selected::before,
._mlxAttachBrowserPanel ._fileBrowser ._files ._eachFile._selectable:hover::before {
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 8px;
	border: 2px solid #2563eb;
}
._mlxAttachBrowserPanel ._fileBrowser ._files ._eachFile._directory:hover,
._mlxAttachBrowserPanel ._fileBrowser ._files ._eachFile._selectable:hover { background: #f3f4f6; }
._mlxAttachBrowserPanel ._fileBrowser ._files ._eachFile ._image { margin: 14px 14px 8px; }
._mlxAttachBrowserPanel ._fileBrowser ._files ._eachFile ._imageLabel {
	display: block;
	height: 28px;
	margin: 0;
	padding: 0 8px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	text-align: center;
	font: 400 12px/28px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
	color: #374151;
	background: #f9fafb;
}
._mlxAttachBrowserPanel ._fileBrowser ._editBtnContainer { gap: 8px; padding: 0; }
._attachmentZoomable { cursor: zoom-in; }
button._attachmentDownload { all: unset; cursor: pointer; display: block; }
button._attachmentDownload:hover ._attachmentFile { text-decoration: underline; }
._mlxLightbox {
	position: fixed;
	inset: 0;
	z-index: 2147483002;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
	background: rgba(0, 0, 0, 0.82);
	cursor: zoom-out;
}
._mlxLightbox img {
	max-width: 92vw;
	max-height: 84vh;
	object-fit: contain;
	border-radius: 6px;
	box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
	cursor: default;
	background: #fff;
}
._mlxLightboxBar {
	display: flex;
	align-items: center;
	gap: 12px;
	max-width: 92vw;
	color: #f3f4f6;
	font: 500 13px/1.3 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
	cursor: default;
}
._mlxLightboxBar span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
._mlxLightboxBar button {
	all: unset;
	cursor: pointer;
	padding: 6px 12px;
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.14);
	color: #fff;
}
._mlxLightboxBar button:hover { background: rgba(255, 255, 255, 0.24); }
`;
