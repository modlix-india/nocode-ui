import React, { useCallback, useEffect, useState } from 'react';
import Portal from '../Portal';
import axios from 'axios';
import { getDataFromPath } from '../../context/StoreContext';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { shortUUID } from '../../util/shortUUID';
import PathParts from '../../commonComponents/PathParts';

interface ImageBrowserProps {
	onClose: () => void;
	bindingPaths: Map<string, string>;
}

const bindingPathNamesMap = new Map<string, string>([
	['bindingPath', 'Default Image'],
	['bindingPath2', 'Tablet Landscape Image'],
	['bindingPath3', 'Tablet Portrait Image'],
	['bindingPath4', 'Mobile Landscape Image'],
	['bindingPath5', 'Mobile Portrait Image'],
	['bindingPath6', 'Fallback Image'],
]);

export default function ImageBrowser({ bindingPaths, onClose }: ImageBrowserProps) {
	const [filter, setFilter] = useState('');
	const [path, setInternalPath] = useState('');
	const [newFolder, setNewFolder] = useState(false);
	const [inProgress, setInProgress] = useState(false);
	const [files, setFiles] = useState<any>();
	const [newFolderName, setNewFolderName] = useState('');
	const [currentBindingPath, setCurrentBindingPath] = useState<string>(
		bindingPaths.size > 0 ? bindingPaths.keys().next().value : '',
	);

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
			let url = `/api/files/static/${path}?size=200&fileType=IMAGES,DIRECTORIES`; // for now hardcoding size with value 200 in future update with infinite scrolling
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

	useEffect(() => callForFiles(), [callForFiles, path]);

	const newFolderDiv = newFolder ? (
		<div className="_eachIcon">
			<i className={`fa fa-2x fa-solid fa-folder`} />
			<input
				type="text"
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
			<i className={`fa fa-2x fa-solid fa-upload`} />
			Upload / Add a new file
			<input
				className="_peInput"
				type="file"
				onChange={async e => {
					if (e.target.files?.length === 0) return;
					const formData = new FormData();
					formData.append('file', e.target.files![0]);
					setInProgress(true);
					try {
						await axios.post(`/api/files/static${path === '' ? '/' : path}`, formData, {
							headers,
						});
					} catch (e) {}
					setInProgress(false);
					callForFiles();
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
			{uploadDiv}
			{newFolderDiv}
			{files?.content?.map((e: any) => {
				return (
					<div
						key={e.name}
						className="_eachIcon"
						onClick={() => {
							if (e.directory) {
								setPath(path + '\\' + e.name);
								return;
							}
							console.log(e.url);
						}}
					>
						{e.directory ? (
							<i className={`fa fa-2x fa-solid fa-folder`} />
						) : (
							<div
								className="_image"
								style={{
									backgroundImage: `url(${e.url}?width=96&height=96)`,
								}}
							/>
						)}
						{e.name}
					</div>
				);
			})}
		</div>
	);

	const options = (
		<select value={currentBindingPath} onChange={e => setCurrentBindingPath(e.target.value)}>
			{Array.from(bindingPaths.entries())
				.filter(([k]) => k !== 'bindingPath7')
				.map(([k]) => (
					<option value={k} key={k}>
						{bindingPathNamesMap.get(k)}
					</option>
				))}
		</select>
	);

	return (
		<Portal>
			<div
				className="_flexBox _popup _backdrop _verticalCenter _horizonatalCenter _imageBrowserPopup"
				onClick={onClose}
			>
				<div className="_flexBox _column _browserBack" onClick={e => e.stopPropagation()}>
					<i className="_closeIcon fa fa-solid fa-times" onClick={onClose} />
					<div>{options}</div>
					<input
						className="_searchBar"
						placeholder="Search for images..."
						type="text"
						value={filter}
						onChange={e => setFilter(e.target.value)}
					/>
					<div className="_iconSelectionBrowser">
						<div className="_pathContainer">
							<PathParts path={path} setPath={p => setPath(p)} />
							<i
								title="Create New Folder"
								className="fa fa-solid fa-square-plus"
								tabIndex={0}
								onClick={() => {
									if (inProgress) return;
									setNewFolder(true);
								}}
							/>
						</div>
						{content}
					</div>
				</div>
			</div>
		</Portal>
	);
}
