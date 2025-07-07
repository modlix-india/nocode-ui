import { HybridRepository, Repository, Schema, SchemaType, SchemaUtil } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
} from '../../context/StoreContext';
import { UISchemaRepository } from '../../schemas/common';
import { ComponentDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './formProperties';
import { RemoteRepository, REPO_SERVER } from '../../Engine/RemoteRepository';
import Children from '../Children';
import { cyrb53 } from '../../util/cyrb53';

let UI_SCHEMA_REPO: UISchemaRepository;

export default function Form(props: Readonly<ComponentProps>) {
	if (!UI_SCHEMA_REPO) UI_SCHEMA_REPO = new UISchemaRepository();

	const {
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: { schema, readOnly, useServerSchemas } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const bindingPathPath =
		bindingPath && !readOnly
			? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
			: undefined;

	const [value, setValue] = React.useState<any>(null);
	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately((_, v) => setValue(v), pageExtractor, bindingPathPath);
	}, [bindingPathPath]);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const list = [
		UI_SCHEMA_REPO,
		RemoteRepository.getRemoteSchemaRepository(undefined, undefined, false, REPO_SERVER.UI),
	];

	if (useServerSchemas) {
		list.splice(
			1,
			0,
			RemoteRepository.getRemoteSchemaRepository(
				undefined,
				undefined,
				false,
				REPO_SERVER.CORE,
			),
		);
	}

	const schemaRepository = new HybridRepository(...list);

	const [childDefinitions, setChildDefinitions] = useState<
		| {
				componentDefinitions: Record<string, ComponentDefinition>;
				renderableChildren: Record<string, boolean>;
		  }
		| undefined
	>(undefined);

	useEffect(() => {
		(async () => {
			let defs = await makeDefinition(
				readOnly,
				Schema.from(schema),
				schemaRepository,
				bindingPathPath,
			);
			setChildDefinitions(defs);
		})();
	}, [schema, useServerSchemas, bindingPathPath]);

	return (
		<div className="comp compForm" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			<Children
				pageDefinition={{
					...props.pageDefinition,
					componentDefinition: {
						...props.pageDefinition.componentDefinition,
						...childDefinitions?.componentDefinitions,
					},
				}}
				renderableChildren={childDefinitions?.renderableChildren}
				context={props.context}
				locationHistory={locationHistory}
			/>
		</div>
	);
}

