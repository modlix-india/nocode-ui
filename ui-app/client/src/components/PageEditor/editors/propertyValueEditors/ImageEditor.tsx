import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { LOCAL_STORE_PREFIX } from '../../../../constants';
import { getDataFromPath } from '../../../../context/StoreContext';
import { ComponentPropertyDefinition } from '../../../../types/common';
import Portal from '../../../Portal';

interface IconSelectionEditorProps {
	value?: string;
	propDef: ComponentPropertyDefinition;
	onChange: (v: string | undefined) => void;
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
export function ImageEditor({ value, onChange, propDef }: IconSelectionEditorProps) {
	const [chngValue, setChngValue] = useState(value ?? '');
	const [showImageBrowser, setShowImageBrowser] = useState(false);
	const [filter, setFilter] = useState('');
	const [path, setPath] = useState('');
	const [files, setFiles] = useState<any>();
	const [inProgress, setInProgress] = useState(false);
	const [newFolder, setNewFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState('');

	useEffect(() => setChngValue(value ?? ''), [value]);

	const callForFiles = useCallback(() => {
		setInProgress(true);
		(async () => {
			console.log('calling for files', path, filter);
			let url = `/api/files/static/${path}`;
			if (filter.trim() !== '') url += `&filter=${filter}`;
			await axios
				.get(url, {
					headers: {
						Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
					},
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

	console.log(files);
	let popup = <></>;
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
						console.log(newFolder);
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
									headers: {
										'Content-Type': 'multipart/form-data',
									},
								},
							);
						} catch (e) {
							console.log(e);
						}
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

								setChngValue(e.url);
								setShowImageBrowser(false);
								onChange(e.url);
							}}
						>
							{!isImage(e.name) ? (
								<i
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
							{e.name}
							<div
								className="_deleteButton"
								onClick={async ev => {
									ev.stopPropagation();
									ev.preventDefault();
									await axios.delete(
										`/api/files/static/${path}${path === '' ? '' : '/'}${
											e.name
										}`,
									);
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
				<div className={`_popupBackground`} onClick={() => setShowImageBrowser(false)}>
					<div className="_popupContainer" onClick={e => e.stopPropagation()}>
						<div className="_iconSelectionBrowser">
							<input
								placeholder="Search for images..."
								type="text"
								value={filter}
								onChange={e => setFilter(e.target.value)}
							/>
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

	return (
		<div className="_iconSelectionEditor">
			<div className="_pvExpressionEditor">
				<input
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
							<>
								{slash}
								<span key={i}>{p}</span>
							</>
						);
					return (
						<>
							{slash}
							<span
								className="_clickable"
								key={i}
								onClick={() => setPath('\\' + arr.slice(0, i + 1).join('\\'))}
							>
								{p}
							</span>
						</>
					);
				})}
		</div>
	);
}
