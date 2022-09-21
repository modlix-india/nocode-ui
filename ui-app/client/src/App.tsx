import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RenderEngineContainer } from './engine/RenderEngineContainer';
import * as getAppData from './definitions/getAppData.json';
import {
	setData,
	getData,
	addListener,
	store,
	storeExtractor,
	localStoreExtractor,
} from './context/StoreContext';
import {
	FunctionDefinition,
	FunctionExecutionParameters,
	KIRuntime,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import { UIFunctionRepository } from './functions';
import { UISchemaRepository } from './schemas';
import { STORE_PREFIX } from './constants';

type InitialData = {
	verifyLoginError?: number;
	applicationData?: any;
	applicationError?: number;
	verfiyLoginOutput?: any;
};

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
