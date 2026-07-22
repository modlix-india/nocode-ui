import React, { ReactNode } from 'react';

export default function Row({
	label,
	hint,
	children,
}: Readonly<{ label: string; hint?: string; children: ReactNode }>) {
	return (
		<>
			<label className="_rightJustify">{label} :</label>
			<div className="_leftJustify">
				<div className="_flexRow">{children}</div>
				{hint ? <span className="_hint">{hint}</span> : undefined}
			</div>
		</>
	);
}
