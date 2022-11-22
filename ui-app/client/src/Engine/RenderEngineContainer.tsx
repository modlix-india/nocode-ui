import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { STORE_PREFIX } from '../constants';
import { addListener, getData, setData } from '../context/StoreContext';
import { pathBreaker } from '../util';
import { Engine } from './Engine';
import * as getAppData from './../definitions/getAppData.json';
import { runEvent } from '../components/util/runEvent';

export const RenderEngineContainer = () => {
	const [appLoading, setAppLoading] = useState(false);
	const [isApplicationLoadFailed, setIsApplicationFailed] = useState(
		getData(`${STORE_PREFIX}.isApplicationLoadFailed`, []),
	);
	const [applicationData, setApplicationData] = useState(
		getData(`${STORE_PREFIX}.application`, []),
	);
	const { pathname } = useLocation();
	const clientDetails = pathBreaker(pathname);
	setData(`${STORE_PREFIX}.clientDetails`, clientDetails);
	const { appname, clientcode, pagename } = clientDetails;
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
			const appData = await runEvent(getAppData, 'initialLoadFunction');
			setData(
				`Store.functionExecutions.initialLoadFunction.isRunning`,
				false,
			);
			setAppLoading(false);
		})();
	}, []);

	if (appLoading) return <>Loading...</>;

	if (isApplicationLoadFailed)
		return <>Application Load failed, Please contact your administrator</>;

	return <Engine />;
};
