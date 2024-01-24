import React, { Fragment } from 'react';

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
			<div>
				<i
					style={{
						color: '#FFC728',
						fontSize: '24px',
					}}
					className={`fa fa-2x fa-solid fa-folder`}
				/>
			</div>
			<span
				style={{ fontFamily: 'Inter', color: 'rgba(0, 0, 0, 0.80)' }}
				className={path === '' ? '' : '_clickable'}
				onClick={() => (path !== '' ? setPath('') : undefined)}
			>
				<span>
					<i
						style={{ color: 'rgba(0, 0, 0, 0.40)', marginRight: '3px' }}
						className="fa-solid fa-chevron-right"
					></i>
				</span>
				All assets
			</span>
			{parts
				.filter(e => e !== '')
				.map((p, i, arr) => {
					// const slash = i === 0 ? <></> : <span>\</span>;
					const slash = (
						<span>
							<i
								style={{ color: 'rgba(0, 0, 0, 0.40)', marginRight: '3px' }}
								className="fa-solid fa-chevron-right"
							></i>
						</span>
					);
					if (i === arr.length - 1)
						return (
							<Fragment key={i}>
								{slash}
								<span style={{ fontFamily: 'Inter', fontWeight: 500 }} key={i}>
									{p}
								</span>
							</Fragment>
						);
					return (
						<Fragment key={i}>
							{slash}
							<span
								className="_clickable"
								key={i}
								onClick={() => setPath('\\' + arr.slice(0, i + 1).join('\\'))}
								style={{ color: 'rgba(0, 0, 0, 0.80)', fontFamily: 'Inter' }}
							>
								{p}
							</span>
						</Fragment>
					);
				})}
		</div>
	);
}
