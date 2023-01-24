import React from 'react';
import { HelperComponent } from './HelperComponent';
import { DataLocation, RenderContext } from '../types/common';
import Children from './Children';

function Page({
	definition,
	context,
	locationHistory,
}: {
	definition: any;
	context: RenderContext;
	locationHistory: Array<DataLocation | string>;
}) {
	if (!definition) return <>...</>;
	return (
		<div className="comp compPage">
			<HelperComponent definition={definition} />
			<Children
				pageDefinition={definition}
				children={{
					[definition.rootComponent]: true,
				}}
				context={context}
				locationHistory={locationHistory}
			/>
		</div>
	);
}

export default Page;
