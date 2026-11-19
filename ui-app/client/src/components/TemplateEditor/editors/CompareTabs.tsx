import React, { lazy, Suspense, useState } from 'react';
import { PreviewHeaders } from '../util/previewApi';
import CompareView, { CompareSection } from './CompareView';

// pdf.js comes with this chunk only: it loads when Compare opens on a PDF template.
const PdfCompare = lazy(() => import('./PdfCompare'));

interface CompareTabsProps {
	isPdf: boolean;
	sections: CompareSection[];
	before: any;
	after: any;
	data: any;
	headers: PreviewHeaders;
}

type Tab = 'pages' | 'diff' | 'code';

// Compare: for a PDF template the two PDFs side by side or with the differences in red; the line by line
// code diff stays as the third tab. Other templates (email, text) only have the code diff.
export default function CompareTabs({
	isPdf,
	sections,
	before,
	after,
	data,
	headers,
}: Readonly<CompareTabsProps>) {
	const [tab, setTab] = useState<Tab>(isPdf ? 'pages' : 'code');
	if (!isPdf) return <CompareView sections={sections} />;
	return (
		<div className="_cmpView">
			<div className="_cmpBar">
				<div className="_cmpTitle">
					Compare{' '}
					<span className="_cmpSub">
						what the template was when you opened it with what it is now
					</span>
				</div>
				<div className="_cmpToggle">
					<button
						className={`_teTab ${tab === 'pages' ? '_active' : ''}`}
						onClick={() => setTab('pages')}
					>
						PDF side by side
					</button>
					<button
						className={`_teTab ${tab === 'diff' ? '_active' : ''}`}
						onClick={() => setTab('diff')}
					>
						Differences
					</button>
					<button
						className={`_teTab ${tab === 'code' ? '_active' : ''}`}
						onClick={() => setTab('code')}
					>
						Code lines
					</button>
				</div>
			</div>
			{tab === 'code' ? (
				<CompareView sections={sections} />
			) : (
				<Suspense fallback={<div className="_pcNote">Loading…</div>}>
					<PdfCompare
						before={before}
						after={after}
						data={data}
						headers={headers}
						mode={tab}
						beforeLabel="What was"
						afterLabel="What changed"
					/>
				</Suspense>
			)}
		</div>
	);
}
