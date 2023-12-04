import React from 'react';

export default function GlobalLoader({ noSpin }: { noSpin?: boolean }) {
	return (
		<div
			style={{
				height: '100vh',
				width: '100vw',
				alignItems: 'center',
				justifyContent: 'center',
				display: 'flex',
			}}
		>
			<div
				style={{
					width: '2vmax',
					height: '2vmax',
					border: '3px solid rgba(0,0,0,0.1)',
					borderRadius: '50%',
					borderTopColor: 'rgba(0,0,0,0.3)',
					display: 'block',
					animation: noSpin ? 'none' : '_spin 3s linear infinite',
				}}
			></div>
		</div>
	);
}
