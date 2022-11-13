import React from 'react';
import { HelperComponent } from './HelperComponent';
import { renderChildren } from './util/renderChildren';

function Page({ definition, context }: { definition: any; context: string }) {
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
			)}
		</div>
	);
}

export default Page;
