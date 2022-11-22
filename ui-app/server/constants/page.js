export const page = {
  name: "loginpage",
  key: "loginpage",
  type: "Page",
  rootComponent: "loginGrid",
  eventFunctions: {
    login: {
      name: "userAuthenticateDefinition",
      namespace: "UIApp",
      parameters: {},
      events: {
        output: {
          name: "output",
          parameters: {
            userData: {
              name: "userData",
              type: "Object",
            },
          },
        },
      },
      steps: {
        authenticate: {
          statementName: "authenticate",
          namespace: "UIEngine",
          name: "SendData",
          parameterMap: {
            url: {
              authenticateUrl: {
                key: "authenticateUrl",
                type: "VALUE",
                value: "/api/security/authenticate",
              },
            },
            method: {
              authenticateAPIMethod: {
                key: "authenticateAPIMethod",
                type: "VALUE",
                value: "POST",
              },
            },
            queryParams: {
              authenticatePayload: {
                key: "authenticatePayload",
                type: "VALUE",
                value: {
                  param1: {
                    value: "value1",
                  },
                  param2: {
                    value: "value2",
                  },
                },
              },
            },
            payload: {
              authenticatePayload: {
                key: "authenticatePayload",
                type: "VALUE",
                value: {
                  value: {
                    userName: "sysadmin",
                    password: "fincity@123",
                  },
                },
              },
            },
          },
        },
        setAuthenticateLoginData: {
          statementName: "setAuthenticateLoginData",
          namespace: "UIEngine",
          name: "SetStore",
          parameterMap: {
            path: {
              setLoginDataPath: {
                key: "setLoginDataPath",
                type: "VALUE",
                value: "Store.auth",
              },
            },
            value: {
              setLoginDataValue: {
                key: "setLoginDataValue",
                type: "EXPRESSION",
                expression: "Steps.authenticate.output.data",
              },
            },
          },
          dependentStatements: { "Steps.authenticate.output": true },
        },
        setTokenInLocalStore: {
          statementName: "setTokenInLocalStore",
          namespace: "UIEngine",
          name: "SetStore",
          parameterMap: {
            path: {
              setLoginDataPath: {
                key: "setLoginDataPath",
                type: "VALUE",
                value: "LocalStore.AuthToken",
              },
            },
            value: {
              setLoginDataValue: {
                key: "setLoginDataValue",
                type: "EXPRESSION",
                expression: "Steps.authenticate.output.data.accessToken",
              },
            },
          },
          dependentStatements: { "Steps.authenticate.output": true },
        },
        setLoginFailureData: {
          statementName: "setLoginFailureData",
          namespace: "UIEngine",
          name: "SetStore",
          parameterMap: {
            path: {
              setLoginFailureDataPath: {
                key: "setLoginFailureDataPath",
                type: "VALUE",
                value: "Store.isAuthenticated",
              },
            },
            value: {
              setLoginFailureDataValue: {
                key: "setLoginFailureDataValue",
                type: "EXPRESSION",
                expression: "null != Steps.authenticate.output.data",
              },
            },
          },
          dependentStatements: { "Steps.authenticate.output": true },
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
                  name: "userData",
                  value: {
                    isExpression: true,
                    value: "Steps.authenticate.output.data",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  children: {
    loginGrid: {
      name: "loginGrid",
      key: "loginGrid",
      type: "Grid",
      children: {
        secondGrid: true,
      },
    },
    secondGrid: {
      name: "secondGrid",
      key: "secondGrid",
      type: "Grid",
      children: {
        textboxgrid: true,
        loginlabel: true,
        primarybuttongrid: true,
        outlinedbuttongrid: true,
        textbuttongrid: true,
        checkBoxGrid: true,
        linkGrid: true,
        imageGrid: true,
        tabsGrid: true,
      },
    },

    tabsGrid: {
      name: "tabsgrid",
      key: "tabsGrid",
      type: "Grid",
      children: {
        tabscomp: true,
      },
    },
    tabscomp: {
      name: "tabscomp",
      key: "tabscomp",
      type: "TabsComponent",
      properties: {
        tabs: {
          value: [
            { tabName: "Description", childKey: "tabsgrid1", displayOrder: 1 },
            {
              tabName: "Specification",
              childKey: "tabsgrid2",
              displayOrder: 2,
            },
            { tabName: "Features", childKey: "tabsgrid3", displayOrder: 3 },
          ],
        },
        defaultActive: {
          value: "tabsgrid3",
        },

        bindingPath: {
          type: "VALUE",
          value: "Store.tabsBindingPath",
        },
      },
      children: {
        tabsgrid1: true,
        tabsgrid2: true,
        tabsgrid3: true,
      },
    },
    tabsgrid1: {
      name: "tabsGrid1",
      key: 1,
      type: "Grid",
      children: {
        firstTabData: true,
      },
    },
    firstTabData: {
      name: "tabdata",
      key: "tabdata",
      type: "Label",
      properties: {
        text: {
          value: "Description grid value",
        },
      },
    },
    tabsgrid2: {
      name: "tabsGrid2",
      key: 2,
      type: "Grid",
      children: {
        secondTabdata: true,
      },
    },
    secondTabdata: {
      name: "tabdata",
      key: "tabdata",
      type: "Label",
      properties: {
        text: {
          value: "specification grid value",
        },
      },
    },
    tabsgrid3: {
      name: "tabsGrid3",
      key: 3,
      type: "Grid",
      children: {
        thirdTabData: true,
      },
    },
    thirdTabData: {
      name: "tabdata",
      key: "tabdata",
      type: "Label",
      properties: {
        text: {
          value: "features grid value",
        },
      },
    },

    imageGrid: {
      name: "imagegrid",
      key: "imagegrid",
      type: "Grid",
      children: {
        imagecomp: true,
        imageCompSec: true,
      },
    },
    imagecomp: {
      name: "imgcomp",
      key: "imgcomp",
      type: "ImageComponent",
      properties: {
        width: {
          value: "500px",
        },
        height: {
          value: "500px",
        },
        src: {
          value:
            "https://cdn.pixabay.com/photo/2018/10/19/05/12/naruto-3757871_1280.jpg",
        },
        alt: {
          value: "naruto",
        },
      },
    },
    imageCompSec: {
      name: "imgCompSec",
      key: "imgCompSec",
      type: "ImageComponent",
      properties: {
        width: {
          value: "200px",
        },
        height: {
          value: "200px",
        },
        src: {
          value:
            "https://akibamarket.com/wp-content/uploads/2022/10/116718-spy-x-family-hombres-se-vistieron-de-anya-forger-y-limpiaron-calles.jpg",
        },
        alt: {
          value: "anya",
        },
      },
    },

    linkGrid: {
      name: "linkgrid",
      key: "linkgrid",
      type: "Grid",
      children: {
        linkcomp: true,
      },
    },
    linkcomp: {
      name: "linkcomp",
      key: "linkcomp",
      type: "LinkComponent",
      properties: {
        label: {
          value: "google",
        },
        linkPath: {
          value: "page/pagename2",
        },
        target: {
          value: "_self",
        },
        externalButtonTarget: {
          value: "_blank",
        },
        showButton: {
          value: true,
        },

        displayOrder: -1,
      },
    },
    textboxgrid: {
      name: "textboxgrid",
      key: "textboxgrid",
      type: "Grid",
      children: {
        textboxcompcomp: true,
        textboxcompcompWithICon: true,
        textboxcompcompdisabled: true,
        textboxcompcompWithIConDisabled: true,
      },
    },
    textboxcompcomp: {
      name: "textboxcompcomp",
      key: "textboxcompcomp",
      type: "TextBox",
      properties: {
        label: {
          value: "Login",
        },
        bindingPath: {
          value: "Store.texboxbindingpath",
        },
        supportingText: {
          value: "Supporting Text",
        },
        isMandatory: {
          value: true,
        },
        displayOrder: -1,
      },
    },
    textboxcompcompWithICon: {
      name: "textboxcompcompWithICon",
      key: "textboxcompcompWithICon",
      type: "TextBox",
      properties: {
        label: {
          value: "Something else",
        },
        bindingPath: {
          value: "Store.texboxbindingpath1",
        },
        leftIcon: {
          icon: {
            value: "fa-magnifying-glass",
          },
          iconStyle: "SOLID",
        },
        displayOrder: -1,
      },
    },
    textboxcompcompWithIConDisabled: {
      name: "textboxcompcompWithIConDisabled",
      key: "textboxcompcompWithIConDisabled",
      type: "TextBox",
      properties: {
        label: {
          value: "Something else",
        },
        bindingPath: {
          value: "Store.texboxbindingpath1",
        },
        leftIcon: {
          icon: {
            value: "fa-magnifying-glass",
          },
          iconStyle: "SOLID",
        },
        isDisabled: {
          value: true,
        },
        defaultValue: {
          value: "Text is here",
        },
        supportingText: {
          value: "Supporting Text",
        },
        displayOrder: -1,
      },
    },
    textboxcompcompdisabled: {
      name: "textboxcompcompdisabled",
      key: "textboxcompcompdisabled",
      type: "TextBox",
      properties: {
        label: {
          value: "Login",
        },
        bindingPath: {
          value: "Store.texboxbindingpath",
        },
        isDisabled: {
          value: true,
        },
        displayOrder: -1,
      },
    },
    primarybuttongrid: {
      name: "primarybuttongrid",
      key: "primarybuttongrid",
      type: "Grid",
      children: {
        loginButton: true,
        loginButtonDisabled: true,
        fabTestButton: true,
        fabTestMiniButton: true,
      },
    },
    outlinedbuttongrid: {
      name: "outlinedbuttongrid",
      key: "outlinedbuttongrid",
      type: "Grid",
      children: {
        outlinedButton: true,
        outlinedButtondisabled: true,
      },
    },
    textbuttongrid: {
      name: "textbuttongrid",
      key: "textbuttongrid",
      type: "Grid",
      children: {
        textButton: true,
        textButtonDisabled: true,
      },
    },
    checkBoxGrid: {
      name: "checkBoxGrid",
      key: "checkBoxGrid",
      type: "Grid",
      children: {
        checkboxone: true,
        checkboxtwo: true,
        radiobuttonOne: true,
        toggleButtonOne: true,
      },
    },
    loginlabel: {
      name: "loginlabel",
      key: "loginlabel",
      type: "Label",
      properties: {
        text: {
          value: "Login",
        },
        displayOrder: 1,
      },
    },
    loginButton: {
      name: "loginButton",
      key: "loginButton",
      type: "Button",
      properties: {
        label: {
          value: "Login",
        },
        type: {
          value: "primary",
        },
        onClick: {
          value: "login",
        },
        leftIcon: {
          icon: {
            value: "fa-user",
          },
          iconStyle: "SOLID",
        },
        displayOrder: 3,
      },
    },
    toggleButtonOne: {
      name: "toggleButtonOne",
      key: "toggleButtonOne",
      type: "ToggleButton",
      properties: {
        label: {
          value: "Toggle Button",
        },
        isDisabled: {
          value: false,
        },
        bindingPath: {
          location: {
            type: "VALUE",
            value: "Store.form1.toggle1",
          },
        },
        displayOrder: 3,
      },
    },
    radiobuttonOne: {
      name: "radiobuttonOne",
      key: "radiobuttonOne",
      type: "RadioButton",
      properties: {
        label: {
          value: "Radio",
        },
        isDisabled: {
          value: false,
        },
        bindingPath: {
          location: {
            type: "VALUE",
            value: "Store.form1.radio1",
          },
        },
        displayOrder: 3,
      },
    },
    checkboxone: {
      name: "checkboxone",
      key: "checkboxone",
      type: "CheckBox",
      properties: {
        label: {
          value: "Login",
        },
        onClick: {
          value: "login",
        },
        isDisabled: {
          value: false,
        },
        bindingPath: {
          location: {
            type: "VALUE",
            value: "Store.form1.checkbox1",
          },
        },
        displayOrder: 3,
      },
    },
    checkboxtwo: {
      name: "checkboxtwo",
      key: "checkboxtwo",
      type: "CheckBox",
      properties: {
        label: {
          value: "Disabled Login",
        },
        onClick: {
          value: "login",
        },
        isDisabled: {
          value: true,
        },
        bindingPath: {
          location: {
            type: "VALUE",
            value: "Store.form1.checkbox2",
          },
        },
        displayOrder: 3,
      },
    },
    checkboxoneone: {
      name: "checkboxoneone",
      key: "checkboxoneone",
      type: "CheckBox",
      properties: {
        label: {
          value: "1.1 Check",
        },
        onClick: {
          value: "login",
        },
        isDisabled: {
          value: false,
        },
        displayOrder: 3,
      },
    },

    checkboxonetwo: {
      name: "checkboxonetwo",
      key: "checkboxonetwo",
      type: "CheckBox",
      properties: {
        label: {
          value: "1.2 Check",
        },
        onClick: {
          value: "login",
        },
        isDisabled: {
          value: false,
        },
        displayOrder: 3,
      },
    },
    checkboxonethree: {
      name: "checkboxonethree",
      key: "checkboxonethree",
      type: "CheckBox",
      children: {
        checkboxonethreeone: true,
      },
      properties: {
        label: {
          value: "1.3 Check",
        },
        onClick: {
          value: "login",
        },
        isDisabled: {
          value: false,
        },
        displayOrder: 3,
      },
    },
    checkboxonethreeone: {
      name: "checkboxonethreeone",
      key: "checkboxonethreeone",
      type: "CheckBox",

      properties: {
        label: {
          value: "1.3.1 Check",
        },
        onClick: {
          value: "login",
        },
        isDisabled: {
          value: false,
        },
        displayOrder: 3,
      },
    },
    fabTestButton: {
      name: "fabTestButton",
      key: "fabTestButton",
      type: "Button",
      properties: {
        type: {
          value: "fabButton",
        },
        onClick: {
          value: "login",
        },
        fabIcon: {
          icon: {
            value: "fa-user",
          },
          iconStyle: "SOLID",
        },
        displayOrder: 3,
      },
    },
    fabTestMiniButton: {
      name: "fabTestMiniButton",
      key: "fabTestMiniButton",
      type: "Button",
      properties: {
        type: {
          value: "fabButtonMini",
        },
        onClick: {
          value: "login",
        },
        fabIcon: {
          icon: {
            value: "fa-user",
          },
          iconStyle: "SOLID",
        },
        displayOrder: 3,
      },
    },
    outlinedButton: {
      name: "outlinedButton",
      key: "outlinedButton",
      type: "Button",
      properties: {
        label: {
          value: "Oultined",
        },
        type: {
          value: "outlined",
        },
        displayOrder: 3,
      },
    },
    textButton: {
      name: "textButton",
      key: "textButton",
      type: "Button",
      properties: {
        label: {
          value: "Text Button",
        },
        type: {
          value: "text",
        },
        displayOrder: 3,
      },
    },
    loginButtonDisabled: {
      name: "loginButtonDisabled",
      key: "loginButtonDisabled",
      type: "Button",
      properties: {
        label: {
          value: "Login",
        },
        isDisabled: {
          value: true,
        },
        type: {
          value: "primary",
        },
        onClick: {
          value: "login",
        },
        displayOrder: 3,
      },
    },
    outlinedButtondisabled: {
      name: "outlinedButtondisabled",
      key: "outlinedButtondisabled",
      type: "Button",
      properties: {
        label: {
          value: "Oultined",
        },
        isDisabled: {
          value: true,
        },
        type: {
          value: "outlined",
        },
        displayOrder: 3,
      },
    },
    textButtonDisabled: {
      name: "textButtonDisabled",
      key: "textButtonDisabled",
      type: "Button",
      properties: {
        label: {
          value: "Text Button",
        },
        isDisabled: {
          value: true,
        },
        type: {
          value: "text",
        },
        displayOrder: 3,
      },
    },
  },
};
