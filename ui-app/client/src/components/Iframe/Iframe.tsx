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
						className="_iframeboard"
						d="M0 3.76307C0 1.6875 1.68164 0 3.75 0H26.25C28.3184 0 30 1.6875 30 3.76307V22.5784C30 24.654 28.3184 26.3415 26.25 26.3415H3.75C1.68164 26.3415 0 24.654 0 22.5784V3.76307ZM3.75 5.6446C3.75 6.14361 3.94754 6.62219 4.29917 6.97504C4.65081 7.3279 5.12772 7.52613 5.625 7.52613C6.12228 7.52613 6.59919 7.3279 6.95083 6.97504C7.30246 6.62219 7.5 6.14361 7.5 5.6446C7.5 5.14559 7.30246 4.66701 6.95083 4.31415C6.59919 3.9613 6.12228 3.76307 5.625 3.76307C5.12772 3.76307 4.65081 3.9613 4.29917 4.31415C3.94754 4.66701 3.75 5.14559 3.75 5.6446ZM26.25 5.6446C26.25 4.86259 25.623 4.23345 24.8438 4.23345H10.7812C10.002 4.23345 9.375 4.86259 9.375 5.6446C9.375 6.42661 10.002 7.05575 10.7812 7.05575H24.8438C25.623 7.05575 26.25 6.42661 26.25 5.6446Z"
						fill="url(#paint0_linear_0_1)"
					/>
					<path
						className="_iframesymbol"
						d="M16.5926 11.0269C16.2207 10.9217 15.8335 11.1343 15.7263 11.4995L12.9261 21.1225C12.8189 21.4876 13.0355 21.8678 13.4074 21.9731C13.7793 22.0783 14.1665 21.8657 14.2737 21.5005L17.0739 11.8775C17.1811 11.5124 16.9645 11.1322 16.5926 11.0269ZM18.3559 13.6067C18.0824 13.8752 18.0824 14.3112 18.3559 14.5797L20.3095 16.5L18.3537 18.4203C18.0802 18.6888 18.0802 19.1248 18.3537 19.3933C18.6272 19.6618 19.0713 19.6618 19.3447 19.3933L21.7949 16.9876C22.0684 16.7191 22.0684 16.2831 21.7949 16.0146L19.3447 13.6088C19.0713 13.3403 18.6272 13.3403 18.3537 13.6088L18.3559 13.6067ZM11.6463 13.6067C11.3728 13.3382 10.9287 13.3382 10.6553 13.6067L8.20509 16.0124C7.93164 16.2809 7.93164 16.7169 8.20509 16.9854L10.6553 19.3912C10.9287 19.6597 11.3728 19.6597 11.6463 19.3912C11.9198 19.1227 11.9198 18.6866 11.6463 18.4181L9.69052 16.5L11.6463 14.5797C11.9198 14.3112 11.9198 13.8752 11.6463 13.6067Z"
						fill="url(#paint1_linear_0_1)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_0_1"
							x1="15"
							y1="0"
							x2="15"
							y2="26.3415"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FAC5CF" />
							<stop offset="1" stopColor="#FF728D" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_0_1"
							x1="15"
							y1="11"
							x2="15"
							y2="22"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
					</defs>
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
