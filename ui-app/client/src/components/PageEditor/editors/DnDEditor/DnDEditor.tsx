import React, { useEffect } from 'react';
import DnDSideBar from './DnDSideBar';

interface DnDEditorProps {
	defPath: string | undefined;
	personalizationPath: string | undefined;
	pageName: string | undefined;
	onSave: () => void;
	onChangePersonalization: (prop: string, value: any) => void;
	url: string;
}

export default function DnDEditor({ defPath, personalizationPath }: DnDEditorProps) {
	return (
		<div className="_dndGrid">
			<DnDSideBar />
		</div>
	);
}
