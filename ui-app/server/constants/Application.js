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
    defaultPage: "dashboard",
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
                  width: {
                    value: "100%",
                  },
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
          styleProperties: {
            hdsbs7y7gc48723r4r6h5bwg476ctrh623q: {
              resolutions: {
                ALL: {
                  backgroundColor: {
                    value: "#212B35",
                  },
                  height: { value: "100vh" },
                  width: { value: "260px" },
                  borderRadius: { value: "0px 24px 24px 0px" },
                  flexDirection: { value: "column" },
                },
              },
            },
          },
          children: {
            fincityBrandGrid: true,
            fincityMenuGrid: true,
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
        fincityBrandGrid: {
          name: "fincityBrandGrid",
          key: "fincityBrandGrid",
          type: "Grid",
          displayOrder: 1,
          styleProperties: {
            "6dwg67qt367xd827uywg3rt72g6377": {
              resolutions: {
                ALL: {
                  height: { value: "96px" },
                  justifyContent: { value: "center" },
                  alignItems: { value: "center" },
                },
              },
            },
          },
          children: {
            fincityBrandLabel: true,
          },
        },
        fincityBrandLabel: {
          name: "fincityBrandLabel",
          key: "fincityBrandLabel",
          type: "Label",
          styleProperties: {
            "6dwg67qt367xd827uywg3rt72g6377": {
              resolutions: {
                ALL: {
                  color: { value: "white" },
                },
              },
            },
          },
          properties: {
            text: {
              value: "Fincity",
            },
          },
        },
        fincityMenuGrid: {
          name: "fincityMenuGrid",
          key: "fincityMenuGrid",
          type: "Grid",
          displayOrder: 2,
          styleProperties: {
            "6dwg67qt367xd827uywg3rt72g6377": {
              resolutions: {
                ALL: {
                  flexDirection: {
                    value: "column",
                  },
                  width: { value: "260px" },
                },
              },
            },
          },
          children: {
            dashboardMenu: true,
            userMenu: true,
            channelMenu: true,
          },
        },
        dashboardMenu: {
          name: "dashboardMenu",
          key: "dashboardMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Dashboard",
            },
            icon: {
              value: "fa-regular fa-clipboard",
            },
            linkPath: {
              value: "/page/dashboard",
            },
            pathsActiveFor: {
              value: "/,dashboard",
            },
          },

          displayOrder: 1,
        },
        userMenu: {
          name: "userMenu",
          key: "userMenu",
          type: "Menu",
          properties: {
            label: {
              value: "User",
            },
            icon: {
              value: "fa-regular fa-user",
            },
            pathsActiveFor: {
              value: "usersegments,workflows,campaigns,user",
            },
          },
          children: {
            userSegmentMenu: true,
            workflowsMenu: true,
            campaignsMenu: true,
          },
          displayOrder: 2,
        },
        channelMenu: {
          name: "channelMenu",
          key: "channelMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Channels",
            },
            pathsActiveFor: {
              value: "upload,webpersonalisation,channels",
            },
          },
          children: {
            uploadMenu: true,
            webPersonalisationMenu: true,
          },
          displayOrder: 2,
        },
        campaignsMenu: {
          name: "campaignsMenu",
          key: "campaignsMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Campaigns",
            },
            linkPath: {
              value: "/page/campaigns",
            },
            pathsActiveFor: {
              value: "campaigns",
            },
          },
          displayOrder: 1,
        },
        workflowsMenu: {
          name: "workflowsMenu",
          key: "workflowsMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Workflows",
            },
            linkPath: {
              value: "/page/workflows",
            },
            pathsActiveFor: {
              value: "workflows",
            },
          },
          displayOrder: 2,
        },
        userSegmentMenu: {
          name: "userSegmentMenu",
          key: "userSegmentMenu",
          type: "Menu",
          properties: {
            label: {
              value: "User Segment",
            },
            linkPath: {
              value: "/page/usersegments",
            },
            pathsActiveFor: {
              value: "usersegments",
            },
          },
          displayOrder: 3,
        },
        uploadMenu: {
          name: "uploadMenu",
          key: "uploadMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Upload",
            },
            linkPath: {
              value: "/page/upload",
            },
            pathsActiveFor: {
              value: "upload",
            },
          },
          displayOrder: 1,
        },
        webPersonalisationMenu: {
          name: "webPersonalisationMenu",
          key: "webPersonalisationMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Web Personalisation",
            },
            linkPath: {
              value: "/page/webpersonalisation",
            },
            pathsActiveFor: {
              value: "webpersonalisation",
            },
          },
          displayOrder: 2,
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
