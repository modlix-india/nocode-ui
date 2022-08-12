import React, { useEffect } from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";
import { AuthContext, useAuthContext, useAuthContextData } from './context/AuthContext';
import { ApplicationContext, useApplicationContextData } from './context/ApplicationContext';
import { RenderEngineContainer } from './Engine/RenderEngineContainer';

export function App() {
    const contextData = useAuthContextData();
    const applicationData = useApplicationContextData();
    const { verifyLogin, isAuthenticated } = contextData;
    const { application, getApplication, getLoginPage } = applicationData;
    useEffect(() => {
        verifyLogin();
    }, [verifyLogin]);

    useEffect(() => {
        getApplication();
    }, [getApplication]);

    useEffect(() => {
        if (!isAuthenticated && !!application?.loginPageName) {
            getLoginPage();
        }
    }, [isAuthenticated, application])

    return (<AuthContext.Provider value={contextData}>
        <ApplicationContext.Provider value={applicationData}>
            <BrowserRouter>
                <Routes>
                    <Route path="/*" element={<RenderEngineContainer />} />
                </Routes>
            </BrowserRouter>
        </ApplicationContext.Provider>
    </AuthContext.Provider>);
}