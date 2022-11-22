import React from 'react';
import { HelperComponent } from './HelperComponent';
import { DataLocation } from './types';
import { renderChildren } from './util/renderChildren';

function Page({
	definition,
	context,
	locationHistory,
}: {
	definition: any;
	context: string;
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
