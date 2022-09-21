export const page = {
  name: "loginpage",
  key: "loginpage",
  type: "Page",
  rootComponent: "loginGrid",
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
        loginlabel: true,
        loginButton: true,
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
        displayOrder: 3,
      },
    },
  },
};
