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
    defaultPage: "pagename",
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
          styleProperties: {
            hdsbs7y7gcwg476ctrh623q: {
              resolutions: {
                ALL: {
                  flexDirection: "column",
                },
              },
            },
          },
          children: {
            header: true,
            // footer: true,
            body: true,
          },
        },
        header: {
          name: "header",
          key: "header",
          type: "Grid",

          children: {
            fincityBrandLabel: true,
          },
          children: {
            fincityBrandLabel: true,
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
        fincityBrandLabel: {
          name: "fincityBrandLabel",
          key: "fincityBrandLabel",
          type: "Label",
          properties: {
            text: {
              value: "Fincity",
            },
          },
        },
      },
    },
    links: {
      "07f57e24-c919-4c3e-8846-98d16cb04f71": {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css",
      },
      "1ddbcbf1-6c91-4bb8-988e-a91984f4efbb": {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      "37e7758d-62ec-4d24-b661-dd385eb4af4b": {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
      },
      "26e3defe-3675-4901-81b4-07f285af73e5": {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;700&display=swap",
      },
      "2c3392c1-f44d-4d7d-922c-8be6ad69f192": {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap",
      },
    },
    title: "Under Construction",
  },
};
