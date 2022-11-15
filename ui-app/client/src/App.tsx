import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RenderEngineContainer } from './Engine/RenderEngineContainer';
import * as getAppDefinition from './definitions/getAppDefinition.json';
import { runEvent } from './components/util/runEvent';
import { addListener } from './context/StoreContext';
import { STORE_PREFIX } from './constants';

export function App() {
	const [isApplicationLoadFailed, setIsApplicationFailed] = useState(false);
	const [applicationLoaded, setApplicationLoaded] = useState(false);

	useEffect(() => {
		(async () => {
			await runEvent(getAppDefinition, 'initialLoadFunction');
			setApplicationLoaded(true);
		})();
	}, []);

	useEffect(
		() =>
			addListener(`${STORE_PREFIX}.isApplicationLoadFailed`, (_, value) =>
				setIsApplicationFailed(value),
			),
		[],
	);

	if (isApplicationLoadFailed)
		return <>Application Load failed, Please contact your administrator</>;

	if (applicationLoaded)
		return (
			<BrowserRouter>
				<Routes>
					<Route path="/*" element={<RenderEngineContainer />} />
				</Routes>
			</BrowserRouter>
		);

	return <>Loading...</>;
}
