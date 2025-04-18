import React, { Fragment } from 'react';

export default function PathParts({
	path,
	setPath,
	pathStartIcon,
	pathStartText,
}: Readonly<{
	path: string;
	pathStartIcon?: string;
	pathStartText?: string;
	setPath: (p: string) => void;
}>) {
	const parts = path.split('\\');
	const partElements: React.JSX.Element[] = [];

	if (pathStartIcon) {
		partElements.push(
			<img key="startIcon" height="100%" src={pathStartIcon} alt="Folder Icon" />,
		);
	}

	if (pathStartText) {
		if (partElements.length > 0) partElements.push(<Seperator key="startSeperator" />);
		partElements.push(
			<span key="startText" className="_clickable" onClick={() => setPath('')}>
				{pathStartText}
			</span>,
		);
	}

	for (let i = 0; i < parts.length; i++) {
		if (i !== parts.length - 1) {
			partElements.push(<span key={i}>{parts[i]}</span>);
		}
		partElements.push(
			<span
				key={i}
				className="_clickable"
				onClick={() => setPath('\\' + parts.slice(0, i + 1).join('\\'))}
			>
				{parts[i]}
			</span>,
		);
	}

	return <div className="_pathParts">{partElements}</div>;
}

function Seperator() {
	return (
		<svg width="7" height="12" viewBox="0 0 7 12" fill="none">
			<path
				d="M6.7437 5.39485C7.08543 5.72955 7.08543 6.27312 6.7437 6.60783L1.49473 11.749C1.153 12.0837 0.598028 12.0837 0.256298 11.749C-0.0854325 11.4143 -0.0854325 10.8707 0.256298 10.536L4.88742 6L0.259031 1.46402C-0.0826987 1.12931 -0.0826987 0.585741 0.259031 0.251032C0.600762 -0.0836773 1.15573 -0.0836773 1.49746 0.251032L6.74644 5.39217L6.7437 5.39485Z"
				fill="black"
				fillOpacity="0.4"
			/>
		</svg>
	);
}
