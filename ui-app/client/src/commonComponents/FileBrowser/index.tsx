import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import { shortUUID } from '../../util/shortUUID';

const RESIZABLE_EXT = new Set<string>(['jpg', 'jpeg', 'jpe', 'webp', 'png', 'avif']);

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
	hideEdit?: boolean;
	fileCategory?: string[];
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
	hideEdit,
	hideCreateFolder,
	hideDelete,
	fileCategory,
}: FileBrowserProps) {
	const [filter, setFilter] = useState('');
	const [path, setPath] = useState(startLocation ?? '/');
	const [files, setFiles] = useState<any>();
	const [inProgress, setInProgress] = useState(false);
	const [newFolder, setNewFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState('');
	const [showImageResizerPopup, setShowImageResizerPopup] = useState(false);
	const [fileSelection, setFileSelection] = useState<any>();
	const [somethingChanged, setSomethingChanged] = useState(Date.now());
	const [deleteObject, setDeleteObject] = useState<any>();

	const setPathAndClearFilter = useCallback(
		(v: string) => {
			setPath(v);
			setFilter('');
		},
		[setPath, setFilter],
	);

	const headers: any = {
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
	};
	if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();

	useEffect(
		() => setPathAndClearFilter(startLocation ?? '/'),
		[startLocation, setPathAndClearFilter],
	);

	useEffect(() => {
		setInProgress(true);

		(async () => {
			let url = `api/files/${resourceType}/${path}?size=200`;
			if (fileCategory?.length) url += `&fileType=${fileCategory}`;
			if (filter.trim() !== '') url += `&filter=${filter}`;
			await axios
				.get(url, { headers })
				.then(res => setFiles(res.data))
				.finally(() => setInProgress(false));
		})();
	}, [path, filter, setFiles, setInProgress, somethingChanged, fileCategory]);

	const newFolderDiv = newFolder ? (
		<div className="_eachFile">
			<div className="_image" style={{ backgroundImage: `url('${FOLDER_SVG}')` }} />
			<input
				type="text"
				className="_imageLabel"
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
				}}
			/>
		</div>
	);

	let confirmationBox;

	if (deleteObject) {
		confirmationBox = (
			<div className="_confirmationBox">
				<div className="_confirmationBoxContent">
					<p>Are you sure you want to delete "{deleteObject.name}" ?</p>
					<div className="_confirmationBoxButtons">
						<button
							onClick={async () => {
								setInProgress(true);
								await axios.delete(
									`/api/files/${resourceType}/${deleteObject.filePath
										.split('/')
										.map(encodeURIComponent)
										.join('/')}`,
									{
										headers,
									},
								);
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
			<svg xmlns="http://www.w3.org/2000/svg" width="44" height="70" viewBox="0 0 54 70">
				<path
					id="Subtraction_4"
					data-name="Subtraction 4"
					d="M-2077-648h-36a8.888,8.888,0,0,1-9-8.75v-52.5a8.888,8.888,0,0,1,9-8.75h22.5v17.5a4.444,4.444,0,0,0,4.5,4.375h18v39.375A8.888,8.888,0,0,1-2077-648Zm1-37v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm-5,0v9h2v-9Zm48-15.5h-18V-718l18,17.5Z"
					transform="translate(2122 718)"
					fill="#eee"
				/>
			</svg>
		);
	else
		content = (
			<>
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

					let deletButton;

					if (!hideDelete && e.directory && selectionType === '_files') {
						deletButton = (
							<div
								className="_deleteInner"
								title="Delete"
								tabIndex={0}
								onClick={ev => {
									ev.stopPropagation();
									ev.preventDefault();
									setDeleteObject(e);
								}}
							>
								<svg viewBox="0 0 22 24">
									<path
										fill="currentColor"
										d="M8.373,2.419,7.44,3.75H14.56l-.933-1.331A.406.406,0,0,0,13.3,2.25H8.7a.394.394,0,0,0-.329.169Zm7.219-1.247,1.8,2.578h3.428A1.15,1.15,0,0,1,22,4.875,1.15,1.15,0,0,1,20.821,6h-.393V20.25A3.841,3.841,0,0,1,16.5,24H5.5a3.841,3.841,0,0,1-3.929-3.75V6H1.179A1.15,1.15,0,0,1,0,4.875,1.15,1.15,0,0,1,1.179,3.75H4.606l1.8-2.583A2.8,2.8,0,0,1,8.7,0h4.6a2.8,2.8,0,0,1,2.288,1.167ZM3.929,6V20.25A1.535,1.535,0,0,0,5.5,21.75h11a1.535,1.535,0,0,0,1.571-1.5V6ZM7.857,9v9.75a.787.787,0,0,1-1.571,0V9A.787.787,0,0,1,7.857,9Zm3.929,0v9.75a.787.787,0,0,1-1.571,0V9a.787.787,0,0,1,1.571,0Zm3.929,0v9.75a.787.787,0,0,1-1.571,0V9a.787.787,0,0,1,1.571,0Z"
									/>
								</svg>
							</div>
						);
					}

					return (
						<div
							key={e.name}
							title={`${e.name}`}
							className={`_eachFile ${e.directory ? '_directory' : ''} ${
								selectable ? '_selectable' : ''
							} ${e.name === fileSelection?.name ? '_selected' : ''} `}
							onClick={() => {
								if (selectable) {
									setFileSelection(
										e.name === fileSelection?.name ? undefined : e,
									);
									return;
								}
								if (!e.directory || selectionType != '_files') return;
								setPathAndClearFilter(e.filePath);
							}}
							onDoubleClick={() => {
								if (e.directory) {
									setPathAndClearFilter(e.filePath);
									return;
								}
								setFileSelection(e);
								onChange(e.url);
							}}
						>
							{deletButton}
							<div className="_image" style={{ backgroundImage }} />
							<p className="_imageLabel">
								{e.name && e.name.length < 19
									? e.name
									: e.name.substring(0, 17) + '...'}
							</p>
						</div>
					);
				})}
			</>
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
			<div
				className="_pathPart"
				key={e}
				onClick={() => setPathAndClearFilter(spath == '' ? '/' : spath)}
			>
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

	let deletButton;

	if (!hideDelete) {
		deletButton = (
			<button
				className="_deleteBtn"
				title="Delete"
				tabIndex={0}
				disabled={!fileSelection}
				onClick={() => setDeleteObject(fileSelection)}
			>
				Delete
			</button>
		);
	}

	let editButton;

	if (!hideEdit && RESIZABLE_EXT.has(fileSelection?.type?.toLowerCase() ?? '')) {
		editButton = (
			<button className="_editBtn" title="Edit" tabIndex={0} onClick={() => {}}>
				Edit
			</button>
		);
	}

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
				<CreateButton
					hideCreateFolder={hideCreateFolder}
					onClick={() => (inProgress ? undefined : setNewFolder(true))}
					fileCategory={fileCategory}
				/>
				{uploadDiv}
			</div>
			<div className="_filesContainer">
				<div className="_pathContainer">
					<div
						className="_pathFolderImage"
						style={{ backgroundImage: `url('${FOLDER_SVG}')` }}
						onClick={() => setPathAndClearFilter(startLocation ?? '/')}
					/>
					<Sperator />
					{paths}
				</div>
				<div className={`_files ${inProgress ? '_progressBar' : ''}`}>{content}</div>
			</div>
			<div className="_editBtnContainer">
				{editButton}
				{deletButton}
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
			{confirmationBox}
		</div>
	);
}

function CreateButton({
	hideCreateFolder,
	onClick,
	fileCategory,
}: {
	hideCreateFolder?: boolean;
	onClick: () => void;
	fileCategory?: string[];
}) {
	if (hideCreateFolder) return <></>;

	if (fileCategory?.length) {
		let found = false;
		for (let cat of fileCategory) {
			if (cat === 'DIRECTORIES' || cat === '') {
				found = true;
				break;
			}
		}

		if (!found) {
			return <></>;
		}
	}

	return (
		<button
			title="Create New Folder"
			className="_createFolderBtn"
			tabIndex={0}
			onClick={onClick}
		>
			Create folder
		</button>
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
