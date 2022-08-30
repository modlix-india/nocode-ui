import axios from 'axios';
import { createContext, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface ComponentDefinition {
    name: string,
    key: string,
    component: string,
    permissions: string,
    readOnly: string,
    visibility: string,
    props: any
}

export interface PageDefinition {
    name: string,
    key: string,
    applicationName: string,
    title: string,
    shell: boolean,
    permissions: string,
    readOnly: string,
    components: {
        [key: string]: ComponentDefinition
    },
    events: any,
    widgets: any
}

interface PageDefinitionData {
    pageDefinition?: PageDefinition;
    pageDefinitionLoading: boolean;
    isPageDefinitionLoadFailed: boolean
    getPageDefinition: (pathname: string) => void
}

// const defaultPageDefinition: (PageDefinitionData | undefined);

export const PageDefinitionContext = createContext<PageDefinitionData | undefined>(undefined);

export const usePageDefinitionContext = () => {
	const [pageDefinition, setPageDefinition] = useState<PageDefinition | undefined>();
	const [pageDefinitionLoading, setPageDefinitionLoading] = useState(false);
	const [isPageDefinitionLoadFailed, setIsPageDefinitionLoadFailed] = useState(false);

	const getPageDefinition = useCallback((pathname: string) => {
		setPageDefinitionLoading(true);
		try {
			(async () => {
				const resp = await axios.get<PageDefinition>(`/api${pathname}`);
				setPageDefinition(resp.data);
				setIsPageDefinitionLoadFailed(false);
			})();
		} catch (error) {
			console.log('Page definition load has failed', error);
			setPageDefinitionLoading(false);
			setIsPageDefinitionLoadFailed(true);
		}
	}, []);

	return {
		pageDefinition,
		pageDefinitionLoading,
		isPageDefinitionLoadFailed,
		getPageDefinition
	};
};