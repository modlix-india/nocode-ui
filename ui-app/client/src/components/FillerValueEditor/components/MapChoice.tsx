import React from 'react';
import { Dropdown } from './Dropdown';
import TextBox from '../../FillerDefinitionEditor/components/TextBox';
import { ImageEditor } from './ImageEditor';

export default function MapChoice({
	prefix,
	onPopup,
	value,
	onChange,
}: Readonly<{
	prefix?: string;
	onPopup: () => void;
	value: any;
	onChange: (v: any) => void;
}>) {
	let url = value?.url ?? '';

	if (!url) url = '';
	else if (prefix && url.startsWith(prefix)) url = url.substring(prefix.length);

	console.log(url);

	return (
		<div className="_flexBox _column _gap10">
			<Dropdown
				options={[
					{ name: 'Goolge Map', displayName: 'Google Map' },
					{ name: 'Image', displayName: 'Image' },
				]}
				value={value?.type ?? 'Goolge Map'}
				onChange={e => onChange({ ...(value ?? {}), type: e })}
				hideNone={true}
			/>
			{(value?.type ?? 'Goolge Map') === 'Goolge Map' ? (
				<TextBox
					value={url}
					onChange={e => onChange({ ...(value ?? {}), url: (prefix ?? '') + e })}
				/>
			) : (
				<ImageEditor
					value={value?.image}
					onDelete={() => onChange({ ...(value ?? {}), image: undefined })}
					onPopup={onPopup}
				/>
			)}
		</div>
	);
}
