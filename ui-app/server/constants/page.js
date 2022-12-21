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
    toggleModal: {
      name: "toggleModalDefinition",
      namespace: "UIApp",
      parameters: {},
      events: {
        output: {
          name: "output",
          parameters: {},
        },
      },
      steps: {
        // toggleModal: {
        //   statementName: "toggleModalData",
        //   namespace: "UIEngine",
        //   name: "SetStore",
        //   parameterMap: {
        //     path: {
        //       settoggleModalData: {
        //         key: "settoggleModalData",
        //         type: "VALUE",
        //         value: "Store.testModal",
        //       },
        //     },
        //     value: {
        //       settoggleModalDataValue: {
        //         key: "settoggleModalData",
        //         type: "EXPRESSION",
        //         expression: "Store.testModal ? false : true",
        //       },
        //     },
        //   },
        // },
        setRepeaterTestingData: {
          statementName: "setRepeaterTestingData",
          namespace: "UIEngine",
          name: "SetStore",
          parameterMap: {
            path: {
              setRepeaterTestingDataPath: {
                key: "setRepeaterTestingDataPath",
                type: "VALUE",
                value: "Store.RepeaterTesting",
              },
            },
            value: {
              setRepeaterTestingDataValue: {
                key: "setRepeaterTestingDataValue",
                type: "VALUE",
                value: [
                  {
                    name: "Raja",
                    level: [
                      { name: "Raja" },
                      { name: "Shagil" },
                      { name: "Tarun" },
                      { name: "Surendhar" },
                      { name: "Akhilesh" },
                      { name: "Vishwas" },
                    ],
                  },
                  {
                    name: "Shagil",
                    level: [
                      { name: "Raja" },
                      { name: "Shagil" },
                      { name: "Tarun" },
                      { name: "Surendhar" },
                      { name: "Akhilesh" },
                      { name: "Vishwas" },
                    ],
                  },
                  {
                    name: "Tarun",
                    level: [
                      { name: "Raja" },
                      { name: "Shagil" },
                      { name: "Tarun" },
                      { name: "Surendhar" },
                      { name: "Akhilesh" },
                      { name: "Vishwas" },
                    ],
                  },
                  {
                    name: "Surendhar",
                    level: [
                      { name: "Raja" },
                      { name: "Shagil" },
                      { name: "Tarun" },
                      { name: "Surendhar" },
                      { name: "Akhilesh" },
                      { name: "Vishwas" },
                    ],
                  },
                  {
                    name: "Akhilesh",
                    level: [
                      { name: "Raja" },
                      { name: "Shagil" },
                      { name: "Tarun" },
                      { name: "Surendhar" },
                      { name: "Akhilesh" },
                      { name: "Vishwas" },
                    ],
                  },
                  { name: "Vishwas" },
                ],
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
                  name: "togglemodal",
                  value: {
                    isExpression: true,
                    value: "Store.testModal",
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
        // textboxgrid: true,
        // loginlabel: true,
        primarybuttongrid: true,
        // outlinedbuttongrid: true,
        // textbuttongrid: true,
        // checkBoxGrid: true,
        // linkGrid: true,
        arrayRepeatercomp: true,
        // popupGrid: true,
      },
    },
    popupGrid: {
      name: "popupCompGrid",
      key: "popupCompGrid",
      type: "Grid",
      children: {
        popupcomp: true,
      },
    },
    popupcomp: {
      name: "popupcomp",
      key: "popupcomp",
      type: "Popup",
      properties: {},
      bindingPath: {
        type: "VALUE",
        value: "Store.testModal",
      },
      children: {
        primarybuttongrid: true,
      },
    },
    arrayRepeatercomp: {
      name: "arrayRepeatercomp",
      key: "arrayRepeatercomp",
      type: "ArrayRepeater",
      properties: {
        showAdd: {
          value: true,
        },
      },
      bindingPath: {
        type: "VALUE",
        value: "Store.RepeaterTesting",
      },
      children: {
        arrayRepeatercompgrid: true,
      },
    },
    arrayRepeatercompInsideRepeater: {
      name: "arrayRepeatercompInsideRepeater",
      key: "arrayRepeatercompInsideRepeater",
      type: "ArrayRepeater",
      properties: {},
      bindingPath: {
        type: "VALUE",
        value: ".level",
      },
      children: {
        textboxcompcomparrayInsideArray: true,
      },
    },
    arrayRepeatercompgrid: {
      name: "arrayRepeatercompgrid",
      key: "arrayRepeatercompgrid",
      type: "Grid",
      children: {
        textboxcompcomparray: true,
        arrayRepeatercompInsideRepeater: true,
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
      type: "Link",
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
      },
      displayOrder: -1,
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
      },
      displayOrder: -1,
    },

    textboxcompcomparray: {
      name: "textboxcompcomparray",
      key: "textboxcompcomparray",
      type: "TextBox",
      properties: {
        label: {
          location: {
            type: "VALUE",
            value: ".name",
          },
        },
        supportingText: {
          value: "Supporting Text",
        },
        isMandatory: {
          value: true,
        },
      },
      bindingPath: {
        type: "VALUE",
        value: "Store.texboxbindingpath",
      },
      displayOrder: -1,
    },
    textboxcompcomparrayInsideArray: {
      name: "textboxcompcomparrayInsideArray",
      key: "textboxcompcomparrayInsideArray",
      type: "TextBox",
      properties: {
        label: {
          location: {
            type: "VALUE",
            value: ".name",
          },
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
      },
      displayOrder: -1,
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
          value: "fa fa-magnifying-glass fa-fw",
        },
      },
      displayOrder: -1,
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
          value: "fa fa-magnifying-glass fa-fw",
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
      },
      displayOrder: -1,
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
      },
      displayOrder: -1,
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
      },
      displayOrder: 1,
    },
    loginButton: {
      name: "loginButton",
      key: "loginButton",
      type: "Button",

      properties: {
        label: {
          value: "First Login",
        },
        type: {
          value: "primary",
        },
        onClick: {
          value: "toggleModal",
        },
        leftIcon: {
          value: "fa fa-user fa-fw",
        },
      },
      styleProperties: {
        ALL: {
          backgroundColor: { value: "#631222" },
          margin: { value: "5px" },
          color: { value: "#226318" },
          "backgroundColor:hover": { value: "#444444" },
          iconColor: { value: "#994433" },
        },
      },
      displayOrder: 3,
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
          type: "VALUE",
          value: "Store.form1.toggle1",
        },
      },
      displayOrder: 3,
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
          type: "VALUE",
          value: "Store.form1.radio1",
        },
      },
      displayOrder: 3,
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
          type: "VALUE",
          value: "Store.form1.checkbox1",
        },
      },
      displayOrder: 3,
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
          type: "VALUE",
          value: "Store.form1.checkbox2",
        },
      },
      displayOrder: 3,
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
      },
      displayOrder: 3,
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
      },
      displayOrder: 3,
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
      },
      displayOrder: 3,
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
      },
      displayOrder: 3,
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
        leftIcon: {
          value: "fa fa-user fa-fw",
        },
      },
      displayOrder: 3,
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
        leftIcon: {
          value: "fa fa-user fa-fw",
        },
      },
      displayOrder: 3,
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
      },
      displayOrder: 3,
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
      },
      displayOrder: 3,
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
      },
      displayOrder: 3,
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
      },
      displayOrder: 3,
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
      },
      displayOrder: 3,
    },
  },
};
