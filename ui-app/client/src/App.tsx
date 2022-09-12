import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RenderEngineContainer } from './engine/RenderEngineContainer';
import * as getAppData from './definitions/getAppData.json';
import { setData, getData, addListener } from './context/StoreContext';
import {
	FunctionDefinition,
	FunctionExecutionParameters,
	KIRuntime,
} from '@fincity/kirun-js';
import { UIFunctionRepository } from './functions';
import { UISchemaRepository } from './schemas';
import { STORE_PREFIX } from './constants';

const def: FunctionDefinition = FunctionDefinition.from(getAppData);

export function App() {
	useEffect(() => {
		(async () => {
			const appData = await new KIRuntime(def).execute(
				new FunctionExecutionParameters(
					UIFunctionRepository,
					UISchemaRepository,
				),
			);
			console.log(appData);
		})();
	}, []);

	useEffect(() => {
		setData('LocalStore.a.b.c[0]', 'Hello');
		setData('LocalStore.a.b.c[1]', 'World');
	}, []);
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/*" element={<RenderEngineContainer />} />
			</Routes>
		</BrowserRouter>
	);
}
