import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './iconProperties';
import { Component } from '../../types/common';
import IconStyle from './IconStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { styleDefaults } from './iconStyleProperies';
import { IconHelper } from '../util/IconHelper';

function Icon(props: ComponentProps) {
	const { definition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { icon, designType, colorScheme } = {}, stylePropertiesWithPseudoStates } =
		useDefinition(
			definition,
			propertiesDefinition,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
		);

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	return (
		<i
			className={`comp compIcon _icon ${designType} ${colorScheme} ${icon}`}
			style={styleProperties.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={definition} />
		</i>
	);
}

const component: Component = {
	order: 15,
	name: 'Icon',
	displayName: 'Icon',
	description: 'Icon component',
	component: Icon,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: IconStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Icon',
		type: 'Icon',
		properties: {
			icon: { value: 'fa-solid fa-icons' },
		},
	},
	sections: [{ name: 'Icons', pageName: 'icon' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 32 34">
					<path
						className="_icon3"
						d="M31.3126 26.0748C31.6285 26.2702 31.6285 26.7298 31.3126 26.9252L22.263 32.5232C21.9299 32.7292 21.5 32.4896 21.5 32.098L21.5 20.902C21.5 20.5104 21.9299 20.2708 22.263 20.4768L31.3126 26.0748Z"
						fill="url(#paint0_linear_3818_9782)"
					/>
					<path
						className="_icon4"
						d="M5.37787 17.1921C5.07338 16.6163 4.39542 16.3593 3.78644 16.5825L1.02523 17.6081C0.472983 17.8133 0.132568 18.356 0.184457 18.935C0.897655 26.8923 7.92796 32.766 15.8852 32.0528C16.4642 32.0009 16.9378 31.5694 17.042 30.9959L17.5602 28.0963C17.6716 27.4574 17.2976 26.8295 16.6774 26.6387L13.4744 25.6289C12.9273 25.4574 12.3365 25.666 12.0154 26.1357L10.8579 27.8346C8.49783 26.9697 6.50019 25.3007 5.22941 23.1321L6.70182 21.6903C7.10696 21.2909 7.20715 20.6724 6.94116 20.1645L5.37787 17.1921Z"
						fill="url(#paint1_linear_3818_9782)"
					/>
					<path
						className="_icon21"
						d="M15.1295 14.5519C14.643 15.0383 14.3706 15.6999 14.3706 16.3875V17.7625L13.508 19.0565C13.2323 19.4684 13.2874 20.0165 13.6377 20.3667C13.9879 20.717 14.536 20.7721 14.9479 20.4964L16.2419 19.6338H17.6169C18.3045 19.6338 18.9661 19.3614 19.4525 18.8749L23.3669 14.9605L21.8978 13.4914L17.9834 17.4058C17.8861 17.5031 17.7532 17.5582 17.6169 17.5582H16.4462V16.3875C16.4462 16.2513 16.5013 16.1183 16.5986 16.021L20.513 12.1066L19.0439 10.6375L15.1295 14.5519Z"
						fill="url(#paint2_linear_3818_9782)"
					/>
					<path
						className="_icon22"
						d="M24.1709 5.10646L20.7834 8.4976L20.4697 8.18385C20.0526 7.76664 19.3751 7.76664 18.9579 8.18385C18.5407 8.60107 18.5407 9.27863 18.9579 9.69585L24.2977 15.0362C24.7148 15.4534 25.3923 15.4534 25.8095 15.0362C26.2267 14.619 26.2267 13.9414 25.8095 13.5242L25.4958 13.2105L28.8832 9.81934C30.1848 8.51763 30.1848 6.40818 28.8832 5.1098C27.5816 3.81142 25.4724 3.80809 24.1742 5.1098L24.1709 5.10646Z"
						fill="url(#paint3_linear_3818_9782)"
					/>
					<path
						className="_icon1"
						d="M12.7775 0H5.98082C4.37391 0 3.06641 1.30693 3.06641 2.91441V9.48559C3.06641 11.0931 4.37391 12.4 5.98082 12.4H12.7775C14.3844 12.4 15.6919 11.0931 15.6919 9.48559V2.91441C15.6919 1.30693 14.3844 0 12.7775 0ZM14.5261 9.48559C14.5261 10.4498 13.7417 11.2342 12.7775 11.2342H5.98082C5.01656 11.2342 4.23217 10.4498 4.23217 9.48559V2.91441C4.23217 1.95015 5.01656 1.16576 5.98082 1.16576H12.7775C13.7417 1.16576 14.5261 1.95015 14.5261 2.91441V9.48559ZM12.1283 4.83382C12.356 5.06151 12.356 5.43037 12.1283 5.65805L9.79677 7.98958C9.68292 8.10343 9.53378 8.16034 9.38464 8.16034C9.23551 8.16034 9.08637 8.10342 8.97252 7.98958L6.64099 5.65805C6.41331 5.43037 6.41331 5.06151 6.64099 4.83382C6.86868 4.60613 7.23754 4.60613 7.46522 4.83382L9.38463 6.75323L11.304 4.83382C11.5317 4.60613 11.9006 4.60613 12.1283 4.83382Z"
						fill="url(#paint4_linear_3818_9782)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3818_9782"
							x1="25"
							y1="19"
							x2="25"
							y2="34"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FFA4B1" />
							<stop offset="1" stopColor="#EC465E" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3818_9782"
							x1="8.23366"
							y1="16.139"
							x2="9.7096"
							y2="32.6063"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FFA4B1" />
							<stop offset="1" stopColor="#EC465E" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3818_9782"
							x1="18.35"
							y1="10.6375"
							x2="18.35"
							y2="20.6714"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint3_linear_3818_9782"
							x1="24.2522"
							y1="4.13477"
							x2="24.2522"
							y2="15.3491"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FFA4B1" />
							<stop offset="1" stopColor="#EC465E" />
						</linearGradient>
						<linearGradient
							id="paint4_linear_3818_9782"
							x1="9.37914"
							y1="0"
							x2="9.37914"
							y2="12.4"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FFA4B1" />
							<stop offset="1" stopColor="#EC465E" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
	],
};

export default component;
