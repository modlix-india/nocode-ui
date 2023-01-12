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
      eventFunctions: {
        toggleMenu: {
          name: "toggleMenuDefinition",
          namespace: "UIApp",
          parameters: {},
          events: {
            output: {
              name: "output",
              parameters: {},
            },
          },
          steps: {
            toggleMenu: {
              statementName: "toggleMenuData",
              namespace: "UIEngine",
              name: "SetStore",
              parameterMap: {
                path: {
                  settoggleMenuData: {
                    key: "settoggleMenuData",
                    type: "VALUE",
                    value: "Store.isMenuClosed",
                  },
                },
                value: {
                  settoggleMenuDataValue: {
                    key: "settoggleMenuDataValue",
                    type: "EXPRESSION",
                    expression: "Store.isMenuClosed ? false : true",
                  },
                },
              },
            },
            genOutput: {
              statementName: "genOutput",
              namespace: "System",
              name: "GenerateEvent",
              parameterMap: {
                eventName: {
                  genOutputEventName: {
                    key: "genOutputEventName",
                    type: "VALUE",
                    value: "output",
                  },
                },
                results: {
                  genOutputResults: {
                    key: "genOutputResults",
                    type: "VALUE",
                    value: {
                      name: "toggleMenu",
                      value: {
                        isExpression: true,
                        value: "Store.isMenuClosed",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
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
                  // width: { value: "260px" },
                  borderRadius: { value: "0px 24px 24px 0px" },
                  flexDirection: { value: "column" },
                },
              },
            },
          },
          children: {
            fincityBrandGrid: true,
            fincityMenuGrid: true,
            fincityClosedMenuGrid: true,
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
                  minHeight: { value: "96px" },
                  justifyContent: { value: "center" },
                  alignItems: { value: "center" },
                },
              },
            },
          },
          children: {
            fincityBrandLabel: true,
            closeAndOpenButton: true,
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
        closeAndOpenButton: {
          name: "closeAndOpenButton",
          type: "Button",
          key: "closeAndOpenButton",
          properties: {
            type: {
              value: "fabButtonMini",
            },
            leftIcon: {
              value: "fa-solid fa-bars",
            },
            onClick: {
              value: "toggleMenu",
            },
          },
        },
        fincityMenuGrid: {
          name: "fincityMenuGrid",
          key: "fincityMenuGrid",
          type: "Grid",
          displayOrder: 2,
          properties: {
            visibility: {
              location: {
                type: "EXPRESSION",
                expression:
                  "Store.isMenuClosed = false or Store.isMenuClosed = null",
              },
            },
          },
          styleProperties: {
            "6dwg67qt367xd827uywg3rt72g6377": {
              resolutions: {
                ALL: {
                  flexDirection: {
                    value: "column",
                  },
                  width: { value: "260px" },
                  overflow: { value: "auto" },
                },
              },
            },
          },
          children: {
            dashboardMenu: true,
            userMenu: true,
            campaignsMenu: true,
            workflowsMenu: true,
            userSegmentMenu: true,
            channelMenu: true,
            webPersonalisationMenu: true,
          },
        },
        fincityClosedMenuGrid: {
          name: "fincityClosedMenuGrid",
          key: "fincityClosedMenuGrid",
          type: "Grid",
          displayOrder: 2,
          properties: {
            visibility: {
              location: {
                type: "VALUE",
                value: "Store.isMenuClosed",
              },
            },
          },
          styleProperties: {
            "6dwg67qt367xd827uywg3rt72g6377": {
              resolutions: {
                ALL: {
                  flexDirection: {
                    value: "column",
                  },
                  width: { value: "80px" },
                  overflow: { value: "auto" },
                },
              },
            },
          },
          children: {
            dashboardClosedMenu: true,
            userClosedMenu: true,
            campaignsClosedMenu: true,
            workflowsClosedMenu: true,
            userSegmentClosedMenu: true,
            channelClosedMenu: true,
            webPersonalisationClosedMenu: true,
          },
        },
        dashboardClosedMenu: {
          name: "dashboardClosedMenu",
          key: "dashboardClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Dashboard",
            },
            onlyIconMenu: {
              value: true,
            },
            icon: {
              value: "fa-regular fa-clipboard",
            },
            linkPath: {
              value: "/dashboard",
            },
            pathsActiveFor: {
              value: "/,dashboard",
            },
          },
          displayOrder: 0,
        },
        userClosedMenu: {
          name: "userClosedMenu",
          key: "userClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "User",
            },
            onlyIconMenu: {
              value: true,
            },
            icon: {
              value: "fa-regular fa-user",
            },
            pathsActiveFor: {
              value: "user_analytics,user,list_of_users",
            },
          },
          children: {
            listOfUsersClosedMenu: true,
            userAnalyticsClosedMenu: true,
          },
          displayOrder: 1,
        },
        campaignsClosedMenu: {
          name: "campaignsClosedMenu",
          key: "campaignsClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Campaigns",
            },
            onlyIconMenu: {
              value: true,
            },
            icon: {
              value: "fa-solid fa-bullhorn",
            },
            linkPath: {
              value: "/campaigns",
            },
            pathsActiveFor: {
              value: "campaigns",
            },
          },
          displayOrder: 2,
        },
        workflowsClosedMenu: {
          name: "workflowsClosedMenu",
          key: "workflowsClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Workflows",
            },
            onlyIconMenu: {
              value: true,
            },
            icon: {
              value: "fa-solid fa-sitemap",
            },
            linkPath: {
              value: "/workflows",
            },
            pathsActiveFor: {
              value: "workflows",
            },
          },
          displayOrder: 3,
        },
        userSegmentClosedMenu: {
          name: "userSegmentClosedMenu",
          key: "userSegmentClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "User Segment",
            },
            onlyIconMenu: {
              value: true,
            },
            icon: {
              value: "fa-solid fa-users-viewfinder",
            },
            linkPath: {
              value: "/usersegments",
            },
            pathsActiveFor: {
              value: "usersegments",
            },
          },
          displayOrder: 4,
        },
        channelClosedMenu: {
          name: "channelClosedMenu",
          key: "channelClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Channels",
            },
            onlyIconMenu: {
              value: true,
            },
            icon: {
              value: "fa-brands fa-facebook-f",
            },
            pathsActiveFor: {
              value: "upload,channels,sms,whatsapp,email",
            },
          },
          children: {
            uploadClosedMenu: true,
            emailClosedMenu: true,
            whatsappClosedMenu: true,
            smsClosedMenu: true,
          },
          displayOrder: 5,
        },
        webPersonalisationClosedMenu: {
          name: "webPersonalisationClosedMenu",
          key: "webPersonalisationClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Web Personalisation",
            },
            onlyIconMenu: {
              value: true,
            },
            icon: {
              value: "fa-solid fa-laptop",
            },
            linkPath: {
              value: "/webpersonalisation",
            },
            pathsActiveFor: {
              value: "webpersonalisation",
            },
          },
          displayOrder: 6,
        },
        listOfUsersClosedMenu: {
          name: "listOfUsersClosedMenu",
          key: "listOfUsersClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "List Of Users",
            },
            onlyIconMenu: {
              value: true,
            },
            linkPath: {
              value: "/list_of_users",
            },
            icon: {
              value: "fa-solid fa-users",
            },
            pathsActiveFor: {
              value: "list_of_users",
            },
          },
          displayOrder: 0,
        },
        userAnalyticsClosedMenu: {
          name: "userAnalyticsClosedMenu",
          key: "userAnalyticsClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "User Analytics",
            },
            onlyIconMenu: {
              value: true,
            },
            linkPath: {
              value: "/user_analytics",
            },
            icon: {
              value: "fa-solid fa-magnifying-glass-chart",
            },
            pathsActiveFor: {
              value: "user_analytics",
            },
          },
          displayOrder: 1,
        },
        uploadClosedMenu: {
          name: "uploadClosedMenu",
          key: "uploadClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Upload",
            },
            icon: {
              value: "fa-solid fa-upload",
            },
            onlyIconMenu: {
              value: true,
            },
            linkPath: {
              value: "/upload",
            },
            pathsActiveFor: {
              value: "upload",
            },
          },
          displayOrder: 3,
        },
        emailClosedMenu: {
          name: "emailClosedMenu",
          key: "emailClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Email",
            },
            icon: {
              value: "fa-solid fa-envelope",
            },
            onlyIconMenu: {
              value: true,
            },
            linkPath: {
              value: "/email",
            },
            pathsActiveFor: {
              value: "email",
            },
          },
          displayOrder: 0,
        },
        whatsappClosedMenu: {
          name: "whatsappClosedMenu",
          key: "whatsappClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Whatsapp",
            },
            icon: {
              value: "fa-brands fa-whatsapp",
            },
            onlyIconMenu: {
              value: true,
            },
            linkPath: {
              value: "/whatsapp",
            },
            pathsActiveFor: {
              value: "whatsapp",
            },
          },
          displayOrder: 1,
        },
        smsClosedMenu: {
          name: "smsClosedMenu",
          key: "smsClosedMenu",
          type: "Menu",
          properties: {
            label: {
              value: "SMS",
            },
            icon: {
              value: "fa-solid fa-message",
            },
            onlyIconMenu: {
              value: true,
            },
            linkPath: {
              value: "/sms",
            },
            pathsActiveFor: {
              value: "sms",
            },
          },
          displayOrder: 2,
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
              value: "/dashboard",
            },
            pathsActiveFor: {
              value: "/,dashboard",
            },
          },
          displayOrder: 0,
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
              value: "user_analytics,user,list_of_users",
            },
          },
          children: {
            listOfUsersMenu: true,
            userAnalyticsMenu: true,
          },
          displayOrder: 1,
        },
        campaignsMenu: {
          name: "campaignsMenu",
          key: "campaignsMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Campaigns",
            },
            icon: {
              value: "fa-solid fa-bullhorn",
            },
            linkPath: {
              value: "/campaigns",
            },
            pathsActiveFor: {
              value: "campaigns",
            },
          },
          displayOrder: 2,
        },
        workflowsMenu: {
          name: "workflowsMenu",
          key: "workflowsMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Workflows",
            },
            icon: {
              value: "fa-solid fa-sitemap",
            },
            linkPath: {
              value: "/workflows",
            },
            pathsActiveFor: {
              value: "workflows",
            },
          },
          displayOrder: 3,
        },
        userSegmentMenu: {
          name: "userSegmentMenu",
          key: "userSegmentMenu",
          type: "Menu",
          properties: {
            label: {
              value: "User Segment",
            },
            icon: {
              value: "fa-solid fa-users-viewfinder",
            },
            linkPath: {
              value: "/usersegments",
            },
            pathsActiveFor: {
              value: "usersegments",
            },
          },
          displayOrder: 4,
        },
        channelMenu: {
          name: "channelMenu",
          key: "channelMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Channels",
            },
            icon: {
              value: "fa-brands fa-facebook-f",
            },
            pathsActiveFor: {
              value: "upload,channels,sms,whatsapp,email",
            },
          },
          children: {
            uploadMenu: true,
            smsMenu: true,
            whatsappMenu: true,
            emailMenu: true,
          },
          displayOrder: 5,
        },
        webPersonalisationMenu: {
          name: "webPersonalisationMenu",
          key: "webPersonalisationMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Web Personalisation",
            },
            icon: {
              value: "fa-solid fa-laptop",
            },
            linkPath: {
              value: "/webpersonalisation",
            },
            pathsActiveFor: {
              value: "webpersonalisation",
            },
          },
          displayOrder: 6,
        },
        listOfUsersMenu: {
          name: "listOfUsersMenu",
          key: "listOfUsersMenu",
          type: "Menu",
          properties: {
            label: {
              value: "List Of Users",
            },
            linkPath: {
              value: "/list_of_users",
            },
            icon: {
              value: "fa-solid fa-users",
            },
            pathsActiveFor: {
              value: "list_of_users",
            },
          },
          displayOrder: 0,
        },
        userAnalyticsMenu: {
          name: "userAnalyticsMenu",
          key: "userAnalyticsMenu",
          type: "Menu",
          properties: {
            label: {
              value: "User Analytics",
            },
            linkPath: {
              value: "/user_analytics",
            },
            icon: {
              value: "fa-solid fa-magnifying-glass-chart",
            },
            pathsActiveFor: {
              value: "user_analytics",
            },
          },
          displayOrder: 1,
        },
        uploadMenu: {
          name: "uploadMenu",
          key: "uploadMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Upload",
            },
            icon: {
              value: "fa-solid fa-upload",
            },
            linkPath: {
              value: "/upload",
            },
            pathsActiveFor: {
              value: "upload",
            },
          },
          displayOrder: 3,
        },
        emailMenu: {
          name: "emailMenu",
          key: "emailMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Email",
            },
            icon: {
              value: "fa-solid fa-envelope",
            },
            linkPath: {
              value: "/email",
            },
            pathsActiveFor: {
              value: "email",
            },
          },
          displayOrder: 0,
        },
        whatsappMenu: {
          name: "whatsappMenu",
          key: "whatsappMenu",
          type: "Menu",
          properties: {
            label: {
              value: "Whatsapp",
            },
            icon: {
              value: "fa-brands fa-whatsapp",
            },
            linkPath: {
              value: "/whatsapp",
            },
            pathsActiveFor: {
              value: "whatsapp",
            },
          },
          displayOrder: 1,
        },
        smsMenu: {
          name: "smsMenu",
          key: "smsMenu",
          type: "Menu",
          properties: {
            label: {
              value: "SMS",
            },
            icon: {
              value: "fa-solid fa-message",
            },
            linkPath: {
              value: "/sms",
            },
            pathsActiveFor: {
              value: "sms",
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
