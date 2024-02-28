import axios from 'axios';
import React, {
	MouseEventHandler,
	WheelEventHandler,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { LOCAL_STORE_PREFIX } from '../../../../constants';
import { getDataFromPath } from '../../../../context/StoreContext';
import { ComponentPropertyDefinition } from '../../../../types/common';
import Portal from '../../../Portal';
import { PageOperations } from '../../functions/PageOperations';
import { shortUUID } from '../../../../util/shortUUID';
import PathParts from '../../../../commonComponents/PathParts';
import { RangeSlider } from '../stylePropertyValueEditors/simpleEditors/RangeSlider';
import ImageResizer from './ImageResizer';

interface ImageSelectionEditorProps {
	value?: string;
	propDef: ComponentPropertyDefinition;
	onChange: (v: string | undefined) => void;
	pageOperations: PageOperations;
}

const EXT_SET = new Set<string>([
	'.jpg',
	'.jpeg',
	'.jpe',
	'.jif',
	'.jfif',
	'.jfi',
	'.png',
	'.gif',
	'.webp',
	'.tiff',
	'.tif',
	'.raw',
	'.arw',
	'.cr2',
	'.nrw',
	'.k25',
	'.bmp',
	'.dib',
	'.heif',
	'.heic',
	'.ind',
	'.indd',
	'.indt',
	'.jp2',
	'.j2k',
	'.jpf',
	'.jpx',
	'.jpm',
	'.mj2',
	'.svg',
	'.svgz',
]);
function isImage(name: string) {
	let smallName = (name ?? '').toLowerCase();
	let ext = smallName.substring(smallName.lastIndexOf('.'));
	return EXT_SET.has(ext);
}
export function ImageEditor({
	value,
	onChange,
	propDef,
	pageOperations,
}: ImageSelectionEditorProps) {
	const [chngValue, setChngValue] = useState(value ?? '');
	const [showImageBrowser, setShowImageBrowser] = useState(false);
	const [filter, setFilter] = useState('');
	const [path, setInternalPath] = useState('');
	const [files, setFiles] = useState<any>();
	const [inProgress, setInProgress] = useState(false);
	const [newFolder, setNewFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState('');
	const [showImageResizerPopup, setShowImageResizerPopup] = useState(false);
	const [formData, setFormData] = useState<FormData>();
	const [image, setImage] = useState<string>('');
	const [imageName, setImageName] = useState('');
	const [override, setOverride] = useState<boolean>(false);

	useEffect(() => setChngValue(value ?? ''), [value]);

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

	const callForFiles = useCallback(() => {
		setInProgress(true);

		(async () => {
			let url = `api/files/static/${path}?size=200`; // for now hardcoding size with value 200 in future update with infinite scrolling
			if (filter.trim() !== '') url += `&filter=${filter}`;
			await axios
				.get(url, {
					headers,
				})
				.then(res => {
					setFiles(res.data);
				})
				.finally(() => setInProgress(false));
		})();
	}, [path, filter, setFiles]);

	useEffect(
		() => (showImageBrowser ? callForFiles() : undefined),
		[callForFiles, path, showImageBrowser],
	);

	let popup = <></>;
	if (showImageBrowser) {
		const newFolderDiv = newFolder ? (
			<div className="_eachIcon">
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
								let url = `/api/files/static/${
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
									});
							} catch (e) {}
							callForFiles();
						})();
					}}
				/>
			</div>
		) : (
			<></>
		);

		const uploadDiv = (
			<div className="_eachIcon _upload">
				<i
					className={`fa fa-2x fa-solid fa-upload`}
					style={{ color: '#fff', fontSize: '12px', marginRight: '8px' }}
				/>
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
					}}
				/>
			</div>
		);

		const content = inProgress ? (
			<div className="_progressBar">
				<i className="fa fa-spin fa-solid fa-hurricane" />
			</div>
		) : (
			<div className="_iconSelectionDisplay">
				{newFolderDiv}
				{files?.content?.map((e: any) => {
					return (
						<div
							key={e.name}
							title={`${e.name}`}
							className="_eachIcon"
							style={{
								borderColor:
									imageName === e.name ? '#4D7FEE' : 'rgba(0, 0, 0, 0.10)',
							}}
							onClick={async () => {
								if (e.directory) {
									setPath(path + '\\' + e.name);
									return;
								}

								if (e.target?.files?.length === 0) return;
								const currFormData = new FormData();
								setFormData(currFormData);
								setChngValue(e.url);
								setImage(e.url);
								setImageName(e.name);
							}}
						>
							{!isImage(e.name) ? (
								<i
									style={{
										color: e.directory ? '#FFC728' : '',
										fontSize: '44px',
										marginTop: '-15px',
									}}
									className={`fa fa-2x fa-solid ${
										e.directory ? 'fa-folder' : 'fa-file'
									}`}
								/>
							) : (
								<div
									className="_image"
									style={{
										backgroundImage: `url(${e.url}?width=96&height=96)`,
									}}
								/>
							)}
							<p className="_imageLabel" style={{}}>
								{e.name && e.name.length < 19
									? e.name
									: e.name.substring(0, 17) + '...'}
							</p>
							<div
								className="_deleteButton"
								onClick={ev => {
									ev.stopPropagation();
									ev.preventDefault();
									pageOperations?.setIssuePopup({
										message: `Confirm deletion of file : ${e.name} ?`,
										options: ['Yes', 'No'],
										callbackOnOption: {
											Yes: () => {
												setInProgress(true);
												try {
													(async () =>
														await axios.delete(
															`api/files/static/${path}${
																path === '' ? '' : '/'
															}${e.name}`,
															{
																headers,
															},
														))();
												} catch (e) {}
												setInProgress(false);
												callForFiles();
											},
										},
									});
								}}
							>
								<i className="fa fa-solid fa-trash" />
							</div>
						</div>
					);
				})}
			</div>
		);

		popup = (
			<Portal>
				{showImageBrowser && (
					<div className={`_popupBackground`} onClick={() => setShowImageBrowser(false)}>
						<div
							className="_popupContainer _imagePopupContainer"
							onClick={e => e.stopPropagation()}
						>
							<div className="_searchUploadContainer">
								<div className="_searchInputContainer">
									<input
										className="_peInput _searchInput"
										placeholder="Search Images"
										type="text"
										value={filter}
										onChange={e => setFilter(e.target.value)}
									/>
									<i
										title="Search Images"
										className="fa fa-solid fa-search"
										tabIndex={0}
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
							<div className="_iconSelectionBrowser">
								<div className="_pathContainer">
									<PathParts path={path} setPath={p => setPath(p)} />
								</div>
								{content}
							</div>
							<div className="_editBtnContainer">
								<button
									className="_deleteBtn"
									title="Delete"
									tabIndex={0}
									disabled={image === ''}
									style={{ cursor: image === '' ? 'not-allowed' : 'pointer' }}
									onClick={() => {
										pageOperations?.setIssuePopup({
											message: `Confirm deletion of file : ${imageName} ?`,
											options: ['Yes', 'No'],
											callbackOnOption: {
												Yes: () => {
													setInProgress(true);
													try {
														(async () =>
															await axios.delete(
																`api/files/static/${path}${
																	path === '' ? '' : '/'
																}${imageName}`,
																{
																	headers,
																},
															))();
													} catch (e) {}
													setInProgress(false);
													callForFiles();
												},
											},
										});
									}}
								>
									Delete
								</button>
								<button
									className="_EditBtn"
									title="Edit"
									tabIndex={0}
									disabled={image === ''}
									style={{
										cursor: image === '' ? 'not-allowed' : 'pointer',
									}}
									onClick={() => {
										setOverride(true);
										setShowImageResizerPopup(true);
									}}
								>
									Edit
								</button>
								<div
									className="_selectBtnContainer"
									style={{
										cursor: image === '' ? 'not-allowed' : 'pointer',
									}}
									onClick={() => {
										onChange(image);
										setShowImageBrowser(false);
									}}
								>
									<i className="fa-regular fa-image"></i>
									<button
										className="_selectBtn"
										title="Select"
										tabIndex={0}
										disabled={image === ''}
										style={{
											cursor: image === '' ? 'not-allowed' : 'pointer',
										}}
									>
										Select
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
				{showImageResizerPopup && (
					<>
						<ImageResizer
							path={path}
							headers={headers}
							formData={formData}
							image={image}
							setImage={setImage}
							setInProgress={setInProgress}
							setShowImageResizerPopup={setShowImageResizerPopup}
							callForFiles={callForFiles}
							override={override}
							setOverride={setOverride}
						/>
					</>
				)}
			</Portal>
		);
	}

	return (
		<div className="_iconSelectionEditor">
			<div className="_pvExpressionEditor">
				<input
					className="_peInput"
					type="text"
					value={chngValue}
					placeholder={propDef.defaultValue}
					onChange={e => setChngValue(e.target.value)}
					onBlur={() =>
						onChange(
							chngValue === '' || chngValue === propDef.defaultValue
								? undefined
								: chngValue,
						)
					}
				/>
				<i
					className="_pillTag fa fa-search"
					tabIndex={0}
					onClick={() => {
						setShowImageBrowser(true);
						callForFiles();
					}}
				/>
			</div>
			{popup}
		</div>
	);
}
