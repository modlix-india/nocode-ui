import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useApplicationContext } from '../context/ApplicationContext';
import { useAuthContext } from '../context/AuthContext';
import { PageDefinitionContext, usePageDefinitionContext } from '../context/PageDefinitionContext';
import { Engine } from './Engine';

export const RenderEngineContainer = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuthContext();
    const { application } = useApplicationContext();
    const pageDefinitionData = usePageDefinitionContext();
    const { getPageDefinition } = pageDefinitionData;

    React.useEffect(() => {
        if (isAuthenticated && application?.name)
            getPageDefinition(location.pathname);
    }, [location, getPageDefinition, isAuthenticated]);

    return <PageDefinitionContext.Provider value={pageDefinitionData}>
        <Engine />
    </PageDefinitionContext.Provider>
}