import axios from "axios";
import { createContext, useCallback, useState } from "react";

interface Application {
    title: string;
    name: string;
    loginPageName: string;
    shellPage: any; //later to be changed when page def type is finalised
    errorPageName: string;
    manifest: any //later to be changed when manifest type is finalised
    loadingPage: any //later to be changed when page def type is finalised
}

interface ApplicationContextData {
    application: Application;
    loginPage: any;
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
    getLoginPage: () => null,
    getApplication: () => null,
}

export const ApplicationContext = createContext<ApplicationContextData>(defaultApplicationData);

export const useApplicationContext = () => {
    const [application, setApplication] = useState<Application>(defaultApplication);
    const [loginPage, setLoginPage] = useState<any>({});

    const getApplication = useCallback(() => {
        (async () => {
            try {
                const resp = await axios.get<Application>('/application');
                setApplication(resp.data);
            } catch (error) {
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

    return {
        application,
        loginPage,
        getApplication,
        getLoginPage
    }
}