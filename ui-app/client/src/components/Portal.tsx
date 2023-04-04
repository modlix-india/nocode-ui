import { isNullValue } from '@fincity/kirun-js';
import React from 'react';
import ReactDOM from 'react-dom';
interface Props {
	children: React.ReactNode;
	parent?: HTMLElement;
}

const Portal: React.FC<Props> = ({ children, parent }) => {
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
