export const login = {
  name: "login",
  properties: {
    wrapShell: false,
    title: { name: { value: "Login" }, append: { value: false } },
  },
  rootComponent: "aad0cdc2-d32a-4e2e-b264-afa1f7ce3416",
  componentDefinition: {
    "aad0cdc2-d32a-4e2e-b264-afa1f7ce3416": {
      name: "LoginGrid",
      key: "aad0cdc2-d32a-4e2e-b264-afa1f7ce3416",
      type: "Grid",
      styleProperties: {
        "3e27d183-9796-4e7c-a262-c9816604ad15": {
          resolutions: {
            ALL: {
              flexDirection: {
                value: "row",
              },
            },
          },
        },
      },
      children: {
        "00b2d07a-1906-4762-94ed-8e9135156fd9": true,
        "3309988e-62c5-4f44-a762-9899d3172d4f": true,
      },
    },
    "00b2d07a-1906-4762-94ed-8e9135156fd9": {
      name: "leftGrid",
      key: "00b2d07a-1906-4762-94ed-8e9135156fd9",
      type: "Grid",
      styleProperties: {
        "66e08930-09f1-471e-ad35-08c047add6f1": {
          resolutions: {
            ALL: {
              width: {
                value: "50%",
              },
            },
          },
        },
      },
      children: {
        "79f2938f-c12a-4ff8-b594-898083fa2140": true,
        "347be985-082b-4390-91d3-be58062660c0": true,
      },
    },
    "79f2938f-c12a-4ff8-b594-898083fa2140": {
      name: "imageGrid",
      key: "79f2938f-c12a-4ff8-b594-898083fa2140",
      type: "Grid",
      children: {
        "438a94b0-f46c-49cb-9488-56d2f11b4603": true,
      },
    },
    "438a94b0-f46c-49cb-9488-56d2f11b4603": {
      name: "image",
      key: "438a94b0-f46c-49cb-9488-56d2f11b4603",
      type: "Image",
      styleProperties: {
        "9d1c2b63-d344-4769-8789-d64eaf644e2a": {
          resolutions: {
            ALL: {
              width: {
                value: "330PX",
              },
              height: {
                value: "79px",
              },
            },
          },
        },
      },
      properties: {
        src: {
          value:
            "https://apps-dev.fincity.ai/api/files/static/file/SYSTEM/markauto/fincityLogo.png",
        },
        alt: {
          value: "fincityLogo",
        },
      },
    },
    "347be985-082b-4390-91d3-be58062660c0": {
      name: "formGrid",
      key: "347be985-082b-4390-91d3-be58062660c0",
      type: "Grid",
      children: {
        "adcbd4ea-24c1-4f6e-b279-6a5c60345c18": true,
        "ec5c2954-3888-4932-8e12-eff9f7d22d98": true,
        "6dbe196f-3690-464f-b693-356cb537192e": true,
        "7488c52e-76b2-42ce-a236-bfbb175727ac": true,
        "4b199e32-dd80-4372-ae2e-8eacbcf6ee57": true,
      },
    },
    "adcbd4ea-24c1-4f6e-b279-6a5c60345c18": {
      name: "loginTextBox",
      key: "adcbd4ea-24c1-4f6e-b279-6a5c60345c18",
      type: "TextBox",
      bindingPath: {
        type: "VALUE",
        value: "Page.userName",
      },
      properties: {
        label: {
          value: "Email Address",
        },
      },
    },
    "ec5c2954-3888-4932-8e12-eff9f7d22d98": {
      name: "loginPassword",
      key: "ec5c2954-3888-4932-8e12-eff9f7d22d98",
      type: "TextBox",
      bindingPath: {
        type: "VALUE",
        value: "Page.password",
      },
      properties: {
        label: {
          value: "Password",
        },
      },
    },
    "6dbe196f-3690-464f-b693-356cb537192e": {
      name: "formLink",
      key: "6dbe196f-3690-464f-b693-356cb537192e",
      type: "Link",
      properties: {
        label: {
          value: "Forgot password",
        },
        linkpath: {
          value: "/forgotpassword",
        },
        target: {
          value: "self",
        },
      },
    },
    "7488c52e-76b2-42ce-a236-bfbb175727ac": {
      name: "rememberPasswordcheck",
      key: "7488c52e-76b2-42ce-a236-bfbb175727ac",
      type: "CheckBox",
      bindingPath: {
        type: "VALUE",
        value: "Page.rememberMe",
      },
      properties: {
        label: {
          value: "Remember password",
        },
      },
    },
    "4b199e32-dd80-4372-ae2e-8eacbcf6ee57": {
      name: "loginButton",
      key: "4b199e32-dd80-4372-ae2e-8eacbcf6ee57",
      type: "Button",
      properties: {
        type: {
          value: "default",
        },
        label: {
          value: "Log in",
        },
        onClick: {
          value: "",
        },
      },
    },
    "3309988e-62c5-4f44-a762-9899d3172d4f": {
      name: "rightGrid",
      key: "3309988e-62c5-4f44-a762-9899d3172d4f",
      type: "Grid",
      styleProperties: {
        "c6ac1177-caf4-40b0-b174-34e93869cf9c": {
          resolutions: {
            ALL: {
              width: {
                value: "50%",
              },
            },
          },
        },
      },
      children: {
        "4f6657b9-6797-46ea-9445-949bd6810ec7": true,
        "21538f4b-43f7-4102-b774-97d407f6a307": true,
      },
    },
    "4f6657b9-6797-46ea-9445-949bd6810ec7": {
      name: "labelGrid",
      key: "4f6657b9-6797-46ea-9445-949bd6810ec7",
      type: "Grid",
      children: {
        "f8c99eb4-e6e4-4623-9558-66ca2f978932": true,
      },
    },
    "f8c99eb4-e6e4-4623-9558-66ca2f978932": {
      name: "label",
      key: "f8c99eb4-e6e4-4623-9558-66ca2f978932",
      type: "Text",
      properties: {
        text: {
          value:
            "Attract and engage leads with tools like ads, landung page, email, forms and live chats.",
        },
      },
    },
    "21538f4b-43f7-4102-b774-97d407f6a307": {
      name: "rightImageGrid",
      key: "21538f4b-43f7-4102-b774-97d407f6a307",
      type: "Grid",
      children: {
        "50e2385d-def6-41d3-ad6c-720c77e8e46d": true,
      },
    },
    "50e2385d-def6-41d3-ad6c-720c77e8e46d": {
      name: "bigImage",
      key: "50e2385d-def6-41d3-ad6c-720c77e8e46d",
      type: "Image",
      properties: {
        src: {
          value:
            "https://apps-dev.fincity.ai/api/files/static/file/SYSTEM/markauto/loginIllustration.svg",
        },
        alt: {
          value: "fincity-illustration",
        },
      },
    },
  },
};
