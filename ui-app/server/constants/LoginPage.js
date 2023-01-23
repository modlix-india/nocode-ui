export const campaigns = {
  name: "Login",
  key: "Login",
  type: "page",
  rootComponent: "LoginGrid",
  componentDefinition: {
    LoginGrid: {
      name: "LoginGrid",
      key: "LoginGrid",
      type: "Grid",
      children: {
        leftGrid: true,
        rightGrid: true,
      },
    },
    leftGrid: {
      name: "leftGrid",
      key: "leftGrid",
      type: "Grid",
      children: {
        imageGrid: true,
        formGrid: true,
      },
    },
    imageGrid: {
      name: "imageGrid",
      key: "imageGrid",
      type: "Grid",
      children: {
        image: true,
      },
    },
    image: {
      name: "image",
      key: "image",
      type: image,
      properties: {
        src: {
          value: "",
        },
        fallBack: {
          value: "",
        },
        alt: {
          value: "fincity",
        },
        onClick: {
          value: "",
        },
      },
    },
    formGrid: {
      name: "formGrid",
      key: "formGrid",
      type: "Grid",
      children: {
        loginTextBox: true,
        loginPassword: true,
        link: true,
        checkbox: true,
        loginButton: true,
      },
    },
  },
  loginTextBox: {
    name: "loginTextBox",
    key: "loginTextBox",
    type: "Textbox",
    styleProperties: {
      "064289e4-9353-4315-b3e7-b37e0f45971b": {
        resolutions: {
          ALL: {
            width: { value: "80px" },
            height: { value: "10px" },
          },
        },
      },
    },
    properties: {
      lable: {
        value: "Login",
      },
    },
  },
  loginPassword: {
    name: "loginPassword",
    key: "loginPassword",
    type: "Textbox",
    styleProperties: {
      "6101d334-2fc4-45d1-8aab-a368c1f78967": {
        resolutions: {
          height: { value: "10px" },
          width: { value: "80px" },
          overflow: { value: "auto" },
        },
        properties: {
          lable: {
            value: "password",
          },
        },
      },
    },
  },
  link: {
    name: "formLink",
    key: "formLink",
    type: "Link",
    properties: {
      lable: {
        value: "Forgot password",
      },
      linkpath: {
        value: "",
      },
      target: {
        value: "self",
      },
    },
  },
  checkbox: {
    name: "label",
    key: "label",
    type: "Checkbox",
    properties: {
      lable: {
        value: "Remember me",
      },
    },
  },
  loginButton: {
    name: "loginButton",
    key: "loginButton",
    type: "Button",
    styleProperties: {
      "6101d334-2fc4-45d1-8aab-a368c1f78967": {
        resolutions: {
          ALL: {
            height: { value: "20px" },
            width: { value: "180px" },
            overflow: { value: "auto" },
          },
        },
      },
    },
    properties: {
      type: {
        value: "default",
      },
      onClick: {
        value: "",
      },
    },
  },

  rightGrid: {
    name: "rightGrid",
    key: "rightGrid",
    type: "Grid",
    children: {
      lableGrid: true,
      rightImageGrid: true,
    },
  },
  lableGrid: {
    name: "lableGrid",
    key: "lableGrid",
    type: "Grid",
    children: {
      lable: true,
    },
  },
  lable: {
    name: "lable",
    key: "lable",
    type: "lable",
    properties: {
      text: {
        value: "Fincity Lable",
      },
    },
  },
  rightImageGrid: {
    name: "rightImageGrid",
    key: "rightImageGrid",
    type: "Grid",
    children: {
      bigImage: true,
    },
  },
  bigImage: {
    name: "bigImage",
    key: "bigImage",
    type: "Image",
    properties: {
      src: {
        value: "",
      },
      fallBack: {
        value: "",
      },
      alt: {
        value: "fincity",
      },
      onClick: {
        value: "",
      },
    },
  },
};
