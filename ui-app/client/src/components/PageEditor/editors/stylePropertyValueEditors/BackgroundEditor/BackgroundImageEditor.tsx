import React from 'react';
import FileBrowser from '../../../../../commonComponents/FileBrowser/LazyFileBrowser';
// Reuse existing component

interface BackgroundImageEditorProps {
	value: string;
	onChange: (value: string) => void;
}

export function BackgroundImageEditor({ value, onChange }: BackgroundImageEditorProps) {
	// Extract URL from value
	const url =
		value.startsWith('url(') && value.endsWith(')')
			? value.substring(4, value.length - 1).replace(/["']/g, '')
			: '';

	return (
		<div className="_imageEditor">
			<div className="_urlInput">
				<input
					type="text"
					value={url}
					onChange={e => {
						const newUrl = e.target.value;
						onChange(`url("${newUrl}")`);
					}}
					placeholder="Enter image URL"
				/>
				<FileBrowser
					selectedFile={url}
					editOnUpload={false}
					onChange={fileUrl => {
						onChange(`url("${fileUrl}")`);
					}}
				/>
			</div>
		</div>
	);
}
