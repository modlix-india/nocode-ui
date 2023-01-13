export const webPersonalisation = {
  name: "webPersonalisation",
  key: "webPersonalisation",
  type: "Page",
  rootComponent: "webPersonalisationGrid",
  componentDefinition: {
    webPersonalisationGrid: {
      name: "webPersonalisationGrid",
      key: "webPersonalisationGrid",
      type: "Grid",
      children: {
        webPersonalisationLabel: true,
      },
    },
    webPersonalisationLabel: {
      name: "webPersonalisationLabel",
      key: "webPersonalisationLabel",
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
          value: "Web Personalisation",
        },
      },
    },
  },
};
