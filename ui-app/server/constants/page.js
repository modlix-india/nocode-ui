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
        rangeSliderGrid: true,
      },
    },
    rangeSliderGrid: {
      name: "rangeSlidergrid",
      key: "rangeSlidergrid",
      type: "Grid",
      children: {
        rangeSliderComp: true,
      },
    },
    rangeSliderComp: {
      name: "rangeSliderComp",
      key: "rangeSliderComp",
      type: "RangeSliderComponent",
      properties: {
        initialValue: {
          value: 20,
        },
        max: {
          value: 100,
        },
        step: {
          value: 20,
        },
        min: {
          value: 0,
        },
        bindingPath: {
          value: "Store.rangeslide",
        },
        displayOrder: -1,
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
        mandatory: {
          value: "enter login details",
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
