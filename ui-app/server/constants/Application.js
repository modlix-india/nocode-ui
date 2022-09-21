export const application = {
  title: "UI Engine",
  name: "UI Engine",
  loginPageName: "login",
  shellPage: {
    name: "shellDefinition",
    key: "shellDefinition",
    type: "Page",
    rootComponent: "grid",
    children: {
      grid: {
        name: "grid",
        key: "grid",
        type: "Grid",
        children: {
          header: true,
          footer: true,
          body: true,
        },
      },
      header: {
        name: "header",
        key: "header",
        type: "Label",
        properties: {
          text: {
            value: "Header Text",
          },
          displayOrder: 1,
        },
      },
      footer: {
        name: "footer",
        key: "footer",
        type: "Label",
        properties: {
          text: {
            value: "footer Text",
          },
          displayOrder: 3,
        },
      },
      body: {
        name: "body",
        key: "body",
        type: "Page",
        properties: {
          definitionLocation: {
            location: {
              type: "EXPRESSION",
              expression:
                "Store.pageDefinition.{{Store.clientDetails.pagename ?? Store.application.defaultPage}}",
            },
          },
          displayOrder: 2,
        },
      },
    },
  },
  errorPageName: "error",
  manifest: {},
  loadingPage: {},
  defaultPage: "home",
};
