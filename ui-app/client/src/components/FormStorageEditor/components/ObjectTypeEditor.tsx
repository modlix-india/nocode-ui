import React, { useState } from 'react';
import { EditorProps } from './FSETypes';
import { duplicate } from '@fincity/kirun-js';

export default function ObjectTypeEditor(props: EditorProps) {
	const { restrictToSchema, schema, onChange, readOnly, styles } = props;

	const [hoverOn, setHoverOn] = useState<string | undefined>(undefined);

	const addField = (type: 'primitive' | 'object' | 'array') => {
		const nSchema = duplicate(schema);
		if (!nSchema.properties) nSchema.properties = {};
		let propName = 'field';
		let count = 1;

		while (nSchema.properties[propName]) propName = 'field' + count++;

		nSchema.properties[propName] =
			type === 'primitive'
				? { type: 'STRING' }
				: type === 'object'
					? { type: 'OBJECT' }
					: { type: 'ARRAY' };

		onChange(nSchema);
	};

	const objectFields: Array<JSX.Element> = Object.entries(schema.properties ?? {}).map(
		([key, value]) => {
			return <div key={key} className="_objectField"></div>;
		},
	);

	return (
		<div className="_objectEditor" style={styles.regular.objectTypeEditor ?? {}}>
			{objectFields}
			<div className="_objectAddBar" style={styles.regular.objectAddBar ?? {}}>
				<button
					className="_propAdd"
					style={
						('primitive' == hoverOn
							? styles.hover.addFieldButton
							: styles.regular.addFieldButton) ?? {}
					}
					onMouseEnter={() => setHoverOn('primitive')}
					onMouseLeave={() => setHoverOn(undefined)}
					onClick={() => addField('primitive')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 94.294 94.294"
					>
						<g>
							<path d="M94.21,19.806l-0.597-2.911c-0.448-2.19-2.59-3.604-4.771-3.168l-0.465,0.09c-0.574,0.109-1.224,0.237-1.898,0.422   c-0.695,0.167-1.34,0.371-1.912,0.554l-0.391,0.123c-0.045,0.015-0.09,0.029-0.135,0.045c-1.499,0.527-3,1.163-4.513,1.911   c-1.382,0.706-2.763,1.501-4.13,2.379c-1.271,0.834-2.539,1.74-3.789,2.711c-1.07,0.845-2.12,1.733-3.147,2.655h-7.819   l-2.176-2.362c-0.742-0.803-1.773-1.276-2.865-1.309c-1.104-0.03-2.152,0.374-2.939,1.132l-2.639,2.539H0v56.029h77.196V33.895   c0.802-0.854,1.625-1.675,2.465-2.455c0.882-0.81,1.808-1.594,2.726-2.309c0.916-0.701,1.873-1.361,2.849-1.97l0.304-0.178   c0.367-0.216,0.734-0.433,1.115-0.623c0.05-0.026,0.101-0.052,0.152-0.08c0.334-0.185,0.681-0.341,1.025-0.502l0.756-0.331   c0.34-0.14,0.68-0.283,1.028-0.393c0.063-0.021,0.127-0.044,0.19-0.067c0.326-0.122,0.662-0.212,0.996-0.306l0.575-0.164   C93.404,23.92,94.635,21.874,94.21,19.806z M16.95,72.829h-4.472l0.016-16.451l-3.879,3.415l-2.156-2.691l6.815-5.428h3.676V72.829   z M45.297,72.829H30.508v-3.109l5.311-5.369c1.572-1.609,2.6-2.729,3.082-3.35c0.483-0.622,0.83-1.197,1.043-1.729   c0.212-0.53,0.318-1.08,0.318-1.65c0-0.848-0.234-1.479-0.703-1.896c-0.468-0.414-1.092-0.621-1.873-0.621   c-0.821,0-1.616,0.188-2.389,0.563c-0.771,0.377-1.576,0.911-2.416,1.605l-2.431-2.879c1.042-0.89,1.905-1.517,2.59-1.881   c0.684-0.366,1.432-0.648,2.243-0.848c0.81-0.196,1.716-0.298,2.72-0.298c1.321,0,2.489,0.241,3.501,0.724   c1.014,0.483,1.8,1.159,2.359,2.026c0.559,0.869,0.838,1.862,0.838,2.981c0,0.974-0.17,1.889-0.513,2.741   c-0.343,0.854-0.873,1.729-1.592,2.625c-0.719,0.897-1.984,2.179-3.798,3.835l-2.721,2.562v0.202h9.218v3.763H45.297z    M67.494,71.418c-1.477,1.135-3.583,1.7-6.324,1.7c-2.295,0-4.33-0.381-6.105-1.143v-3.809c0.82,0.415,1.722,0.755,2.705,1.016   c0.986,0.26,1.959,0.39,2.924,0.39c1.476,0,2.566-0.251,3.27-0.753c0.705-0.502,1.057-1.307,1.057-2.416   c0-0.993-0.405-1.698-1.215-2.112c-0.811-0.415-2.104-0.622-3.879-0.622H58.32v-3.431h1.635c1.641,0,2.839-0.214,3.596-0.642   c0.758-0.431,1.137-1.167,1.137-2.209c0-1.602-1.004-2.4-3.01-2.4c-0.695,0-1.401,0.115-2.121,0.347   c-0.717,0.231-1.516,0.631-2.394,1.201l-2.069-3.083c1.928-1.389,4.229-2.084,6.901-2.084c2.19,0,3.919,0.445,5.188,1.332   c1.268,0.888,1.902,2.123,1.902,3.704c0,1.321-0.4,2.445-1.201,3.373c-0.801,0.925-1.925,1.562-3.371,1.909v0.088   c1.707,0.21,3,0.729,3.877,1.555c0.877,0.825,1.316,1.937,1.316,3.335C69.708,68.701,68.971,70.285,67.494,71.418z M88.145,20.888   c-0.61,0.195-1.205,0.459-1.803,0.697c-0.584,0.277-1.176,0.533-1.744,0.85c-0.58,0.289-1.138,0.626-1.699,0.953   c-1.106,0.685-2.182,1.428-3.221,2.223c-1.033,0.806-2.037,1.653-3.004,2.543c-1.93,1.791-3.738,3.73-5.408,5.78   c-0.836,1.025-1.642,2.074-2.412,3.146c-0.381,0.534-0.762,1.073-1.123,1.619c-0.355,0.532-0.736,1.114-1.021,1.601l-1.827,3.007   l-2.593-2.58L50.643,29.131l4.596-4.42l8.925,9.688c0.167-0.202,0.331-0.41,0.499-0.61c0.932-1.088,1.887-2.146,2.876-3.174   c1.976-2.056,4.093-3.982,6.345-5.756c1.129-0.879,2.301-1.719,3.502-2.505c1.213-0.779,2.463-1.501,3.754-2.163   c1.299-0.642,2.638-1.212,4.01-1.694c0.697-0.22,1.388-0.454,2.102-0.62c0.702-0.198,1.428-0.318,2.145-0.461l0.597,2.911   C89.373,20.51,88.75,20.663,88.145,20.888z" />
						</g>
					</svg>
					Primitive
				</button>
				<button
					className="_propAdd"
					style={
						('object' == hoverOn
							? styles.hover.addFieldButton
							: styles.regular.addFieldButton) ?? {}
					}
					onMouseEnter={() => setHoverOn('object')}
					onMouseLeave={() => setHoverOn(undefined)}
					onClick={() => addField('object')}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M6 2.984V2h-.09c-.313 0-.616.062-.909.185a2.33 2.33 0 0 0-.775.53 2.23 2.23 0 0 0-.493.753v.001a3.542 3.542 0 0 0-.198.83v.002a6.08 6.08 0 0 0-.024.863c.012.29.018.58.018.869 0 .203-.04.393-.117.572v.001a1.504 1.504 0 0 1-.765.787 1.376 1.376 0 0 1-.558.115H2v.984h.09c.195 0 .38.04.556.121l.001.001c.178.078.329.184.455.318l.002.002c.13.13.233.285.307.465l.001.002c.078.18.117.368.117.566 0 .29-.006.58-.018.869-.012.296-.004.585.024.87v.001c.033.283.099.558.197.824v.001c.106.273.271.524.494.753.223.23.482.407.775.53.293.123.596.185.91.185H6v-.984h-.09c-.2 0-.387-.038-.563-.115a1.613 1.613 0 0 1-.457-.32 1.659 1.659 0 0 1-.309-.467c-.074-.18-.11-.37-.11-.573 0-.228.003-.453.011-.672.008-.228.008-.45 0-.665a4.639 4.639 0 0 0-.055-.64 2.682 2.682 0 0 0-.168-.609A2.284 2.284 0 0 0 3.522 8a2.284 2.284 0 0 0 .738-.955c.08-.192.135-.393.168-.602.033-.21.051-.423.055-.64.008-.22.008-.442 0-.666-.008-.224-.012-.45-.012-.678a1.47 1.47 0 0 1 .877-1.354 1.33 1.33 0 0 1 .563-.121H6zm4 10.032V14h.09c.313 0 .616-.062.909-.185.293-.123.552-.3.775-.53.223-.23.388-.48.493-.753v-.001c.1-.266.165-.543.198-.83v-.002c.028-.28.036-.567.024-.863-.012-.29-.018-.58-.018-.869 0-.203.04-.393.117-.572v-.001a1.502 1.502 0 0 1 .765-.787 1.38 1.38 0 0 1 .558-.115H14v-.984h-.09c-.196 0-.381-.04-.557-.121l-.001-.001a1.376 1.376 0 0 1-.455-.318l-.002-.002a1.415 1.415 0 0 1-.307-.465v-.002a1.405 1.405 0 0 1-.118-.566c0-.29.006-.58.018-.869a6.174 6.174 0 0 0-.024-.87v-.001a3.537 3.537 0 0 0-.197-.824v-.001a2.23 2.23 0 0 0-.494-.753 2.331 2.331 0 0 0-.775-.53 2.325 2.325 0 0 0-.91-.185H10v.984h.09c.2 0 .387.038.562.115.174.082.326.188.457.32.127.134.23.29.309.467.074.18.11.37.11.573 0 .228-.003.452-.011.672-.008.228-.008.45 0 .665.004.222.022.435.055.64.033.214.089.416.168.609a2.285 2.285 0 0 0 .738.955 2.285 2.285 0 0 0-.738.955 2.689 2.689 0 0 0-.168.602c-.033.21-.051.423-.055.64a9.15 9.15 0 0 0 0 .666c.008.224.012.45.012.678a1.471 1.471 0 0 1-.877 1.354 1.33 1.33 0 0 1-.563.121H10z"
						/>
					</svg>
					Object
				</button>
				<button
					className="_propAdd"
					style={
						('array' == hoverOn
							? styles.hover.addFieldButton
							: styles.regular.addFieldButton) ?? {}
					}
					onMouseEnter={() => setHoverOn('array')}
					onMouseLeave={() => setHoverOn(undefined)}
					onClick={() => addField('array')}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
						<path
							d="M15 5H20V15C20 16.8856 20 17.8284 19.4142 18.4142C18.8284 19 17.8856 19 16 19H15"
							stroke="currentColor"
							stroke-width="2"
						/>
						<path
							d="M9 5H6C4.89543 5 4 5.89543 4 7V19H9"
							stroke="currentColor"
							stroke-width="2"
						/>
					</svg>
					Array
				</button>
			</div>
		</div>
	);
}
