import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { PageDefinitionContext, usePageDefinitionContext } from '../context/PageDefinitionContext';
import { Engine } from './Engine';

export const RenderEngineContainer = () => {
	const location = useLocation();
	return <Engine />;
	
};