async function makeDefinition(
	readOnly: boolean,
	schema: Schema | undefined,
	schemaRepository: Repository<Schema>,
	bindingPath: string | undefined,
	path: string = 'Object',
) {
	if (!schema) return { componentDefinitions: {}, renderableChildren: {} };

	const detailObject = readOnly
		? (schema.getViewDetails() ?? schema.getDetails())
		: (schema.getDetails() ?? schema.getViewDetails());

	const properties = {
		...Object.fromEntries(detailObject?.getProperties()?.entries() ?? []),
		validation: {},
	};

	const styleProperties = {
		...Object.fromEntries(detailObject?.getStyleProperties()?.entries() ?? []),
	};

	let finSchema: Schema | undefined = schema;
	if (finSchema?.getRef()) {
		finSchema = await SchemaUtil.getSchemaFromRef(
			finSchema,
			schemaRepository,
			finSchema.getRef(),
		);
	}

	if (!finSchema?.getType()) return { componentDefinitions: {}, renderableChildren: {} };

	const key = cyrb53(`${path}-${bindingPath ?? ''}`);
	let componentDefinitions: Record<string, ComponentDefinition> = {};

	if (finSchema?.getType()?.contains(SchemaType.OBJECT)) {
		let renderableChildren: Record<string, boolean> = {};
		for (const [childKey, childSchema] of finSchema.getProperties()?.entries() ?? []) {
			if (!childSchema) continue;
			const childDefs = await makeDefinition(
				readOnly,
				childSchema,
				schemaRepository,
				`${bindingPath}.${childKey}`,
				`${path}.${childKey}`,
			);
			componentDefinitions = { ...componentDefinitions, ...childDefs.componentDefinitions };
			renderableChildren = { ...renderableChildren, ...childDefs.renderableChildren };
		}
		componentDefinitions[key] = {
			key,
			name: schema.getName() ?? key,
			type: detailObject?.getPreferredComponent() ?? 'Grid',
			properties,
			styleProperties,
			children: renderableChildren,
			displayOrder: detailObject?.getOrder(),
		};
		return { componentDefinitions, renderableChildren: { [key]: true } };
	} else if (finSchema?.getType()?.contains(SchemaType.ARRAY)) {
		let renderableChildren: Record<string, boolean> = {};
		if (!finSchema.getItems()) return { componentDefinitions: {}, renderableChildren: {} };
		const items = finSchema.getItems();
		if (items!.isSingleType()) {
			const childDefs = await makeDefinition(
				readOnly,
				items!.getSingleSchema(),
				schemaRepository,
				`Parent`,
				`${path}[]`,
			);
			componentDefinitions = { ...componentDefinitions, ...childDefs.componentDefinitions };
			renderableChildren = { ...renderableChildren, ...childDefs.renderableChildren };
			properties.showAdd = { value: true };
			properties.showDelete = { value: true };
			properties.showMove = { value: true };

			componentDefinitions[key] = {
				key,
				name: schema.getName() ?? key,
				type: detailObject?.getPreferredComponent() ?? 'ArrayRepeater',
				properties,
				styleProperties,
				children: renderableChildren,
				displayOrder: detailObject?.getOrder(),
				bindingPath: { type: 'VALUE', value: bindingPath },
			};
			return { componentDefinitions, renderableChildren: { [key]: true } };
		} else if (items!.getTupleSchema()?.length) {
			const itemsList = items!.getTupleSchema()!;
			for (let i = 0; i < itemsList.length; i++) {
				const childDefs = await makeDefinition(
					readOnly,
					itemsList[i],
					schemaRepository,
					`${bindingPath}[${i}]`,
					`${path}[${i}]`,
				);
				componentDefinitions = {
					...componentDefinitions,
					...childDefs.componentDefinitions,
				};
				renderableChildren = { ...renderableChildren, ...childDefs.renderableChildren };
			}
			componentDefinitions[key] = {
				key,
				name: schema.getName() ?? key,
				type: detailObject?.getPreferredComponent() ?? 'ArrayRepeater',
				properties,
				styleProperties,
				children: renderableChildren,
				displayOrder: detailObject?.getOrder(),
				bindingPath: { type: 'VALUE', value: bindingPath },
			};
			return { componentDefinitions, renderableChildren: { [key]: true } };
		}

		return { componentDefinitions: {}, renderableChildren: {} };
	}

	if (!properties.label && detailObject?.getLabel()) {
		properties.label = {
			type: 'VALUE',
			value: detailObject?.getLabel(),
		};
	}

	if (finSchema?.getType()?.contains(SchemaType.STRING)) {
		if (finSchema.getEnums()?.length) {
			properties.data = { value: finSchema.getEnums() };
		}

		if (
			detailObject?.getValidationMessage('minLength') &&
			finSchema.getMinimum() !== undefined
		) {
			const minKey = cyrb53(`${key}-minLength`);
			properties.validation[minKey] = {
				key: minKey,
				property: {
					value: {
						message: {
							value: detailObject?.getValidationMessage('minLength'),
						},
						type: 'REGEX',
						pattern: { value: `^.{${finSchema.getMinimum()},}}$` },
					},
				},
			};
		}

		if (
			detailObject?.getValidationMessage('maxLength') &&
			finSchema.getMaximum() !== undefined
		) {
			const maxKey = cyrb53(`${key}-maxLength`);
			properties.validation[maxKey] = {
				key: maxKey,
				property: {
					value: {
						message: {
							value: detailObject?.getValidationMessage('maxLength'),
						},
						type: 'REGEX',
						pattern: { value: `^.{0,${finSchema.getMaximum()}}$` },
					},
				},
			};
		}

		if (detailObject?.getValidationMessage('pattern') && finSchema.getPattern() !== undefined) {
			const patternKey = cyrb53(`${key}-pattern`);
			properties.validation[patternKey] = {
				key: patternKey,
				property: {
					value: {
						message: {
							value: detailObject?.getValidationMessage('pattern'),
						},
						type: 'REGEX',
						pattern: { value: finSchema.getPattern() },
					},
				},
			};
		}

		componentDefinitions[key] = {
			key,
			bindingPath: {
				type: 'VALUE',
				value: bindingPath,
			},
			name: schema.getName() ?? key,
			type: detailObject?.getPreferredComponent() ?? (readOnly ? 'Text' : 'TextBox'),
			properties,
			styleProperties,
			displayOrder: detailObject?.getOrder(),
		};
	} else if (finSchema?.getType()?.contains(SchemaType.BOOLEAN)) {
		componentDefinitions[key] = {
			key,
			bindingPath: {
				type: 'VALUE',
				value: bindingPath,
			},
			name: schema.getName() ?? key,
			type: detailObject?.getPreferredComponent() ?? 'Checkbox',
			properties,
			styleProperties,
			displayOrder: detailObject?.getOrder(),
		};
	} else if (
		finSchema?.getType()?.contains(SchemaType.INTEGER) ||
		finSchema?.getType()?.contains(SchemaType.FLOAT) ||
		finSchema?.getType()?.contains(SchemaType.DOUBLE) ||
		finSchema?.getType()?.contains(SchemaType.LONG)
	) {
		if (detailObject?.getValidationMessage('minimum') && finSchema.getMinimum() !== undefined) {
			const minKey = cyrb53(`${key}-minimum`);
			properties.validation[minKey] = {
				key: minKey,
				property: {
					value: {
						message: {
							value: detailObject?.getValidationMessage('minimum'),
						},
						type: 'NUMBER_VALUE',
						minValue: { value: finSchema.getMinimum() },
					},
				},
			};
		}

		if (detailObject?.getValidationMessage('maximum') && finSchema.getMaximum() !== undefined) {
			const maxKey = cyrb53(`${key}-maximum`);
			properties.validation[maxKey] = {
				key: maxKey,
				property: {
					value: {
						message: {
							value: detailObject?.getValidationMessage('maximum'),
						},
						type: 'NUMBER_VALUE',
						maxValue: { value: finSchema.getMaximum() },
					},
				},
			};
		}

		if (
			detailObject?.getValidationMessage('multipleOf') &&
			finSchema.getMultipleOf() !== undefined
		) {
			const multipleOfKey = cyrb53(`${key}-multipleOf`);
			properties.validation[multipleOfKey] = {
				key: multipleOfKey,
				property: {
					value: {
						message: {
							value: detailObject?.getValidationMessage('multipleOf'),
						},
						type: 'NUMBER_VALUE',
						multipleOf: { value: finSchema.getMultipleOf() },
					},
				},
			};
		}
		componentDefinitions[key] = {
			key,
			bindingPath: {
				type: 'VALUE',
				value: bindingPath,
			},
			name: schema.getName() ?? key,
			type: detailObject?.getPreferredComponent() ?? (readOnly ? 'Text' : 'TextBox'),
			properties,
			styleProperties,
			displayOrder: detailObject?.getOrder(),
		};
		if (detailObject?.getPreferredComponent() === 'RangeSlider') {
			if (finSchema.getMinimum() !== undefined) {
				properties.min = { value: finSchema.getMinimum() };
			}
			if (finSchema.getMaximum() !== undefined) {
				properties.max = { value: finSchema.getMaximum() };
			}
			if (finSchema.getMultipleOf() !== undefined) {
				properties.step = { value: finSchema.getMultipleOf() };
			}
		}
	}

	return {
		componentDefinitions,
		renderableChildren: { [key]: true },
	};
}
