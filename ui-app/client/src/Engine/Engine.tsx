import React, { useCallback, useEffect } from 'react';
import { Application, useApplicationContext } from '../context/ApplicationContext';
import { useAuthContext } from '../context/AuthContext';
import { PageDefinition, usePageDefinitionContext } from '../context/PageDefinitionContext';

export const Engine = () => {
    const { isAuthenticated } = useAuthContext();
    const { application, loginPage, isApplicationLoadFailed, applicationLoading } = useApplicationContext();
    const { pageDefinition, pageDefinitionLoading, isPageDefinitionLoadFailed } = usePageDefinitionContext();

    const render = useCallback((pageDefinition: PageDefinition, application: Application, shell?: PageDefinition) => {
        return <>Render coming soon...</>
    }, [application, loginPage, pageDefinition]);

    useEffect(() => {
        // console.log(application, applicationLoading);
    }, [application]);

    if(!isAuthenticated) {
        console.log(isApplicationLoadFailed, applicationLoading, application?.name, loginPage);
        if(isApplicationLoadFailed) {
            return <>Something really went wrong</>
        }
        if(applicationLoading) {
            return <>Loading...</>
        }
        if(application?.name && loginPage) {
            console.log(`i'm here`);
            return render(loginPage, application)
        }
    }
    return <></>

}