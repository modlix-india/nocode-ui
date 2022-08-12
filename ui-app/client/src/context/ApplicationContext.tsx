import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface Application {
    title: string;
    name: string;
    loginPageName: string;
    shellPage: any; //later to be changed when page def type is finalised
    errorPageName: string;
    manifest: any //later to be changed when manifest type is finalised
    loadingPage: any //later to be changed when page def type is finalised
}

interface ApplicationContextData {
    application?: Application;
    loginPage: any;
    applicationLoading: boolean;
    isApplicationLoadFailed: boolean;
    getLoginPage: () => void;
    getApplication: () => void;
}

const defaultApplication: Application = {
    title: '',
    name: '',
    loginPageName: '',
    shellPage: {},
    errorPageName: '',
    manifest: {},
    loadingPage: {},
}

const defaultApplicationData: ApplicationContextData = {
    application: defaultApplication,
    loginPage: {},
    applicationLoading: false,
    isApplicationLoadFailed: false,
    getLoginPage: () => null,
    getApplication: () => null,
}

export const ApplicationContext = createContext<ApplicationContextData | undefined>(undefined);

export const useApplicationContextData = () => {
    const [application, setApplication] = useState<Application | undefined>(undefined);
    const [loginPage, setLoginPage] = useState<any>({});
    const [applicationLoading, setApplicationLoading] = useState(false);
    const [isApplicationLoadFailed, setIsApplicationLoadFailed] = useState(false);

    const getApplication = useCallback(() => {
        (async () => {
            try {
                setApplicationLoading(true);
                const resp = await axios.get<Application>('/application');
                setApplication(resp.data);
                setApplicationLoading(false);
            } catch (error) {
                setApplicationLoading(false);
                setIsApplicationLoadFailed(true);
                console.log('Failed to load Application', error)
                //Code to load error page when application fails
            }
        })()
    }, [setApplication]);

    const getLoginPage = useCallback(() => {
        (async () => {
            try {
                const resp = await axios.get('/loginPageDefinition')
                setLoginPage(resp.data);
            } catch (error) {
                console.log('Failed to load Login Page', error)
                // Write fallback for not being able to load login page
            }
        })()
    }, [setLoginPage]);

    return useMemo(() => ({
        application,
        loginPage,
        applicationLoading,
        isApplicationLoadFailed,
        getApplication,
        getLoginPage
    }), [
        application,
        loginPage,
        applicationLoading,
        isApplicationLoadFailed,
        getApplication,
        getLoginPage
    ])
}

export function useApplicationContext() {
    const appContext = useContext(ApplicationContext)

    if (!appContext) {
        throw new Error('usePostsContext must be used within the PostsContext.Provider');
    }

    return appContext;
}