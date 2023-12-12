import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Popup } from './Popup';
import axios from 'axios';
import { LOCAL_STORE_PREFIX } from '../../../constants';
import { getDataFromPath } from '../../../context/StoreContext';
import { shortUUID } from '../../../util/shortUUID';
import { Filler } from './fillerCommons';
import PathParts from '../../../commonComponents/PathParts';
import { duplicate } from '@fincity/kirun-js';
import { StoreExtractor, setStoreData } from '@fincity/path-reactive-state-management';

export default function ImagePopup({
	dataPath,
	isUIFiller = false,
	uiFiller,
	coreFiller,
	onClose,
	onValueChanged,
	onSimpleValueChanged,
}: Readonly<{
	dataPath?: string;
	isUIFiller?: boolean;
	uiFiller?: Filler;
	coreFiller?: Filler;
	onClose: () => void;
	onValueChanged?: (isUIFiller: boolean, filler: Filler) => void;
	onSimpleValueChanged?: (x: string) => void;
}>) {
	const [filter, setFilter] = useState('');
	const [path, setPath] = useState('');
	const [newFolder, setNewFolder] = useState(false);
	const [inProgress, setInProgress] = useState(false);
	const [files, setFiles] = useState<any>();
	const [newFolderName, setNewFolderName] = useState('');

	const onChange = useCallback(
		onSimpleValueChanged
			? onSimpleValueChanged
			: (v: string) => {
					const newFiller = duplicate(isUIFiller ? uiFiller : coreFiller);
					setStoreData(
						dataPath!,
						newFiller,
						v,
						'Filler',
						new Map([['Filler.', new StoreExtractor(newFiller, 'Filler.')]]),
					);
					onValueChanged?.(isUIFiller, newFiller);
			  },
		[isUIFiller, uiFiller, coreFiller, onValueChanged, dataPath],
	);

	const setActualPath = useCallback(
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

	useEffect(() => {
		callForFiles();
	}, [callForFiles, path]);

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
			{files?.content?.map((e: any) => (
				<div
					key={e.name}
					className="_eachIcon"
					onKeyDown={ev => {
						if (ev.key !== 'Enter' && ev.key !== ' ') return;
						ev.preventDefault();
						ev.stopPropagation();
						if (e.directory) {
							setActualPath(path + '\\' + e.name);
							return;
						}
						onChange(e.url);
						onClose();
					}}
					onClick={() => {
						if (e.directory) {
							setActualPath(path + '\\' + e.name);
							return;
						}
						onChange(e.url);
						onClose();
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
						onKeyDown={() => {}}
						onClick={async ev => {
							ev.stopPropagation();
							ev.preventDefault();
							setInProgress(true);
							try {
								await axios.delete(
									`/api/files/static/${path}${path === '' ? '' : '/'}${e.name}`,
									{
										headers,
									},
								);
								setInProgress(false);
								callForFiles();
							} catch (e) {}
						}}
					>
						<i className="fa fa-solid fa-trash" />
					</div>
				</div>
			))}
		</div>
	);

	return (
		<Popup onClose={() => onClose()}>
			<div className="_flexBox _column _browserBack" onClick={e => e.stopPropagation()}>
				<i className="_closeIcon fa fa-solid fa-times" onClick={() => onClose()} />
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
		</Popup>
	);
}
