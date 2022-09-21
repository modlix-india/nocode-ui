import {
	FunctionDefinition,
	FunctionExecutionParameters,
	KIRuntime,
	TokenValueExtractor,
} from '@fincity/kirun-js';

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { STORE_PREFIX } from '../constants';
import {
	addListener,
	getData,
	localStoreExtractor,
	setData,
	store,
	storeExtractor,
} from '../context/StoreContext';
import { pathBreaker } from '../util';
import { Engine } from './Engine';
import * as getAppData from './../definitions/getAppData.json';
import { UIFunctionRepository } from '../functions';
import { UISchemaRepository } from '../schemas';

const def: FunctionDefinition = FunctionDefinition.from(getAppData);

export const RenderEngineContainer = () => {
	const [appLoading, setAppLoading] = useState(false);
	const [isApplicationLoadFailed, setIsApplicationFailed] = useState(
		getData(`${STORE_PREFIX}.isApplicationLoadFailed`),
	);
	const [applicationData, setApplicationData] = useState(
		getData(`${STORE_PREFIX}.application`),
	);
	const { pathname } = useLocation();
	const clientDetails = pathBreaker(pathname);
	setData(`${STORE_PREFIX}.clientDetails`, clientDetails);
	const { appname, clientcode, pagename, pathParams } = clientDetails;
	useEffect(() => {
		const unsubscribe = addListener(
			`${STORE_PREFIX}.isApplicationLoadFailed`,
			(_, value) => {
				setIsApplicationFailed(value);
			},
		);

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		(async () => {
			setAppLoading(true);
			const executionPlan = await new KIRuntime(def).getExecutionPlan(
				new FunctionExecutionParameters(
					UIFunctionRepository,
					UISchemaRepository,
				).setValuesMap(
					new Map<string, TokenValueExtractor>([
						[storeExtractor.getPrefix(), storeExtractor],
						[localStoreExtractor.getPrefix(), localStoreExtractor],
					]),
				),
			);
			const appData = await new KIRuntime(def).execute(
				new FunctionExecutionParameters(
					UIFunctionRepository,
					UISchemaRepository,
				).setValuesMap(
					new Map<string, TokenValueExtractor>([
						[storeExtractor.getPrefix(), storeExtractor],
						[localStoreExtractor.getPrefix(), localStoreExtractor],
					]),
				),
			);
			setAppLoading(false);
		})();
	}, []);

	if (appLoading) return <>Loading...</>;

	if (isApplicationLoadFailed)
		return <>Application Load failed, Please contact your administrator</>;

	return <Engine />;
};
