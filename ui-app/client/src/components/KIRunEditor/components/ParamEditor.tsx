import { Parameter, ParameterType, Repository, Schema } from '@fincity/kirun-js';
import React from 'react';

interface ParamEditorProps {
	parameter: Parameter;
	schemaRepository: Repository<Schema>;
	value: any;
	onChange: (newValue: any) => void;
}

export default function ParamEditor({
	parameter,
	schemaRepository,
	value,
	onChange,
}: ParamEditorProps) {
	console.log(parameter, value);
	if (parameter.getType() === ParameterType.CONSTANT) {
		return <></>;
	}

	const isArray = parameter.isVariableArgument();

	return <div className="_paramEditor"></div>;
}
