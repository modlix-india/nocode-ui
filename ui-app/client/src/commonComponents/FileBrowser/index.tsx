import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import { shortUUID } from '../../util/shortUUID';
import Portal from '../../components/Portal';
import PathParts from '../PathParts';

const RESIZABLE_EXT = new Set<string>(['.jpg', '.jpeg', '.jpe', '.webp', '.png']);

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

interface FileBrowserProps {
	selectedFile: string;
	onChange: (v: string) => void;
	resourceType?: string;
	restrictNavigationToTopLevel?: boolean;
	startLocation?: string;
	fileUploadSizeLimit?: number;
	restrictUploadType?: string;
	restrictSelectionType?: string[];
	selectionType?: string;
	hideUploadFile?: boolean;
	hideCreateFolder?: boolean;
	hideDelete?: boolean;
	fileCategory?: string;
}

export function FileBrowser({
	selectedFile,
	onChange,
	resourceType = 'static',
	startLocation,
	restrictNavigationToTopLevel,
	fileUploadSizeLimit,
	restrictUploadType,
	restrictSelectionType,
	selectionType,
	hideUploadFile,
	hideCreateFolder,
	hideDelete,
	fileCategory,
}: FileBrowserProps) {
	const [filter, setFilter] = useState('');
	const [path, setInternalPath] = useState(startLocation ?? '/');
	const [files, setFiles] = useState<any>();
	const [inProgress, setInProgress] = useState(false);
	const [newFolder, setNewFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState('');
	const [showImageResizerPopup, setShowImageResizerPopup] = useState(false);
	const [formData, setFormData] = useState<FormData>();
	const [image, setImage] = useState<string>('');
	const [fileSelection, setFileSelection] = useState<any>();
	const [override, setOverride] = useState<boolean>(false);
	const [showOverrideCheckbox, setShowOverrideCheckbox] = useState<boolean>(false);
	const [somethingChanged, setSomethingChanged] = useState(Date.now());

	const setPath = useCallback(
		(v: string) => {
			setInternalPath(v);
			setFilter('');
		},
		[setInternalPath, setFilter],
	);

	const headers: any = {
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
	};
	if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();

	useEffect(() => setPath(startLocation ?? '/'), [startLocation, setPath]);

	useEffect(() => {
		setInProgress(true);

		(async () => {
			let url = `api/files/${resourceType}/${path}?size=200`;
			if (fileCategory) url += `&fileType=${fileCategory}`;
			if (filter.trim() !== '') url += `&filter=${filter}`;
			await axios
				.get(url, { headers })
				.then(res => setFiles(res.data))
				.finally(() => setInProgress(false));
		})();
	}, [path, filter, setFiles, setInProgress, somethingChanged, fileCategory]);

	const newFolderDiv = newFolder ? (
		<div className="_eachFile">
			<i className={`fa fa-2x fa-solid fa-folder folderIcon`} />
			<input
				type="text"
				className="_peInput"
				placeholder="folderName"
				autoFocus={true}
				onChange={e => setNewFolderName(e.target.value)}
				onBlur={() => {
					setNewFolder(false);
					setNewFolderName('');
				}}
				onKeyUp={e => {
					if (e.key !== 'Enter') return;
					e.preventDefault();
					e.stopPropagation();
					const formData = new FormData();
					(async () => {
						setInProgress(true);
						try {
							let url = `/api/files/${resourceType}/${
								path === '' ? '/' : path + '/'
							}${newFolderName}`;
							await axios
								.post(url, formData, {
									headers,
								})
								.finally(() => {
									setInProgress(false);
									setNewFolder(false);
									setNewFolderName('');
									setSomethingChanged(Date.now());
								});
						} catch (e) {}
					})();
				}}
			/>
		</div>
	) : (
		<></>
	);

	const uploadDiv = (
		<div className="_upload">
			<svg width="14" height="14" viewBox="0 0 14 14">
				<path
					d="M7.875 2.98813V9.62479C7.875 10.1088 7.48398 10.4998 7 10.4998C6.51602 10.4998 6.125 10.1088 6.125 9.62479V2.98813L4.11797 4.99526C3.77617 5.33708 3.22109 5.33708 2.8793 4.99526C2.5375 4.65345 2.5375 4.09834 2.8793 3.75653L6.3793 0.25636C6.72109 -0.0854534 7.27617 -0.0854534 7.61797 0.25636L11.118 3.75653C11.4598 4.09834 11.4598 4.65345 11.118 4.99526C10.7762 5.33708 10.2211 5.33708 9.8793 4.99526L7.875 2.98813ZM1.75 9.62479H5.25C5.25 10.5901 6.03477 11.3749 7 11.3749C7.96523 11.3749 8.75 10.5901 8.75 9.62479H12.25C13.2152 9.62479 14 10.4096 14 11.3749V12.2499C14 13.2152 13.2152 14 12.25 14H1.75C0.784766 14 0 13.2152 0 12.2499V11.3749C0 10.4096 0.784766 9.62479 1.75 9.62479ZM11.8125 12.4687C11.9865 12.4687 12.1535 12.3995 12.2765 12.2765C12.3996 12.1534 12.4688 11.9865 12.4688 11.8124C12.4688 11.6383 12.3996 11.4714 12.2765 11.3483C12.1535 11.2253 11.9865 11.1561 11.8125 11.1561C11.6385 11.1561 11.4715 11.2253 11.3485 11.3483C11.2254 11.4714 11.1562 11.6383 11.1562 11.8124C11.1562 11.9865 11.2254 12.1534 11.3485 12.2765C11.4715 12.3995 11.6385 12.4687 11.8125 12.4687Z"
					fill="currentColor"
				/>
			</svg>
			Upload from device
			<input
				className="_peInput"
				type="file"
				onChange={async e => {
					if (e.target.files?.length === 0) return;
					const currFormData = new FormData();
					currFormData.append('file', e.target.files![0]);
					setFormData(currFormData);
					setInProgress(true);
					setShowImageResizerPopup(true);
					const imageUrl = URL.createObjectURL(e.target.files![0]);
					setImage(imageUrl);
					setShowOverrideCheckbox(false);
					setOverride(true);
				}}
			/>
		</div>
	);

	const [deleteObject, setDeleteObject] = useState<{ name: string; url: string } | undefined>();

	let confirmationBox;

	if (deleteObject) {
		confirmationBox = (
			<div className="_confirmationBox">
				<div className="_confirmationBoxContent">
					<p>Are you sure you want to delete {deleteObject.name}?</p>
					<div className="_confirmationBoxButtons">
						<button
							onClick={() => {
								setInProgress(true);
								(async () =>
									await axios.delete(deleteObject.url, {
										headers,
									}))();
								setInProgress(false);
								setDeleteObject(undefined);
								setSomethingChanged(Date.now());
							}}
						>
							Yes
						</button>
						<button onClick={() => setDeleteObject(undefined)}>No</button>
					</div>
				</div>
			</div>
		);
	}

	let content;

	if (inProgress)
		content = (
			<div className="_progressBar ">
				<svg xmlns="http://www.w3.org/2000/svg" width="44" height="70" viewBox="0 0 54 70">
					<path
						id="Subtraction_4"
						data-name="Subtraction 4"
						d="M-2077-648h-36a8.888,8.888,0,0,1-9-8.75v-52.5a8.888,8.888,0,0,1,9-8.75h22.5v17.5a4.444,4.444,0,0,0,4.5,4.375h18v39.375A8.888,8.888,0,0,1-2077-648Zm1-37v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm48-15.5h-18V-718l18,17.5Z"
						transform="translate(2122 718)"
						fill="#eee"
					/>
				</svg>
			</div>
		);
	else
		content = (
			<div className="_files">
				{newFolderDiv}
				{files?.content?.map((e: any) => {
					let backgroundImage;

					if (e.directory) backgroundImage = `url('${FOLDER_SVG}')`;
					else if (RENDERABLE_EXT.has(e.type?.toLowerCase() ?? ''))
						backgroundImage = `url('${e.url}?width=96&height=96')`;
					else {
						backgroundImage = `url('${
							Array.from(ICON_SET.entries()).find(([_, exts]) =>
								exts.has(e.type),
							)?.[0] ?? 'api/files/static/file/SYSTEM/icons/anyfile.svg'
						}')`;
					}

					const selectable = isSelectable(e, selectionType, restrictSelectionType);

					return (
						<div
							key={e.name}
							title={`${e.name}`}
							className={`_eachFile ${selectable ? '_selectable' : ''} ${
								e.name === fileSelection?.name ? '_selected' : ''
							} `}
							onClick={
								selectable
									? () =>
											setFileSelection(
												e.name === fileSelection?.name ? undefined : e,
											)
									: undefined
							}
							onDoubleClick={() => {
								if (e.directory) {
									setPath(e.filePath);
									return;
								}
								setFileSelection(e);
								onChange(e.url);
							}}
						>
							<div className="_image" style={{ backgroundImage }} />
							<p className="_imageLabel">
								{e.name && e.name.length < 19
									? e.name
									: e.name.substring(0, 17) + '...'}
							</p>
						</div>
					);
				})}
			</div>
		);

	let actualPath = path ?? '/';
	if (startLocation && restrictNavigationToTopLevel && startLocation != '/') {
		actualPath = actualPath.substring(
			startLocation.length + (startLocation.endsWith('/') ? 1 : 0),
		);
		const startPart =
			(startLocation.endsWith('/')
				? startLocation.substring(0, startLocation.length - 1)
				: startLocation
			)
				.split('/')
				.pop() ?? '';
		actualPath = startPart + (actualPath.startsWith('/') ? '' : '/') + actualPath;
	}

	const paths: React.JSX.Element[] = actualPath.split('/').flatMap((e, i, arr) => {
		if (e === '' && i === arr.length - 1) return [];
		const eachPart = [];
		const spath = arr.slice(0, i + 1).join('/');
		eachPart.push(
			<div className="_pathPart" key={e} onClick={() => setPath(spath == '' ? '/' : spath)}>
				{e !== '' ? e : 'All'}
			</div>,
		);

		eachPart.push(
			<div className="_pathSeparator" key={e + 'sep'}>
				<Sperator />
			</div>,
		);
		return eachPart;
	});

	paths.pop();

	return (
		<div className="_fileBrowser">
			<div className="_searchUploadContainer">
				<div className="_searchInputContainer">
					<i title="Search Images" className="fa fa-solid fa-search" />
					<input
						placeholder="Search Images"
						type="text"
						value={filter}
						onChange={e => setFilter(e.target.value)}
					/>
				</div>
				<button
					title="Create New Folder"
					className="_createFolderBtn"
					tabIndex={0}
					onClick={() => {
						if (inProgress) return;
						setNewFolder(true);
					}}
				>
					Create folder
				</button>
				{uploadDiv}
			</div>
			<div className="_filesContainer">
				<div className="_pathContainer">
					<div
						className="_pathFolderImage"
						style={{ backgroundImage: `url('${FOLDER_SVG}')` }}
					/>
					<Sperator />
					{paths}
				</div>
				{content}
			</div>
			<div className="_editBtnContainer">
				<button
					className="_deleteBtn"
					title="Delete"
					tabIndex={0}
					disabled={!fileSelection}
					onClick={() => {}}
				>
					Delete
				</button>
				<button
					className="_editBtn"
					title="Edit"
					tabIndex={0}
					disabled={!fileSelection}
					onClick={() => {}}
				>
					Edit
				</button>

				<button
					className="_selectBtn"
					title="Select"
					tabIndex={0}
					disabled={!fileSelection}
					onClick={() => onChange(fileSelection?.url)}
				>
					Select
				</button>
			</div>
		</div>
	);
}

function Sperator() {
	return (
		<svg
			width="7"
			height="12"
			viewBox="0 0 7 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M6.7437 5.39485C7.08543 5.72955 7.08543 6.27312 6.7437 6.60783L1.49473 11.749C1.153 12.0837 0.598028 12.0837 0.256298 11.749C-0.0854325 11.4143 -0.0854325 10.8707 0.256298 10.536L4.88742 6L0.259031 1.46402C-0.0826987 1.12931 -0.0826987 0.585741 0.259031 0.251032C0.600762 -0.0836773 1.15573 -0.0836773 1.49746 0.251032L6.74644 5.39217L6.7437 5.39485Z"
				fill="black"
				fillOpacity="0.4"
			/>
		</svg>
	);
}

function isSelectable(
	file: any,
	selectionType: string | undefined,
	restrictSelectionType: string[] | undefined,
) {
	if (restrictSelectionType?.length && restrictSelectionType.indexOf(file.type) === -1)
		return false;

	if (selectionType === '_files' && file.directory) return false;
	else if (selectionType === '_folders' && !file.directory) return false;

	return true;
}
