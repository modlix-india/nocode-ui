import React, { useEffect } from 'react';
import { Page } from '../components/Page';
import { addListener, getData } from '../context/StoreContext';

export const Engine = () => {
	return (
		<Page
			definition={{
				name: 'shellpage',
				key: 'shellpage',
				type: 'Page',
				properties: {
					definitionLocation: {
						location: {
							expression: 'Store.application.shellPage',
							type: 'EXPRESSION',
						},
					},
				},
			}}
		/>
	);
};
