export const upload = {
  name: "upload",
  key: "upload",
  type: "Page",
  rootComponent: "uploadGrid",
  componentDefinition: {
    uploadGrid: {
      name: "uploadGrid",
      key: "uploadGrid",
      type: "Grid",
      children: {
        uploadLabel: true,
      },
    },
    uploadLabel: {
      name: "uploadLabel",
      key: "uploadLabel",
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
          value: "Upload",
        },
      },
    },
  },
};
