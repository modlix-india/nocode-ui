import React from 'react';

export default function PathParts({
	path,
	setPath,
}: {
	path: string;
	setPath: (p: string) => void;
}) {
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
