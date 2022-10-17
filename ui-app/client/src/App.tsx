import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RenderEngineContainer } from './Engine/RenderEngineContainer';
import * as getAppData from './definitions/getAppData.json';

import { FunctionDefinition } from '@fincity/kirun-js';

const def: FunctionDefinition = FunctionDefinition.from(getAppData);

export function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/*" element={<RenderEngineContainer />} />
			</Routes>
		</BrowserRouter>
	);
}
