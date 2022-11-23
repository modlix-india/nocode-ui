// export const application = {
//   title: "UI Engine",
//   name: "UI Engine",
//   loginPageName: "login",
//   shellPage: {
//     name: "shellDefinition",
//     key: "shellDefinition",
//     type: "Page",
//     rootComponent: "grid",
//     componentDefinition: {
//       grid: {
//         name: "grid",
//         key: "grid",
//         type: "Grid",
//         children: {
//           header: true,
//           footer: true,
//           body: true,
//         },
//       },
//       header: {
//         name: "header",
//         key: "header",
//         type: "Label",
//         properties: {
//           text: {
//             value: "Header Text",
//           },
//           displayOrder: 1,
//         },
//       },
//       footer: {
//         name: "footer",
//         key: "footer",
//         type: "Label",
//         properties: {
//           text: {
//             value: "footer Text",
//           },
//           displayOrder: 3,
//         },
//       },
//       body: {
//         name: "body",
//         key: "body",
//         type: "Page",
//         properties: {
//           definitionLocation: {
//             location: {
//               type: "EXPRESSION",
//               expression:
//                 "Store.pageDefinition.{{Store.clientDetails.pagename ?? Store.application.defaultPage}}",
//             },
//           },
//           displayOrder: 2,
//         },
//       },
//     },
//   },
//   errorPageName: "error",
//   manifest: {},
//   loadingPage: {},
//   defaultPage: "home",
// };

export const application = {
  id: "6364f8be89cd651f2da7da6d",
  createdAt: 1667561662,
  createdBy: "1",
  updatedAt: 1667654363,
  updatedBy: "1",
  name: "nothing",
  message: "default page",
  clientCode: "SYSTEM",
  appCode: "nothing",
  version: 5,
  properties: {
    defaultPage: "underConstruction",
    shellPageDefinition: {
      name: "shellDefinition",
      key: "shellDefinition",
      type: "Page",
      rootComponent: "grid",
      componentDefinition: {
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
    links: {
      "07f57e24-c919-4c3e-8846-98d16cb04f71": {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css",
      },
    },
    title: "Under Construction",
  },
};
