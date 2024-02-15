import React, { useEffect, useState } from 'react';

export default function CommonCheckBox({
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: (value: boolean) => void;
}) {
	const [inChecked, setInChecked] = useState<boolean>(checked ?? false);

	useEffect(() => setInChecked(checked ?? false), [checked]);

	return <input type="checkbox" checked={inChecked} onChange={e => onChange(e.target.checked)} />;
}
