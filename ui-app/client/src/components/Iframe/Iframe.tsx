import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './iframeProperties';
import IframeStyle from './IframeStyle';
import { styleDefaults } from './iframeStyleProperties';
import { IconHelper } from '../util/IconHelper';

function Iframe(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const { locationHistory, definition } = props;
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			width,
			height,
			srcdoc,
			src,
			sandbox,
			referrerpolicy,
			name,
			loading,
			allowfullscreen,
			allow,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	let shouldRenderIframe = false;

	if (!srcdoc?.trim()) {
		try {
			if (src) {
				new URL(src, window.location.origin);
				shouldRenderIframe = true;
			}
		} catch (err) {}
	} else shouldRenderIframe = true;

	return (
		<div className="comp compIframe" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			{shouldRenderIframe ? (
				<iframe
					className="iframe"
					style={resolvedStyles.iframe ?? {}}
					width={width}
					src={srcdoc ? undefined : src}
					srcDoc={srcdoc}
					height={height}
					name={name}
					loading={loading}
					allow={allow}
					sandbox={sandbox}
					referrerPolicy={referrerpolicy}
					allowFullScreen={allowfullscreen}
				></iframe>
			) : null}
		</div>
	);
}

const component: Component = {
	order: 18,
	name: 'Iframe',
	displayName: 'Iframe',
	description: 'Iframe component',
	component: Iframe,
	styleComponent: IframeStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Iframe',
		type: 'Iframe',
		properties: {},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M0 3.76307C0 1.6875 1.68164 0 3.75 0H26.25C28.3184 0 30 1.6875 30 3.76307V22.5784C30 24.654 28.3184 26.3415 26.25 26.3415H3.75C1.68164 26.3415 0 24.654 0 22.5784V3.76307ZM3.75 5.6446C3.75 6.14361 3.94754 6.62219 4.29917 6.97504C4.65081 7.3279 5.12772 7.52613 5.625 7.52613C6.12228 7.52613 6.59919 7.3279 6.95083 6.97504C7.30246 6.62219 7.5 6.14361 7.5 5.6446C7.5 5.14559 7.30246 4.66701 6.95083 4.31415C6.59919 3.9613 6.12228 3.76307 5.625 3.76307C5.12772 3.76307 4.65081 3.9613 4.29917 4.31415C3.94754 4.66701 3.75 5.14559 3.75 5.6446ZM26.25 5.6446C26.25 4.86259 25.623 4.23345 24.8438 4.23345H10.7812C10.002 4.23345 9.375 4.86259 9.375 5.6446C9.375 6.42661 10.002 7.05575 10.7812 7.05575H24.8438C25.623 7.05575 26.25 6.42661 26.25 5.6446Z"
						fill="#EDEAEA"
					/>
					<path
						d="M0 10H30V26C30 27.6569 28.6569 29 27 29H3C1.34315 29 0 27.6569 0 26V10Z"
						fill="#FFDB00"
					/>
					<path
						className="_iframesymbolslash"
						d="M16.5927 14.0269C16.2208 13.9217 15.8335 14.1343 15.7263 14.4995L12.9261 24.1225C12.8189 24.4876 13.0355 24.8678 13.4074 24.9731C13.7793 25.0783 14.1665 24.8657 14.2737 24.5005L17.0739 14.8775C17.1811 14.5124 16.9646 14.1322 16.5927 14.0269Z"
						fill="white"
					/>
					<path
						className="_iframesymbolstart"
						d="M10.6553 16.6076C10.9287 16.3391 11.3728 16.3391 11.6463 16.6076C11.9198 16.8761 11.9198 17.3122 11.6463 17.5807L9.69052 19.501L11.6463 21.4191C11.9198 21.6876 11.9198 22.1236 11.6463 22.3921C11.3728 22.6606 10.9287 22.6606 10.6553 22.3921L8.20509 19.9864C7.93164 19.7179 7.93164 19.2819 8.20509 19.0134L10.6553 16.6076Z"
						fill="white"
					/>
					<path
						className="_iframesymbolend"
						d="M18.3558 16.6074C18.3555 16.6078 18.3551 16.6081 18.3548 16.6085C18.6283 16.3411 19.0716 16.3414 19.3447 16.6096L21.7949 19.0153C22.0683 19.2838 22.0683 19.7199 21.7949 19.9884L19.3447 22.3941C19.0712 22.6626 18.6271 22.6626 18.3537 22.3941C18.0802 22.1256 18.0802 21.6896 18.3537 21.4211L20.3094 19.5008L18.3558 17.5805C18.0827 17.3123 18.0824 16.8771 18.3548 16.6085C18.3544 16.6088 18.354 16.6092 18.3537 16.6095L18.3558 16.6074Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'iframe',
			displayName: 'Iframe',
			description: 'Iframe',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
