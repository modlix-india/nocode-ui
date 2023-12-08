import React, { CSSProperties, Fragment, useCallback, useEffect, useState } from 'react';
import { Popup } from './Popup';
import axios from 'axios';
import { getDataFromPath } from '../../../context/StoreContext';
import { shortUUID } from '../../../util/shortUUID';
import { LOCAL_STORE_PREFIX } from '../../../constants';

function PathParts({ path, setPath }: { path: string; setPath: (p: string) => void }) {
	const parts = path.split('\\');
	return (
		<div className="_pathParts">
			<span>
				<b>Path:</b>
			</span>
			<span
				className={path === '' ? '' : '_clickable'}
				onClick={() => (path !== '' ? setPath('') : undefined)}
			>
				\
			</span>
			{parts
				.filter(e => e !== '')
				.map((p, i, arr) => {
					const slash = i === 0 ? <></> : <span>\</span>;
					if (i === arr.length - 1)
						return (
							<Fragment key={i}>
								{slash}
								<span key={i}>{p}</span>
							</Fragment>
						);
					return (
						<Fragment key={i}>
							{slash}
							<span
								className="_clickable"
								key={i}
								onClick={() => setPath('\\' + arr.slice(0, i + 1).join('\\'))}
							>
								{p}
							</span>
						</Fragment>
					);
				})}
		</div>
	);
}

export function ImageEditor({
	value,
	onChange,
}: Readonly<{
	value: string | undefined;
	onChange: (v: string | undefined) => void;
}>) {
	const [showImageBrowser, setShowImageBrowser] = useState<boolean>(false);

	const [filter, setFilter] = useState('');
	const [path, setPath] = useState('');
	const [newFolder, setNewFolder] = useState(false);
	const [inProgress, setInProgress] = useState(false);
	const [files, setFiles] = useState<any>();
	const [newFolderName, setNewFolderName] = useState('');

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
		if (showImageBrowser) callForFiles();
	}, [showImageBrowser, callForFiles, path]);

	let popup: React.JSX.Element | undefined = undefined;

	if (showImageBrowser) {
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
							await axios.post(
								`/api/files/static${path === '' ? '/' : path}`,
								formData,
								{
									headers,
								},
							);
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
							setShowImageBrowser(false);
						}}
						onClick={() => {
							if (e.directory) {
								setActualPath(path + '\\' + e.name);
								return;
							}
							onChange(e.url);
							setShowImageBrowser(false);
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
										`/api/files/static/${path}${path === '' ? '' : '/'}${
											e.name
										}`,
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

		popup = (
			<Popup onClose={() => setShowImageBrowser(false)}>
				<div className="_flexBox _column _browserBack" onClick={e => e.stopPropagation()}>
					<i
						className="_closeIcon fa fa-solid fa-times"
						onClick={() => setShowImageBrowser(false)}
					/>
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

	const style: CSSProperties = {};

	let controls: React.JSX.Element | undefined = undefined;

	if (value) {
		style.backgroundImage = 'url(' + value + ')';
		controls = (
			<div className="_imageControls">
				<button onClick={() => setShowImageBrowser(true)}>Replace</button>
				<button onClick={() => onChange(undefined)}>Remove</button>
			</div>
		);
	} else {
		controls = (
			<div className="_imageControls _show">
				<button onClick={() => setShowImageBrowser(true)}>Add</button>
			</div>
		);
	}

	return (
		<div className="_imageEditor" style={style}>
			{controls}
			{popup}
		</div>
	);
}
