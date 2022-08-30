import React from 'react';
import {
	BrowserRouter,
	Routes,
	Route,
} from 'react-router-dom';
import { RenderEngineContainer } from './engine/RenderEngineContainer';

export function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/*" element={<RenderEngineContainer />} />
			</Routes>
		</BrowserRouter>
	);
}