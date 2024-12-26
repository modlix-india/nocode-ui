import React, { useCallback, useEffect, useState } from 'react';
import { addListener, PageStoreExtractor } from '../../../context/StoreContext';

export interface Issue {
	message: string;
	options: Array<string>;
	defaultOption?: string;
	callbackOnOption?: { [key: string]: () => void };
}

interface IssueProps {
	issue: Issue | undefined;
	personalizationPath: string | undefined;
	pageExtractor: PageStoreExtractor;
	onClearIssue: () => void;
}

export default function IssuePopup({
	issue,
	personalizationPath,
	pageExtractor,
	onClearIssue,
}: Readonly<IssueProps>) {
	const [theme, setTheme] = useState('_light');

	useEffect(() => {
		if (!personalizationPath) return;

		return addListener(
			(_, v) => setTheme(v ?? '_light'),
			pageExtractor,
			`${personalizationPath}.theme`,
		);
	}, [personalizationPath]);

	const handleClick = useCallback(
		(option: string | undefined) => {
			issue?.callbackOnOption?.[option ?? '']?.();
			onClearIssue();
		},
		[issue, onClearIssue],
	);

	if (!issue) return <></>;

	return (
		<div
			className={`_popupBackground ${theme}`}
			onClick={() => handleClick(issue.defaultOption)}
		>
			<div className="_popupContainer" onClick={e => e.stopPropagation()}>
				{issue.message}
				<div className="_popupButtons">
					{issue.options.map(e => (
						<button key={e} onClick={() => handleClick(e)}>
							{e}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
