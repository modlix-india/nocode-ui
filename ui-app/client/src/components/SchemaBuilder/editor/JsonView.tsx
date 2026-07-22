import React, { Suspense, useEffect, useRef, useState } from 'react';

const LazyEditor = React.lazy(() =>
	import('@monaco-editor/react').then(module => ({ default: module.default })),
);

export default function JsonView({
	value,
	onChange,
	readOnly,
}: Readonly<{ value: any; onChange: (v: any) => void; readOnly: boolean }>) {
	const lastEmitted = useRef('');
	const [text, setText] = useState(() => JSON.stringify(value ?? {}, null, 2));
	const [error, setError] = useState<string | undefined>();

	useEffect(() => {
		const incoming = JSON.stringify(value ?? {}, null, 2);
		if (incoming !== lastEmitted.current) {
			setText(incoming);
			lastEmitted.current = incoming;
		}
	}, [value]);

	const onEdit = (t: string) => {
		setText(t);
		try {
			const parsed = JSON.parse(t.trim() === '' ? '{}' : t);
			setError(undefined);
			lastEmitted.current = JSON.stringify(parsed, null, 2);
			onChange(parsed);
		} catch {
			setError('Invalid JSON');
		}
	};

	return (
		<div className="_jsonView">
			<Suspense fallback={<div className="_editorLoading">Loading…</div>}>
				<LazyEditor
					language="json"
					height="100%"
					value={text}
					onChange={(ev: string | undefined) => (readOnly ? undefined : onEdit(ev ?? ''))}
					options={{
						minimap: { enabled: false },
						fontSize: 12,
						automaticLayout: true,
						scrollBeyondLastLine: false,
						readOnly,
					}}
				/>
			</Suspense>
			{error && <div className="_error">{error}</div>}
		</div>
	);
}
