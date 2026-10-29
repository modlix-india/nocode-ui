import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import SignaturePadStyle from './SignaturePadStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './signaturePadProperties';
import { styleDefaults, styleProperties } from './signaturePadStyleProperties';

const LazySignaturePad = React.lazy(
	() => import(/* webpackChunkName: "SignaturePad" */ './LazySignaturePad'),
);

function LoadLazySignaturePad(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazySignaturePad {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'SignaturePad',
	displayName: 'Signature Pad',
	description:
		'Draw a signature with a mouse, finger or pen; writes a PNG data URL (transparent, ' +
		'trimmed to the ink by default) to the binding path, and removes it when cleared.',
	component: LoadLazySignaturePad,
	styleComponent: SignaturePadStyle,
	styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	bindingPaths: { bindingPath: { name: 'Signature (PNG data URL)' } },
	defaultTemplate: {
		key: '',
		type: 'SignaturePad',
		name: 'SignaturePad',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
