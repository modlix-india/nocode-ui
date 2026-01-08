import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { propertiesDefinition, stylePropertiesDefinition } from './formProperties';
import FormStyle from './FormStyle';
import { styleProperties, styleDefaults } from './formStyleProperies';

const LazyForm = React.lazy(() => import(/* webpackChunkName: "Form" */ './LazyForm'));
function LoadLazyForm(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyForm {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'Form',
	displayName: 'Form',
	description: 'Form component',
	component: LoadLazyForm,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: FormStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		type: 'Form',
		name: 'Form',
		properties: {},
	},
	bindingPaths: {
		bindingPath: { name: 'value binding' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 24">
					<rect width="30" height="30" fill="#F9F9F9" />
					<path
						d="M0 12.75C0 10.6781 1.67812 9 3.75 9H12.75C13.5797 9 14.25 9.67031 14.25 10.5C14.25 11.3297 13.5797 12 12.75 12H3.75C3.3375 12 3 12.3375 3 12.75V23.25C3 23.6625 3.3375 24 3.75 24H23.25C23.6625 24 24 23.6625 24 23.25V17.25C24 16.4203 24.6703 15.75 25.5 15.75C26.3297 15.75 27 16.4203 27 17.25V23.25C27 25.3219 25.3219 27 23.25 27H3.75C1.67812 27 0 25.3219 0 23.25V12.75Z"
						fill="#EDEAEA"
					/>
					<path
						className="_FormDot1"
						d="M9.03686 18.1861C9.03686 17.7809 8.87688 17.3922 8.59212 17.1057C8.30736 16.8192 7.92114 16.6582 7.51843 16.6582C7.11572 16.6582 6.7295 16.8192 6.44474 17.1057C6.15998 17.3922 6 17.7809 6 18.1861C6 18.5913 6.15998 18.9799 6.44474 19.2665C6.7295 19.553 7.11572 19.714 7.51843 19.714C7.92114 19.714 8.30736 19.553 8.59212 19.2665C8.87688 18.9799 9.03686 18.5913 9.03686 18.1861Z"
						fill="#CD5C08"
					/>
					<path
						className="_FormDot2"
						d="M13.1474 19.2665C12.8627 19.553 12.4764 19.714 12.0737 19.714C11.671 19.714 11.2848 19.553 11 19.2665C10.7153 18.9799 10.5553 18.5913 10.5553 18.1861C10.5553 17.7809 10.7153 17.3922 11 17.1057C11.2848 16.8192 11.671 16.6582 12.0737 16.6582C12.4764 16.6582 12.8627 16.8192 13.1474 17.1057C13.4322 17.3922 13.5922 17.7809 13.5922 18.1861C13.5922 18.5913 13.4322 18.9799 13.1474 19.2665Z"
						fill="#CD5C08"
					/>
					<path
						className="_FormPen"
						d="M24.9045 5.56698L26.7883 3.67144H26.7835C27.6708 2.77858 29.1134 2.7738 30.0054 3.67144L31.0494 4.71709C31.9414 5.61472 31.9367 7.08054 31.0304 7.9734L29.1418 9.83075L24.9045 5.56698Z"
						fill="#CD5C08"
					/>
					<path
						className="_FormPen"
						d="M17.0323 13.4977L23.8273 6.65082L28.0552 10.905L21.1701 17.6898C20.8427 18.0145 20.4441 18.258 20.0075 18.406L16.6148 19.5472C16.202 19.6856 15.7512 19.5806 15.4475 19.2702C15.1438 18.9599 15.0347 18.5063 15.1723 18.0957L16.3016 14.6913C16.4487 14.2425 16.7002 13.8319 17.0323 13.4977Z"
						fill="#CD5C08"
					/>
				</IconHelper>
			),
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
