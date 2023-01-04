import React from 'react';
import { HelperComponent } from './HelperComponent';
import { DataLocation, RenderContext } from '../types/common';
import { renderChildren } from './util/renderChildren';

function Page({
	definition,
	context,
	locationHistory,
}: {
	definition: any;
	context: RenderContext;
	locationHistory: Array<DataLocation | string>;
}) {
	if (!definition) return <>Loading...</>;
	return (
		<div className="comp compPage">
			<HelperComponent definition={definition} />
			{renderChildren(
				definition,
				{
					[definition.rootComponent]: true,
				},
				context,
				locationHistory,
			)}
		</div>
	);
}

export default Page;
