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

	return (
		<div className="_objectEditor" style={styles.regular.objectTypeEditor ?? {}}>
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
					Array
				</button>
			</div>
		</div>
	);
}
