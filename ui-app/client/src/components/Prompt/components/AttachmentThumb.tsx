import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import getSrcUrl from '../../util/getSrcUrl';
import secureImage, { isSecuredUrl } from '../../util/secureImage';

interface AttachmentThumbProps {
	type: 'image' | 'file';
	name: string;
	url: string;
	expired?: boolean;
	fileIcon: string;
	expiredIcon: string;
}

/**
 * One attachment in the transcript, whatever kind of URL it carries.
 *
 * Three cases, and the component exists because they cannot share one `<img
 * src>`:
 *
 *  - a `blob:` URL for a file the user has just picked, which is already local;
 *  - a secured path for a stored chat attachment, which needs an Authorization
 *    header an `<img>` cannot send and so has to be fetched as a blob;
 *  - a static path for a generated image, which is public and wants the CDN
 *    rewrite `getSrcUrl` applies.
 *
 * ## Expiry is two signals, not one
 *
 * A stored chat attachment is deleted ninety days after it was uploaded, by a
 * retention job that runs hourly. So `expired` from the server and "the fetch
 * failed" are both real and neither implies the other: a file can outlive its
 * stated expiry by up to an hour, or by any amount if a delete failed, and it
 * can also be gone early. Treating them as one state is what keeps a broken
 * image icon off the screen in every case.
 */
export default function AttachmentThumb({
	type,
	name,
	url,
	expired,
	fileIcon,
	expiredIcon,
}: Readonly<AttachmentThumbProps>) {
	const [resolved, setResolved] = useState<string | undefined>();
	const [failed, setFailed] = useState(false);

	const secured = isSecuredUrl(url);

	useEffect(() => {
		setFailed(false);
		// Expired by the server's reckoning: there is nothing to fetch, and
		// asking would only cost a round-trip to be told so.
		if (expired) {
			setResolved(undefined);
			return;
		}
		if (!secured) {
			setResolved(getSrcUrl(url));
			return;
		}
		let live = true;
		secureImage(url)
			.then(objectUrl => {
				if (live) setResolved(objectUrl);
			})
			.catch(() => {
				// Deleted, expired ahead of its stamp, or the network went away.
				// Indistinguishable from here and handled the same way.
				if (live) setFailed(true);
			});
		return () => {
			live = false;
		};
	}, [url, secured, expired]);

	const gone = expired || failed;
	const [lightbox, setLightbox] = useState(false);
	const [saving, setSaving] = useState(false);

	// Click to keep a copy. Fetched as a blob, so a secured file goes with the user's token and a
	// static one under its own name (a cross-origin CDN link would ignore `download`).
	const download = useCallback(async () => {
		if (saving) return;
		setSaving(true);
		try {
			const href = secured
				? await secureImage(url)
				: URL.createObjectURL(await (await fetch(getSrcUrl(url))).blob());
			const a = document.createElement('a');
			a.href = href;
			a.download = name || 'file';
			document.body.appendChild(a);
			a.click();
			a.remove();
			if (!secured) setTimeout(() => URL.revokeObjectURL(href), 10000);
		} catch {
			setFailed(true);
		} finally {
			setSaving(false);
		}
	}, [saving, secured, url, name]);

	useEffect(() => {
		if (!lightbox) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLightbox(false);
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [lightbox]);

	if (gone) {
		return (
			<div
				className="_attachmentPreview _attachmentExpired"
				title={`${name} is no longer available`}
			>
				<div className="_attachmentFile">
					<i className={expiredIcon} />
					<span>{name}</span>
				</div>
			</div>
		);
	}

	if (type !== 'image') {
		return (
			<button
				type="button"
				className="_attachmentPreview _attachmentDownload"
				title={`Download ${name}`}
				onClick={download}
				disabled={saving}
			>
				<div className="_attachmentFile">
					<i className={saving ? 'fa fa-solid fa-spinner fa-spin' : fileIcon} />
					<span>{name}</span>
				</div>
			</button>
		);
	}

	return (
		<div className="_attachmentPreview" title={name}>
			{resolved ? (
				<img
					src={resolved}
					alt={name}
					className="_attachmentImage _attachmentZoomable"
					onClick={() => setLightbox(true)}
					// The other half of the expiry signal: a static or blob URL
					// never goes through secureImage's catch, so this is the only
					// place a missing one is noticed.
					onError={() => setFailed(true)}
				/>
			) : (
				<div className="_attachmentImage _attachmentLoading" />
			)}
			{lightbox && resolved
				? createPortal(
						<div
							className="_mlxLightbox"
							role="dialog"
							aria-label={name}
							onClick={() => setLightbox(false)}
						>
							<img src={resolved} alt={name} onClick={e => e.stopPropagation()} />
							<div className="_mlxLightboxBar" onClick={e => e.stopPropagation()}>
								<span>{name}</span>
								<button type="button" onClick={download} disabled={saving}>
									Download
								</button>
								<button
									type="button"
									onClick={() => setLightbox(false)}
									aria-label="Close"
								>
									×
								</button>
							</div>
						</div>,
						document.body,
					)
				: null}
		</div>
	);
}
