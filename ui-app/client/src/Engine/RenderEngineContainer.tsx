import React from 'react';
import { useLocation } from 'react-router-dom';
import { Engine } from './Engine';

export const RenderEngineContainer = () => {
	const location = useLocation();

	return <Engine />;
};
