import { isNullValue } from '@fincity/kirun-js';
import React from 'react';
import ReactDOM from 'react-dom';
interface Props {
	children: React.ReactNode;
	parent?: HTMLElement;
}

const Portal: React.FC<Props> = ({ children, parent }) => {
	const el = React.useMemo(() => document.createElement('div'), []);

	// Layout effect : consumers measure the portalled content in their own layout effects, which
	// run after this one. Appending on a passive effect would leave the container detached at that
	// point, so every measurement would read zeroes and paint once at the wrong place.
	React.useLayoutEffect(() => {
		const target = parent ? parent : document.body;
		target.appendChild(el);
		return () => {
			target.removeChild(el);
		};
	}, [el, parent]);
	return ReactDOM.createPortal(children, el);
};

export default Portal;
