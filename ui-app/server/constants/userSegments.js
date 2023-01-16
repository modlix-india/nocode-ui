export const userSegments = {
  name: "userSegments",
  key: "userSegments",
  type: "Page",
  rootComponent: "userSegmentsGrid",
  componentDefinition: {
    userSegmentsGrid: {
      name: "userSegmentsGrid",
      key: "userSegmentsGrid",
      type: "Grid",
      children: {
        userSegmentsLabel: true,
      },
    },
    userSegmentsLabel: {
      name: "userSegmentsLabel",
      key: "userSegmentsLabel",
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
          value: "User Segments",
        },
      },
    },
  },
};
