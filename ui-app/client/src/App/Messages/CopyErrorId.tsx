import React, { useEffect, useState } from 'react';
import { copyText } from './messageDetails';

// The small control under an error toast that puts the error id on the clipboard, so a person
// can hand it to support without reading a long id aloud. It says "Copied" for a moment after.
export function CopyErrorId({ errorId }: Readonly<{ errorId: string }>) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(timer);
	}, [copied]);

	return (
		<button
			type="button"
			className="_msgString _msgCopyId"
			title={errorId}
			onClick={() => copyText(errorId).then(setCopied)}
		>
			<i className="fa fa-solid fa-copy" />
			{copied ? 'Copied' : 'Copy error id'}
		</button>
	);
}
