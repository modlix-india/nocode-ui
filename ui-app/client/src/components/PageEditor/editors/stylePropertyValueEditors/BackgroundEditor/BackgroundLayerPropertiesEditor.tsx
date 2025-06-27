import React from 'react';
import { IconsSimpleEditor } from '../simpleEditors/IconsSimpleEditor';
import { StyleEditorsProps, extractValue, valuesChangedOnlyValues } from '../simpleEditors';

interface BackgroundLayerPropertiesEditorProps {
	layerIndex: number;
	totalLayers: number;
	styleEditorsProps: StyleEditorsProps;
}

export function BackgroundLayerPropertiesEditor({
	layerIndex,
	totalLayers,
	styleEditorsProps,
}: BackgroundLayerPropertiesEditorProps) {
	const {
		subComponentName,
		selectedComponent,
		selectedComponentsList,
		iterateProps,
		pseudoState,
		selectorPref,
		defPath,
		locationHistory,
		pageExtractor,
	} = styleEditorsProps;

	// Extract current values
	const backgroundSize =
		extractValue({
			subComponentName,
			prop: 'backgroundSize',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value || '';

	const backgroundRepeat =
		extractValue({
			subComponentName,
			prop: 'backgroundRepeat',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value || '';

	const backgroundPosition =
		extractValue({
			subComponentName,
			prop: 'backgroundPosition',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value || '';

	// New properties for Phase 4
	const backgroundAttachment =
		extractValue({
			subComponentName,
			prop: 'backgroundAttachment',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value || '';

	const backgroundClip =
		extractValue({
			subComponentName,
			prop: 'backgroundClip',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value || '';

	const backgroundOrigin =
		extractValue({
			subComponentName,
			prop: 'backgroundOrigin',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value || '';

	// Parse comma-separated values to get layer-specific properties
	const sizeValues = backgroundSize.split(',').map((s: string) => s.trim());
	const repeatValues = backgroundRepeat.split(',').map((s: string) => s.trim());
	const positionValues = backgroundPosition.split(',').map((s: string) => s.trim());
	// New properties for Phase 4
	const attachmentValues = backgroundAttachment.split(',').map((s: string) => s.trim());
	const clipValues = backgroundClip.split(',').map((s: string) => s.trim());
	const originValues = backgroundOrigin.split(',').map((s: string) => s.trim());

	// Get current layer values or defaults
	const currentSize = layerIndex < sizeValues.length ? sizeValues[layerIndex] : 'auto';
	const currentRepeat = layerIndex < repeatValues.length ? repeatValues[layerIndex] : 'repeat';
	const currentPosition =
		layerIndex < positionValues.length ? positionValues[layerIndex] : 'center center';
	// New properties for Phase 4
	const currentAttachment =
		layerIndex < attachmentValues.length ? attachmentValues[layerIndex] : 'scroll';
	const currentClip = layerIndex < clipValues.length ? clipValues[layerIndex] : 'border-box';
	const currentOrigin =
		layerIndex < originValues.length ? originValues[layerIndex] : 'padding-box';

	// Update a specific property for this layer
	const updateLayerProperty = (prop: string, value: string) => {
		// Get the current comma-separated values
		const currentValues =
			extractValue({
				subComponentName,
				prop,
				iterateProps,
				pseudoState,
				selectorPref,
				selectedComponent,
			})?.value?.value || '';

		// Split into array
		const valuesArray = currentValues
			? currentValues.split(',').map((s: string) => s.trim())
			: [];

		// Ensure array has enough elements
		while (valuesArray.length < layerIndex + 1) {
			valuesArray.push(
				prop === 'backgroundSize'
					? 'auto'
					: prop === 'backgroundRepeat'
						? 'repeat'
						: prop === 'backgroundPosition'
							? 'center center'
							: prop === 'backgroundAttachment'
								? 'scroll'
								: prop === 'backgroundClip'
									? 'border-box'
									: 'padding-box', // backgroundOrigin default
			);
		}

		// Update the value for this layer
		valuesArray[layerIndex] = value;

		// Join back into comma-separated string
		const newValue = valuesArray.join(', ');

		// Update the property
		valuesChangedOnlyValues({
			subComponentName,
			selectedComponent,
			selectedComponentsList,
			propValues: [{ prop, value: newValue }],
			selectorPref,
			defPath,
			locationHistory,
			pageExtractor,
		});
	};

	return (
		<div className="_layerProperties">
			<div className="_propertySection">
				<div className="_simpleLabel">Size</div>
				<IconsSimpleEditor
					options={[
						{
							name: 'auto',
							description: 'Auto',
							icon: (
								<g transform="translate(9 9)">
									<rect
										y="5"
										width="9"
										height="9"
										rx="0.5"
										fill="#02B694"
										strokeOpacity={0}
									/>
									<path
										d="M9.21741 4.7826C9.2858 4.85149 9.36715 4.90617 9.45677 4.94348C9.54639 4.98079 9.6425 5 9.73958 5C9.83665 5 9.93277 4.98079 10.0224 4.94348C10.112 4.90617 10.1934 4.85149 10.2617 4.7826L12.4988 2.55151C12.5121 2.53732 12.5282 2.52601 12.546 2.51828C12.5639 2.51055 12.5831 2.50656 12.6026 2.50656C12.6221 2.50656 12.6413 2.51055 12.6592 2.51828C12.677 2.52601 12.6931 2.53732 12.7064 2.55151L13.4956 3.3407C13.5375 3.3817 13.5905 3.40941 13.648 3.42032C13.7056 3.43123 13.7651 3.42487 13.819 3.40202C13.873 3.37918 13.9189 3.34088 13.9511 3.29195C13.9833 3.24303 14.0003 3.18566 14 3.12709V0.296698C14 0.218011 13.9687 0.142548 13.9131 0.0869083C13.8575 0.0312686 13.782 1.09673e-05 13.7033 1.09673e-05H10.8729C10.8142 -0.000498772 10.7566 0.0168047 10.7079 0.0496411C10.6592 0.082478 10.6216 0.129307 10.6 0.183957C10.5766 0.237603 10.5704 0.297138 10.582 0.354468C10.5937 0.411798 10.6228 0.464139 10.6652 0.504378L11.4485 1.29356C11.4624 1.30752 11.4733 1.32422 11.4805 1.3426C11.4876 1.36099 11.4909 1.38066 11.49 1.40037C11.4908 1.41919 11.4875 1.43794 11.4803 1.45535C11.4731 1.47277 11.4623 1.48842 11.4485 1.50124L9.21741 3.73826C9.14852 3.80665 9.09384 3.888 9.05653 3.97762C9.01922 4.06724 9.00001 4.16335 9.00001 4.26043C9.00001 4.3575 9.01922 4.45362 9.05653 4.54324C9.09384 4.63286 9.14852 4.7142 9.21741 4.7826Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
								</g>
							),
						},
						{
							name: 'cover',
							description: 'Cover',
							icon: (
								<g transform="translate(9 9)">
									<path
										d="M13.8261 0.173923C13.7714 0.118809 13.7063 0.0750675 13.6346 0.0452176C13.5629 0.0153677 13.486 0 13.4083 0C13.3307 0 13.2538 0.0153677 13.1821 0.0452176C13.1104 0.0750675 13.0453 0.118809 12.9906 0.173923L11.201 1.95879C11.1903 1.97014 11.1775 1.97919 11.1632 1.98538C11.1489 1.99156 11.1335 1.99475 11.1179 1.99475C11.1023 1.99475 11.0869 1.99156 11.0727 1.98538C11.0584 1.97919 11.0455 1.97014 11.0348 1.95879L10.4035 1.32744C10.37 1.29464 10.3276 1.27247 10.2816 1.26374C10.2355 1.25501 10.1879 1.26011 10.1448 1.27838C10.1016 1.29666 10.0649 1.3273 10.0391 1.36644C10.0133 1.40558 9.99973 1.45147 10 1.49833V3.76264C10 3.82559 10.025 3.88596 10.0695 3.93047C10.114 3.97498 10.1744 3.99999 10.2374 3.99999H12.5017C12.5487 4.0004 12.5947 3.98656 12.6337 3.96029C12.6727 3.93402 12.7028 3.89655 12.72 3.85283C12.7387 3.80992 12.7437 3.76229 12.7344 3.71643C12.725 3.67056 12.7018 3.62869 12.6678 3.5965L12.0412 2.96515C12.0301 2.95398 12.0213 2.94062 12.0156 2.92592C12.0099 2.91121 12.0073 2.89547 12.008 2.8797C12.0074 2.86465 12.01 2.84965 12.0158 2.83572C12.0215 2.82179 12.0302 2.80926 12.0412 2.799L13.8261 1.00939C13.8812 0.954678 13.9249 0.889599 13.9548 0.817905C13.9846 0.746211 14 0.669318 14 0.591658C14 0.513997 13.9846 0.437105 13.9548 0.36541C13.9249 0.293716 13.8812 0.228637 13.8261 0.173923Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
									<path
										d="M0.173848 13.8244C0.227904 13.8805 0.292797 13.9249 0.36458 13.9551C0.436362 13.9853 0.513534 14.0006 0.591402 14C0.669269 14.0006 0.746441 13.9853 0.818224 13.9551C0.890006 13.9249 0.954899 13.8805 1.00896 13.8244L2.79779 12.0403C2.80844 12.029 2.82131 12.0199 2.83559 12.0138C2.84987 12.0076 2.86527 12.0044 2.88083 12.0044C2.89639 12.0044 2.91179 12.0076 2.92607 12.0138C2.94035 12.0199 2.95322 12.029 2.96387 12.0403L3.59494 12.6667C3.61613 12.6895 3.64185 12.7076 3.67045 12.7198C3.69905 12.7321 3.7299 12.7382 3.76101 12.7378C3.79065 12.7449 3.82153 12.7449 3.85117 12.7378C3.89449 12.72 3.93158 12.6898 3.95776 12.651C3.98393 12.6121 3.99803 12.5664 3.99826 12.5196V10.2373C3.99826 10.1743 3.97327 10.114 3.92877 10.0695C3.88428 10.025 3.82394 10 3.76101 10H1.49768C1.4507 9.9996 1.4047 10.0134 1.36573 10.0397C1.32677 10.066 1.29667 10.1034 1.27942 10.1471C1.26075 10.19 1.25574 10.2376 1.26508 10.2835C1.27442 10.3293 1.29765 10.3712 1.33161 10.4033L1.95794 11.0344C1.96929 11.0451 1.97833 11.0579 1.98452 11.0722C1.9907 11.0865 1.99389 11.1019 1.99389 11.1174C1.99389 11.133 1.9907 11.1484 1.98452 11.1627C1.97833 11.177 1.96929 11.1898 1.95794 11.2005L0.173848 12.9893C0.118758 13.044 0.075035 13.1091 0.045198 13.1807C0.015361 13.2524 0 13.3292 0 13.4069C0 13.4845 0.015361 13.5614 0.045198 13.633C0.075035 13.7047 0.118758 13.7697 0.173848 13.8244Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
									<path
										d="M10.1477 12.7376C10.1774 12.7447 10.2082 12.7447 10.2379 12.7376C10.269 12.738 10.2998 12.7319 10.3284 12.7196C10.357 12.7074 10.3828 12.6893 10.4039 12.6665L11.035 12.0402C11.0456 12.0288 11.0585 12.0198 11.0728 12.0136C11.087 12.0074 11.1024 12.0042 11.118 12.0042C11.1336 12.0042 11.149 12.0074 11.1632 12.0136C11.1775 12.0198 11.1904 12.0288 11.201 12.0402L12.9897 13.8241C13.0441 13.8798 13.109 13.924 13.1807 13.9542C13.2524 13.9844 13.3295 14 13.4073 14C13.4851 14 13.5621 13.9844 13.6338 13.9542C13.7055 13.924 13.7704 13.8798 13.8248 13.8241C13.8799 13.7695 13.9236 13.7044 13.9534 13.6328C13.9833 13.5611 13.9986 13.4842 13.9986 13.4066C13.9986 13.329 13.9833 13.2521 13.9534 13.1805C13.9236 13.1088 13.8799 13.0438 13.8248 12.9891L12.0408 11.2004C12.0295 11.1897 12.0204 11.1769 12.0142 11.1626C12.0081 11.1483 12.0049 11.1329 12.0049 11.1174C12.0049 11.1018 12.0081 11.0864 12.0142 11.0721C12.0204 11.0578 12.0295 11.045 12.0408 11.0343L12.6671 10.4033C12.7011 10.3711 12.7243 10.3293 12.7336 10.2834C12.743 10.2376 12.738 10.19 12.7193 10.1471C12.702 10.1034 12.6719 10.0659 12.633 10.0397C12.594 10.0134 12.548 9.9996 12.501 10H10.2379C10.2067 10 10.1759 10.0061 10.1471 10.0181C10.1183 10.03 10.0922 10.0475 10.0701 10.0695C10.0481 10.0915 10.0306 10.1177 10.0187 10.1465C10.0068 10.1752 10.0006 10.2061 10.0006 10.2372V12.5004C9.99694 12.5504 10.0092 12.6003 10.0356 12.6429C10.062 12.6856 10.1013 12.7187 10.1477 12.7376Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
									<path
										d="M3.99999 1.49777C4.00027 1.4509 3.98666 1.405 3.96089 1.36585C3.93512 1.3267 3.89834 1.29605 3.85518 1.27777C3.81202 1.2595 3.76441 1.2544 3.71836 1.26313C3.67231 1.27187 3.62988 1.29403 3.59641 1.32684L2.96492 1.95833C2.95466 1.96937 2.94213 1.97805 2.9282 1.98379C2.91427 1.98952 2.89926 1.99218 2.8842 1.99157C2.86843 1.99225 2.85269 1.98965 2.83798 1.98393C2.82327 1.97821 2.8099 1.96949 2.79874 1.95833L1.00873 0.17307C0.89791 0.0622551 0.747613 0 0.590898 0C0.434182 0 0.283885 0.0622551 0.17307 0.17307C0.0622551 0.283885 0 0.434182 0 0.590898C0 0.747613 0.0622551 0.89791 0.17307 1.00873L1.95833 2.79874C1.96969 2.80939 1.97874 2.82226 1.98493 2.83656C1.99111 2.85085 1.9943 2.86625 1.9943 2.88183C1.9943 2.8974 1.99111 2.91281 1.98493 2.9271C1.97874 2.94139 1.96969 2.95426 1.95833 2.96492L1.33159 3.59641C1.3015 3.63126 1.28267 3.67442 1.27758 3.72019C1.27249 3.76595 1.28139 3.81219 1.3031 3.8528C1.32037 3.89653 1.35049 3.934 1.38948 3.96028C1.42846 3.98655 1.4745 4.0004 1.52151 3.99999H3.76259C3.82555 3.99999 3.88594 3.97498 3.93046 3.93046C3.97498 3.88594 3.99999 3.82555 3.99999 3.76259V1.49777Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
									<path
										d="M8.6 5H5.4C5.17909 5 5 5.17909 5 5.4V8.6C5 8.82091 5.17909 9 5.4 9H8.6C8.82091 9 9 8.82091 9 8.6V5.4C9 5.17909 8.82091 5 8.6 5Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
								</g>
							),
						},
						{
							name: 'contain',
							description: 'Contain',
							icon: (
								<g transform="translate(9 9)">
									<path
										d="M10.1739 3.82608C10.2286 3.88119 10.2937 3.92493 10.3654 3.95478C10.4371 3.98463 10.514 4 10.5917 4C10.6693 4 10.7462 3.98463 10.8179 3.95478C10.8896 3.92493 10.9547 3.88119 11.0094 3.82608L12.799 2.04121C12.8097 2.02986 12.8225 2.02081 12.8368 2.01462C12.8511 2.00844 12.8665 2.00525 12.8821 2.00525C12.8977 2.00525 12.9131 2.00844 12.9273 2.01462C12.9416 2.02081 12.9545 2.02986 12.9652 2.04121L13.5965 2.67256C13.63 2.70536 13.6724 2.72753 13.7184 2.73626C13.7645 2.74499 13.8121 2.73989 13.8552 2.72162C13.8984 2.70334 13.9351 2.6727 13.9609 2.63356C13.9867 2.59442 14 0.669318 14 0.591658C14 0.513997 13.9846 0.437105 13.9548 0.36541C13.9249 0.293716 13.8812 0.228637 13.8261 0.173923Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
									<path
										d="M3.82444 10.1756C3.77039 10.1195 3.70549 10.0751 3.63371 10.0449C3.56193 10.0147 3.48476 9.99943 3.40689 10C3.32902 9.99943 3.25185 10.0147 3.18007 10.0449C3.10828 10.0751 3.04339 10.1195 2.98934 10.1756L1.2005 11.9597C1.1903 11.97014 11.1775 11.97919 11.1632 11.98538C11.1489 11.99156 11.13302 11.9956 11.11746 11.9956C11.1019 11.9956 11.0865 11.9924 11.07222 11.9862C11.05794 11.9801 11.04507 11.971 11.03442 11.9597L0.403349 11.3333C0.382165 11.3105 0.356446 11.2924 0.327844 11.2802C0.299242 11.2679 0.268392 11.2618 0.237277 11.2622C0.20764 11.2551 0.17676 11.2551 0.147123 11.2622C0.103797 11.28 0.0667093 11.3102 0.0405331 11.349C0.0143569 11.3879 0.000263929 11.4336 3.00407e-05 11.4804L3.00407e-05 13.7627C3.00407e-05 13.8257 0.0250256 13.886 0.0695179 13.9305C0.11401 13.975 0.174355 14 0.237277 14H2.50061C2.54759 14.0004 2.5936 13.9866 2.63256 13.9603C2.67152 13.934 2.70162 13.8966 2.71887 13.8529C2.73754 13.81 2.74255 13.7624 2.73321 13.7165C2.72387 13.6707 2.70064 13.6288 2.66668 13.5967L2.04035 12.9656C2.029 12.9549 2.01996 12.9421 2.01377 12.9278C2.00759 12.9135 2.0044 12.8981 2.0044 12.8826C2.0044 12.867 2.00759 12.8516 2.01377 12.8373C2.01996 12.823 2.029 12.8102 2.04035 12.7995L3.82444 11.0107C3.87953 10.956 3.92326 10.8909 3.95309 10.8193C3.98293 10.7476 3.99829 10.6708 3.99829 10.5931C3.99829 10.5155 3.98293 10.4386 3.95309 10.367C3.92326 10.2953 3.87953 10.2303 3.82444 10.1756Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
									<path
										d="M13.8508 11.2624C13.8212 11.2553 13.7903 11.2553 13.7607 11.2624C13.7295 11.262 13.6987 11.2681 13.6701 11.2804C13.6415 11.2926 13.6158 11.3107 13.5946 11.3335L12.9636 11.9598C12.9529 11.9712 12.9401 11.9802 12.9258 11.9864C12.9115 11.9926 12.8961 11.9958 12.8805 11.9958C12.865 11.9958 12.8496 11.9926 12.8353 11.9864C12.821 11.9802 12.8082 11.9712 12.7975 11.9598L11.0088 10.1759C10.9544 10.1202 10.8895 10.076 10.8178 10.0458C10.7461 10.0156 10.6691 10 10.5913 10C10.5135 10 10.4365 10.0156 10.3647 10.0458C10.293 10.076 10.2281 10.1202 10.1737 10.1759C10.1187 10.2305 10.0749 10.2956 10.0451 10.3672C10.0153 10.4389 9.99991 10.5158 9.99991 10.5934C9.99991 10.671 10.0153 10.7479 10.0451 10.8195C10.0749 10.8912 10.1187 10.9562 10.1737 11.0109L11.9577 12.7996C11.9691 12.8103 11.9781 12.8231 11.9843 12.8374C11.9905 12.8517 11.9937 12.8671 11.9937 12.8826C11.9937 12.8982 11.9905 12.9136 11.9843 12.9279C11.9781 12.9422 11.9691 12.955 11.9577 12.9657L11.3314 13.5967C11.2975 13.6289 11.2742 13.6707 11.2649 13.7166C11.2556 13.7624 11.2606 13.81 11.2792 13.8529C11.2965 13.8966 11.3266 13.9341 11.3655 13.9603C11.4045 13.9866 11.4505 14.0004 11.4975 14H13.7607C13.7918 14 13.8227 13.9939 13.8514 13.9819C13.8802 13.97 13.9064 13.9525 13.9284 13.9305C13.9504 13.9085 13.9679 13.8823 13.9798 13.8535C13.9917 13.8248 13.9979 13.7939 13.9979 13.7628V11.4996C14.0016 11.4496 13.9894 11.3997 13.9629 11.3571C13.9365 11.3144 13.8972 11.2813 13.8508 11.2624Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
									<path
										d="M8.58307e-06 2.50223C-0.000266552 2.5491 0.0133383 2.595 0.0391088 2.63415C0.0648792 2.6733 0.101662 2.70395 0.144821 2.72223C0.187981 2.7405 0.235586 2.7456 0.281636 2.73687C0.327686 2.72813 0.370121 2.70597 0.403592 2.67316L1.03508 2.04167C1.04534 2.03063 1.05787 2.02195 1.0718 2.01621C1.08573 2.01048 1.10074 2.00782 1.1158 2.00843C1.13157 2.00775 1.14731 2.01035 1.16202 2.01607C1.17673 2.02179 1.1901 2.03051 1.20126 2.04167L2.99127 3.82693C3.10209 3.93774 3.25239 4 3.4091 4C3.56582 4 3.71612 3.93774 3.82693 3.82693C3.93774 3.71612 4 3.56582 4 3.4091C4 3.25239 3.93774 3.10209 3.82693 2.99127L2.04167 1.20126C2.03031 1.19061 2.02126 1.17774 2.01507 1.16344C2.00889 1.14915 2.0057 1.13375 2.0057 1.11817C2.0057 1.1026 2.00889 1.08719 2.01507 1.0729C2.02126 1.05861 2.03031 1.04574 2.04167 1.03508L2.66841 0.403592C2.6985 0.368737 2.71733 0.325583 2.72242 0.279814C2.72751 0.234045 2.71861 0.187809 2.6969 0.147198C2.67963 0.103468 2.64951 0.0659971 2.61052 0.039722C2.57154 0.0134468 2.5255 -0.000399113 2.47849 8.58307e-06L0.237411 8.58307e-06C0.174448 8.58307e-06 0.114064 0.0250206 0.0695422 0.0695422C0.0250206 0.114064 8.58307e-06 0.174448 8.58307e-06 0.237411L8.58307e-06 2.50223Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
									<path
										d="M8.6 5H5.4C5.17909 5 5 5.17909 5 5.4V8.6C5 8.82091 5.17909 9 5.4 9H8.6C8.82091 9 9 8.82091 9 8.6V5.4C9 5.17909 8.82091 5 8.6 5Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
								</g>
							),
						},
					]}
					selected={currentSize}
					onChange={value => updateLayerProperty('backgroundSize', value as string)}
					withBackground={true}
				/>
			</div>

			<div className="_propertySection">
				<div className="_simpleLabel">Repeat</div>
				<IconsSimpleEditor
					options={[
						{
							name: 'no-repeat',
							description: 'No repeat',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										fill="none"
										stroke="#02B694"
										strokeWidth="1"
									/>
									<rect x="4" y="4" width="6" height="6" fill="#02B694" />
									<line
										x1="1"
										y1="1"
										x2="13"
										y2="13"
										stroke="#FF5555"
										strokeWidth="1.5"
									/>
								</g>
							),
						},
						{
							name: 'repeat',
							description: 'Repeat',
							icon: (
								<g transform="translate(9 9)">
									<rect x="2" y="2" width="4" height="4" fill="#02B694" />
									<rect x="6" y="2" width="4" height="4" fill="#02B694" />
									<rect x="10" y="2" width="4" height="4" fill="#02B694" />
									<rect x="2" y="6" width="4" height="4" fill="#02B694" />
									<rect x="6" y="6" width="4" height="4" fill="#02B694" />
									<rect x="10" y="6" width="4" height="4" fill="#02B694" />
									<rect x="2" y="10" width="4" height="4" fill="#02B694" />
									<rect x="6" y="10" width="4" height="4" fill="#02B694" />
									<rect x="10" y="10" width="4" height="4" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'repeat-x',
							description: 'Repeat horizontally',
							icon: (
								<g transform="translate(9 9)">
									<rect x="2" y="5" width="4" height="4" fill="#02B694" />
									<rect x="6" y="5" width="4" height="4" fill="#02B694" />
									<rect x="10" y="5" width="4" height="4" fill="#02B694" />
									<line
										x1="2"
										y1="3"
										x2="14"
										y2="3"
										stroke="#02B694"
										strokeWidth="1"
									/>
									<line
										x1="2"
										y1="11"
										x2="14"
										y2="11"
										stroke="#02B694"
										strokeWidth="1"
									/>
									<path d="M14 7L16 5L16 9L14 7Z" fill="#02B694" />
									<path d="M2 7L0 5L0 9L2 7Z" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'repeat-y',
							description: 'Repeat vertically',
							icon: (
								<g transform="translate(9 9)">
									<rect x="5" y="2" width="4" height="4" fill="#02B694" />
									<rect x="5" y="6" width="4" height="4" fill="#02B694" />
									<rect x="5" y="10" width="4" height="4" fill="#02B694" />
									<line
										x1="3"
										y1="2"
										x2="3"
										y2="14"
										stroke="#02B694"
										strokeWidth="1"
									/>
									<line
										x1="11"
										y1="2"
										x2="11"
										y2="14"
										stroke="#02B694"
										strokeWidth="1"
									/>
									<path d="M7 14L5 16L9 16L7 14Z" fill="#02B694" />
									<path d="M7 2L5 0L9 0L7 2Z" fill="#02B694" />
								</g>
							),
						},
					]}
					selected={currentRepeat}
					onChange={value => updateLayerProperty('backgroundRepeat', value as string)}
					withBackground={true}
				/>
			</div>

			<div className="_propertySection">
				<div className="_simpleLabel">Position</div>
				<IconsSimpleEditor
					options={[
						{
							name: 'center center',
							description: 'Center Center',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<circle cx="7" cy="7" r="2" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'left top',
							description: 'Top Left',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<circle cx="3" cy="3" r="1.5" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'right top',
							description: 'Top Right',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<circle cx="11" cy="3" r="1.5" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'left bottom',
							description: 'Bottom Left',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<circle cx="3" cy="11" r="1.5" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'right bottom',
							description: 'Bottom Right',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<circle cx="11" cy="11" r="1.5" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'center top',
							description: 'Top Center',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<circle cx="7" cy="3" r="1.5" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'center bottom',
							description: 'Bottom Center',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<circle cx="7" cy="11" r="1.5" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'left center',
							description: 'Left Center',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<circle cx="3" cy="7" r="1.5" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'right center',
							description: 'Right Center',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<circle cx="11" cy="7" r="1.5" fill="#02B694" />
								</g>
							),
						},
					]}
					selected={currentPosition}
					onChange={value => updateLayerProperty('backgroundPosition', value as string)}
					withBackground={true}
				/>
			</div>

			{/* New properties for Phase 4 */}
			<div className="_propertySection">
				<div className="_simpleLabel">Attachment</div>
				<IconsSimpleEditor
					options={[
						{
							name: 'scroll',
							description: 'Scroll with page',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										fill="#02B694"
									/>
									<path d="M5 5L9 5" stroke="white" strokeWidth="1" />
									<path d="M5 7L9 7" stroke="white" strokeWidth="1" />
									<path d="M5 9L9 9" stroke="white" strokeWidth="1" />
									<path
										d="M12 4L14 4L14 12L6 12L6 10"
										stroke="#02B694"
										strokeWidth="1"
									/>
								</g>
							),
						},
						{
							name: 'fixed',
							description: 'Fixed to viewport',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										fill="#02B694"
									/>
									<path d="M5 5L9 5" stroke="white" strokeWidth="1" />
									<path d="M5 7L9 7" stroke="white" strokeWidth="1" />
									<path d="M5 9L9 9" stroke="white" strokeWidth="1" />
									<path d="M3 3L3 1L11 1L11 3" stroke="#02B694" strokeWidth="1" />
									<path
										d="M3 11L3 13L11 13L11 11"
										stroke="#02B694"
										strokeWidth="1"
									/>
								</g>
							),
						},
						{
							name: 'local',
							description: 'Scroll with element',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										fill="#02B694"
									/>
									<path d="M5 5L9 5" stroke="white" strokeWidth="1" />
									<path d="M5 7L9 7" stroke="white" strokeWidth="1" />
									<path d="M5 9L9 9" stroke="white" strokeWidth="1" />
									<path d="M4 4L1 4L1 10L4 10" stroke="#02B694" strokeWidth="1" />
									<path
										d="M10 4L13 4L13 10L10 10"
										stroke="#02B694"
										strokeWidth="1"
									/>
								</g>
							),
						},
					]}
					selected={currentAttachment}
					onChange={value => updateLayerProperty('backgroundAttachment', value as string)}
					withBackground={true}
				/>
			</div>

			<div className="_propertySection">
				<div className="_simpleLabel">Clip</div>
				<IconsSimpleEditor
					options={[
						{
							name: 'border-box',
							description: 'Border Box',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="2"
										fill="none"
									/>
									<rect x="4" y="4" width="6" height="6" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'padding-box',
							description: 'Padding Box',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<rect x="4" y="4" width="6" height="6" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'content-box',
							description: 'Content Box',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<rect x="5" y="5" width="4" height="4" fill="#02B694" />
								</g>
							),
						},
						{
							name: 'text',
							description: 'Text',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<text x="4" y="9" fill="#02B694" fontSize="6">
										T
									</text>
								</g>
							),
						},
					]}
					selected={currentClip}
					onChange={value => updateLayerProperty('backgroundClip', value as string)}
					withBackground={true}
				/>
			</div>

			<div className="_propertySection">
				<div className="_simpleLabel">Origin</div>
				<IconsSimpleEditor
					options={[
						{
							name: 'border-box',
							description: 'Border Box',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="2"
										fill="none"
									/>
									<rect
										x="4"
										y="4"
										width="6"
										height="6"
										fill="#02B694"
										fillOpacity="0.5"
									/>
								</g>
							),
						},
						{
							name: 'padding-box',
							description: 'Padding Box',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<rect
										x="4"
										y="4"
										width="6"
										height="6"
										fill="#02B694"
										fillOpacity="0.5"
									/>
								</g>
							),
						},
						{
							name: 'content-box',
							description: 'Content Box',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										stroke="#02B694"
										strokeWidth="1"
										fill="none"
									/>
									<rect
										x="5"
										y="5"
										width="4"
										height="4"
										fill="#02B694"
										fillOpacity="0.5"
									/>
								</g>
							),
						},
					]}
					selected={currentOrigin}
					onChange={value => updateLayerProperty('backgroundOrigin', value as string)}
					withBackground={true}
				/>
			</div>
		</div>
	);
}
