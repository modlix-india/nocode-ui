import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { STORE_PREFIX } from '../constants';

export interface Application {
    title: string;
    name: string;
    loginPageName: string;
    shellPage: any; //later to be changed when page def type is finalised
    errorPageName: string;
    manifest: any //later to be changed when manifest type is finalised
    loadingPage: any //later to be changed when page def type is finalised
}

export const useApplicationData = (getData: (path: string) => any, addListener: (path: string, callback: ({path: string, value: any}) => void) => () => void) => {
	const [application, setApplication] = useState<Application | undefined>(getData(`${STORE_PREFIX}.application`));
	const [applicationLoading, setApplicationLoading] = useState(getData(`${STORE_PREFIX}.applicationLoading`) || false);
	const [isApplicationLoadFailed, setIsApplicationLoadFailed] = useState(getData(`${STORE_PREFIX}.applicationLoadingFailed`) ||  false);

	useEffect(() => {
		const applicationUnsub = addListener(`${STORE_PREFIX}.application`, ({value}) => {
			setApplication(value);
		});
		const applicationLoadingUnsub = addListener(`${STORE_PREFIX}.application`, ({value}) => {
			setApplicationLoading(value);
		});
		const applicationLoadingFailedUnsub = addListener(`${STORE_PREFIX}.application`, ({value}) => {
			setIsApplicationLoadFailed(value);
		});
		return () => {
			applicationUnsub();
			applicationLoadingUnsub();
			applicationLoadingFailedUnsub();
		};
	}, [setApplication, setApplicationLoading, setIsApplicationLoadFailed]);

	const getApplication = useCallback((setData: <T>(path: string, value: T) => void) => {
		(async () => {
			try {
				setData(`${STORE_PREFIX}.applicationLoading`, true);
				const resp = await axios.get<Application>('/application');
				setData(`${STORE_PREFIX}.application`, resp.data);
				setData(`${STORE_PREFIX}.applicationLoading`, false);
			} catch (error) {
				setData(`${STORE_PREFIX}.applicationLoading`, false);
				setData(`${STORE_PREFIX}.applicationLoadingFailed`, true);
			}
		})();
	}, []);

	return useMemo(() => ({
		application,
		applicationLoading,
		isApplicationLoadFailed,
		getApplication,
	}), [
		application,
		applicationLoading,
		isApplicationLoadFailed,
		getApplication,
	]);
};