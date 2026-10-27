import React, { useEffect, useState } from 'react';
import secureImage, { isSecuredUrl } from './secureImage';

/**
 * The `src` an element can use for `url`.
 *
 * A static or remote URL comes back unchanged. A secured file needs the sign-in
 * token, which an `<img src>` cannot send, so it is fetched through
 * `secureImage` and the blob URL is returned once it is there (undefined until
 * then, or when the fetch fails).
 */
export function useSecureSrc(url: string | undefined): string | undefined {
	const secured = isSecuredUrl(url);
	const [resolved, setResolved] = useState<{ url?: string; src?: string }>({});

	useEffect(() => {
		if (!url || !secured) return;
		let alive = true;
		secureImage(url)
			.then(src => {
				if (alive) setResolved({ url, src });
			})
			.catch(() => {
				if (alive) setResolved({ url, src: undefined });
			});
		return () => {
			alive = false;
		};
	}, [url, secured]);

	if (!secured) return url;
	return resolved.url === url ? resolved.src : undefined;
}

/**
 * An `<img>` (or `<video>`) that also shows secured files. Every prop is passed
 * through; only `src` is swapped for the fetched blob URL when it is secured.
 */
export function SecureImg(
	props: Readonly<
		React.ImgHTMLAttributes<HTMLImageElement> & { src?: string; as?: 'img' | 'video' }
	>,
) {
	const { src, as = 'img', ...rest } = props;
	const shown = useSecureSrc(src);
	return React.createElement(as, { ...rest, src: shown });
}
