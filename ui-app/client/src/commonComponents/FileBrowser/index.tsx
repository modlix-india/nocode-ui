import axios from 'axios';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import { shortUUID } from '../../util/shortUUID';
import React, { Suspense } from 'react';

const RENDERABLE_EXT = new Set<string>(
	'png,apng,avif,gif,jpg,jpeg,jpe,webp,jfif,pjpeg,pjp,svg,bmp,cur,tif,tiff'.split(','),
);

const ICON_SET = new Map<string, Set<string>>([
	[
		'api/files/static/file/SYSTEM/icons/audio.svg',
		new Set(
			'3gp,aa,aac,aax,act,aiff,alac,amr,ape,au,awb,dss,flac,gsm,m4a,m4b,m4p,mp3,mpc,ogg,opus,ra,raw,rf64,sln,voc,vox,wav,wma,wv,webm,8svx,cda'.split(
				',',
			),
		),
	],
	[
		'api/files/static/file/SYSTEM/icons/movie.svg',
		new Set(
			'webm,mpg,mp2,mpeg,mpe,mpv,ogg,mp4,m4p,m4v,avi,wmv,mov,qt,flv,swf,avchd'.split(','),
		),
	],
	[
		'api/files/static/file/SYSTEM/icons/text.svg',
		new Set('odt,rtf,tex,txt,wks,wps,wpd,ods,odp'.split(',')),
	],
	['api/files/static/file/SYSTEM/icons/archive.svg', new Set('zip,rar,7z,tar,gz,bz2'.split(','))],
	[
		'api/files/static/file/SYSTEM/icons/code.svg',
		new Set('js,css,scss,ts,tsx,jsx,java,py,rb,php,go,swift,cpp,c'.split(',')),
	],
	['api/files/static/file/SYSTEM/icons/executable.svg', new Set('exe,msi,apk,app'.split(','))],
	['api/files/static/file/SYSTEM/icons/font.svg', new Set('ttf,otf,woff,woff2'.split(','))],
	['api/files/static/file/SYSTEM/icons/text.svg', new Set('txt,md'.split(','))],
	['api/files/static/file/SYSTEM/icons/pdf.svg', new Set('pdf'.split(','))],
	['api/files/static/file/SYSTEM/icons/html.svg', new Set('html,htm'.split(','))],
	['api/files/static/file/SYSTEM/icons/excel.svg', new Set('xls,xlsx'.split(','))],
	['api/files/static/file/SYSTEM/icons/word.svg', new Set('doc,docx'.split(','))],
	['api/files/static/file/SYSTEM/icons/ppt.svg', new Set('ppt,pptx'.split(','))],
	['api/files/static/file/SYSTEM/icons/image.svg', new Set(['ico'])],
]);

const FOLDER_SVG = 'api/files/static/file/SYSTEM/icons/folder.svg';

const STATIC_FILE_API_PREFIX = 'api/files/static/file/';
const STATIC_FILE_API_PREFIX_LENGTH = STATIC_FILE_API_PREFIX.length;

export async function imageURLForFile(
	url: string,
	isDirectory: boolean,
	type: string,
	width?: number,
	height?: number,
	clientCode?: string,
): Promise<string> {
	let imgUrl;
	if (isDirectory) return `${FOLDER_SVG}`;
	else if (RENDERABLE_EXT.has(type?.toLowerCase() ?? '')) {
		let wparam, hparam;

		if (width) wparam = `width=${width}`;
		if (height) hparam = `height=${height}`;

		if (wparam && hparam) imgUrl = `${url}?${wparam}&${hparam}`;
		else if (wparam) imgUrl = `${url}?${wparam}`;
		else if (hparam) imgUrl = `${url}?${hparam}`;
		else imgUrl = `${url}`;
		if (clientCode) {
			imgUrl += `${imgUrl.includes('?') ? '&' : '?'}clientCode=${clientCode}`;
		}
	}

	if (!imgUrl)
		imgUrl = `${
			Array.from(ICON_SET.entries()).find(([_, exts]) => exts.has(type))?.[0] ??
			'api/files/static/file/SYSTEM/icons/anyfile.svg'
		}`;

	if (imgUrl.indexOf('api/files/secured') !== -1) {
		const headers: any = {
			Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
		};
		if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();

		imgUrl = await axios
			.get(url, { responseType: 'blob', headers })
			.then(res => URL.createObjectURL(res.data));
	}
	if (window.cdnPrefix) {
		let index = imgUrl.indexOf(STATIC_FILE_API_PREFIX);
		if (index !== -1) {
			let urlPart = imgUrl.substring(index + STATIC_FILE_API_PREFIX_LENGTH);
			imgUrl = `https://${window.cdnPrefix}/`;
			if (!window.cdnStripAPIPrefix) {
				imgUrl += STATIC_FILE_API_PREFIX;
			}
			imgUrl += urlPart;

			if (window.cdnReplacePlus) {
				imgUrl = imgUrl.replace(/\+/g, '%20');
			}
		}
	}

	return imgUrl;
}

const LazyFileBrowser = React.lazy(
	() => import(/* webpackChunkName: "FileBrowser" */ './LazyFileBrowser'),
);

export function FileBrowser(props: Readonly<FileBrowserProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyFileBrowser {...props} />
		</Suspense>
	);
}
