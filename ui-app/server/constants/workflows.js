export const workflows = {
  name: "workflows",
  key: "workflows",
  type: "Page",
  rootComponent: "workflowsGrid",
  componentDefinition: {
    workflowsGrid: {
      name: "workflowsGrid",
      key: "workflowsGrid",
      type: "Grid",
      children: {
        workflowsLabel: true,
      },
    },
    workflowsLabel: {
      name: "workflowsLabel",
      key: "workflowsLabel",
      type: "Label",
      styleProperties: {
        "6dwg67qt367xd827uywg3rt72g6377": {
          resolutions: {
            ALL: {
              color: {
                value: "blue",
              },
            },
          },
        },
      },
      properties: {
        text: {
          value: "Workflows",
        },
      },
    },
  },
};
