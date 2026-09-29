import React, { useEffect, useState } from 'react';
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
			<div className="_attachmentPreview" title={name}>
				<div className="_attachmentFile">
					<i className={fileIcon} />
					<span>{name}</span>
				</div>
			</div>
		);
	}

	return (
		<div className="_attachmentPreview" title={name}>
			{resolved ? (
				<img
					src={resolved}
					alt={name}
					className="_attachmentImage"
					// The other half of the expiry signal: a static or blob URL
					// never goes through secureImage's catch, so this is the only
					// place a missing one is noticed.
					onError={() => setFailed(true)}
				/>
			) : (
				<div className="_attachmentImage _attachmentLoading" />
			)}
		</div>
	);
}
