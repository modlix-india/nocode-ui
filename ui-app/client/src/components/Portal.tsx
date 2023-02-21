import { isNullValue } from '@fincity/kirun-js';
import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
	children: React.ReactNode;
	coords?: { left: number; top: number };
	parent?: HTMLElement;
};
const Portal: React.FC<Props> = ({ children, parent, coords }) => {
	const el = React.useMemo(() => document.createElement('div'), []);

	React.useEffect(() => {
		const target = parent ? parent : document.body;
		target.appendChild(el);
		return () => {
			target.removeChild(el);
		};
	}, [el, parent]);
	return ReactDOM.createPortal(children, el);
};

export default Portal;
