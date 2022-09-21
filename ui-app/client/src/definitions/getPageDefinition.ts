export const getPageDefinition = (url: string) => {
	return {
		name: 'getPageDefinition',
		namespace: 'UIApp',
		parameters: {},
		events: {
			output: {
				name: 'output',
				parameters: {
					pageData: {
						name: 'pageData',
						type: 'Object',
					},
				},
			},
		},
		steps: {
			pageData: {
				statementName: 'pageData',
				namespace: 'UIEngine',
				name: 'FetchData',
				parameterMap: {
					url: [{ type: 'VALUE', value: { value: url } }],
				},
			},
			genOutput: {
				statementName: 'genOutput',
				namespace: 'System',
				name: 'GenerateEvent',
				parameterMap: {
					eventName: [{ type: 'VALUE', value: 'output' }],
					results: [
						{
							type: 'VALUE',
							value: {
								name: 'pageData',
								value: {
									isExpression: true,
									value: 'Steps.pageData.output.data',
								},
							},
						},
					],
				},
				dependentStatements: ['Steps.setpageData.output'],
			},
			setpageData: {
				statementName: 'setpageData',
				namespace: 'UIEngine',
				name: 'SetStore',
				parameterMap: {
					path: [{ type: 'VALUE', value: 'Store.pageDefinition' }],
					value: [
						{
							type: 'EXPRESSION',
							expression: 'Steps.pageData.output.data',
						},
					],
				},
			},
			setPageDefinitionFailureData: {
				statementName: 'setPageDefinitionFailureData',
				namespace: 'UIEngine',
				name: 'SetStore',
				parameterMap: {
					path: [
						{
							type: 'VALUE',
							value: 'Store.isPageDefinitionLoadFailed',
						},
					],
					value: [
						{
							type: 'EXPRESSION',
							expression: 'null != Steps.pageData.error.error',
						},
					],
				},
			},
		},
	};
};
