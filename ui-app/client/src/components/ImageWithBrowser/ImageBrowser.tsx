import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import PathParts from '../../commonComponents/PathParts';
import { LOCAL_STORE_PREFIX } from '../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getDataFromPath,
	setData,
} from '../../context/StoreContext';
import { LocationHistory } from '../../types/common';
import { shortUUID } from '../../util/shortUUID';
import Portal from '../Portal';

interface ImageBrowserProps {
	onClose: () => void;
	bindingPaths: Map<string, string>;
	pageExtractor: PageStoreExtractor;
	locationHistory: LocationHistory[];
}

const bindingPathNamesMap = new Map<string, string>([
	['bindingPath', 'Default Image'],
	['bindingPath2', 'Tablet Landscape Image'],
	['bindingPath3', 'Tablet Portrait Image'],
	['bindingPath4', 'Mobile Landscape Image'],
	['bindingPath5', 'Mobile Portrait Image'],
	['bindingPath6', 'Fallback Image'],
]);

export default function ImageBrowser({
	bindingPaths,
	onClose,
	pageExtractor,
	locationHistory,
}: ImageBrowserProps) {
	const [filter, setFilter] = useState('');
	const [path, setInternalPath] = useState('');
	const [newFolder, setNewFolder] = useState(false);
	const [inProgress, setInProgress] = useState(false);
	const [files, setFiles] = useState<any>();
	const [newFolderName, setNewFolderName] = useState('');
	const [currentBindingPath, setCurrentBindingPath] = useState<string>(
		bindingPaths.size > 0 ? (bindingPaths.keys().next().value ?? '') : '',
	);
	const [altText, setAltText] = useState<string>('');

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

	useEffect(() => {
		if (!bindingPaths.get('bindingPath7')) return;

		return addListenerAndCallImmediately(
			(_, v) => setAltText(v),
			pageExtractor,
			bindingPaths.get('bindingPath7')!,
		);
	}, [bindingPaths.get('bindingPath7')]);

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
		<div className={`_iconSelectionDisplay ${inProgress ? '_inProgress' : ''}`}>
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
							setData(
								bindingPaths.get(currentBindingPath)!,
								e.url,
								pageExtractor.getPageName(),
							);
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
						<div
							className="_deleteButton"
							onClick={ev => {
								ev.stopPropagation();
								ev.preventDefault();
								setInProgress(true);
								try {
									(async () => {
										await axios.delete(
											`/api/files/static/${path}${path === '' ? '' : '/'}${
												e.name
											}`,
											{
												headers,
											},
										);
										setInProgress(false);
										callForFiles();
									})();
								} catch (e) {}
							}}
						>
							<i className="fa fa-solid fa-trash" />
						</div>
					</div>
				);
			})}
		</div>
	);

	let altTextControl = <></>;
	if (bindingPaths.get('bindingPath7') !== undefined) {
		altTextControl = (
			<input
				className="_searchBar"
				placeholder="Alt text"
				type="text"
				value={altText}
				onChange={e => setAltText(e.target.value)}
				onBlur={e =>
					setData(
						bindingPaths.get('bindingPath7')!,
						e.target.value,
						pageExtractor.getPageName(),
					)
				}
			/>
		);
	}

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
					<div className="_flexBox _altTextContainer">
						{options}
						<input
							className="_searchBar"
							type="text"
							readOnly={true}
							defaultValue={
								getDataFromPath(
									bindingPaths.get(currentBindingPath)!,
									locationHistory,
									pageExtractor,
								) ?? ''
							}
						/>
					</div>
					<div className="_flexBox _altTextContainer">{altTextControl}</div>
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
