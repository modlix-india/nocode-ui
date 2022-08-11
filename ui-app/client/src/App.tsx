import React, { useEffect } from 'react';
import { AuthContext, useAuthContext } from './context/AuthContext';
import { ApplicationContext, useApplicationContext } from './context/ApplicationContext';

export function App() {
    const contextData = useAuthContext();
    const applicationData = useApplicationContext();
    const { verifyLogin, isAuthenticated } = contextData;
    const { application, getApplication, getLoginPage } = applicationData;
    useEffect(() => {
        verifyLogin();
    }, [verifyLogin]);

    useEffect(() => {
        getApplication();
    }, [getApplication]);

    useEffect(() => {
        if(!isAuthenticated && !!application.loginPageName) {
            getLoginPage();
        }
    }, [isAuthenticated, application])

    return (<AuthContext.Provider value={contextData}>
        <ApplicationContext.Provider value={applicationData}>
        <></>
        </ApplicationContext.Provider>
        </AuthContext.Provider>);
}