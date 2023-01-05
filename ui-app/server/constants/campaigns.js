export const campaigns = {
  name: "campaigns",
  key: "campaigns",
  type: "Page",
  rootComponent: "campaignsGrid",
  componentDefinition: {
    campaignsGrid: {
      name: "campaignsGrid",
      key: "campaignsGrid",
      type: "Grid",
      children: {
        campaignsLabel: true,
      },
    },
    campaignsLabel: {
      name: "campaignsLabel",
      key: "campaignsLabel",
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
          value: "Campaigns",
        },
      },
    },
  },
};
