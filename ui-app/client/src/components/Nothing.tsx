import React from 'react';
import { HelperComponent } from './HelperComponent';

export default function Nothing({ definition }: { definition: any }) {
	return (
		<div className="comp compNothing">
			<HelperComponent definition={definition} />
			No component with type {definition.type} not found.
		</div>
	);
}
