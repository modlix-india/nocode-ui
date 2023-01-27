import React, { useEffect } from 'react';
import { HelperComponent } from './HelperComponent';
import { DataLocation, LocationHistory, RenderContext } from '../types/common';
import Children from './Children';
import { isNullValue } from '@fincity/kirun-js';
import { runEvent } from './util/runEvent';
import { GLOBAL_CONTEXT_NAME } from '../constants';

function Page({
	definition,
	context,
	locationHistory,
}: {
	definition: any;
	context: RenderContext;
	locationHistory: Array<LocationHistory>;
}) {
	const { pageName } = context;

	useEffect(() => {
		const { eventFunctions, properties: { onLoadEvent = undefined } = {} } = definition;

		if (pageName === GLOBAL_CONTEXT_NAME) return;

		if (isNullValue(onLoadEvent) || isNullValue(eventFunctions[onLoadEvent])) return;
		(async () =>
			await runEvent(eventFunctions[onLoadEvent], 'pageOnLoad', pageName, locationHistory))();
	}, [pageName]);

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
