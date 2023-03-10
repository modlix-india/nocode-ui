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
              height: {
                value: "100vh",
              },
              overflow: {
                value: "hidden",
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
              justifyContent: {
                value: "center",
              },
              alignItems: {
                value: "center",
              },
            },
          },
        },
      },
      children: {
        "5fb6788f-76c2-48d1-a141-e89bf0443e2c": true,
      },
    },
    "5fb6788f-76c2-48d1-a141-e89bf0443e2c": {
      name: "ImageAndFormGrid",
      key: "5fb6788f-76c2-48d1-a141-e89bf0443e2c",
      type: "Grid",
      styleProperties: {
        "ef2546b6-1ea6-4cac-8e3d-1c998434afe0": {
          resolutions: {
            ALL: {
              gap: {
                value: "20px",
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
      styleProperties: {
        "66e08930-09f1-471e-ad35-08c047add6f1": {
          resolutions: {
            ALL: {
              //   marginBottom: {
              //     value: "",
              //   },
            },
          },
        },
      },
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
      styleProperties: {
        "8589b986-806f-427d-907c-1de58d66e526": {
          resolutions: {
            ALL: {
              gap: {
                value: "20px",
              },
              //   height: {
              //     value: "79px",
              //   },
            },
          },
        },
      },
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
      styleProperties: {
        "3b7a4e5e-970c-476a-958c-5f70452c4f7f": {
          resolutions: {
            ALL: {
              //   marginBottom: {
              //     value: "70px",
              //   },
            },
          },
        },
      },
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
      styleProperties: {
        "de57ae03-2783-453d-a372-df5281815c36": {
          resolutions: {
            ALL: {
              //   marginBottom: {
              //     value: "40px",
              //   },
            },
          },
        },
      },
      bindingPath: {
        type: "VALUE",
        value: "Page.password",
      },
      properties: {
        label: {
          value: "Password",
        },
        isPassword: {
          value: true,
        },
      },
    },
    "6dbe196f-3690-464f-b693-356cb537192e": {
      name: "formLink",
      key: "6dbe196f-3690-464f-b693-356cb537192e",
      type: "Link",
      styleProperties: {
        "a2473554-8673-4402-a09c-ca8bdfb66e77": {
          resolutions: {
            ALL: {
              //   marginBottom: {
              //     value: "22px",
              //   },
            },
          },
        },
      },
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
      styleProperties: {
        "e240655e-1a5d-4508-a6b3-5380527b1aac": {
          resolutions: {
            ALL: {},
          },
        },
      },
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
      styleProperties: {
        "d31fac23-c17a-4a12-a14d-38683c62c9bc": {
          resolutions: {
            ALL: {
              width: {
                value: "100%",
              },
            },
          },
        },
      },
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
              alignItems: {
                value: "center",
              },
              justifyContent: {
                value: "center",
              },
              backgroundColor: {
                value: "#EDE4DE",
              },
            },
          },
        },
      },
      children: {
        "244b0198-2e2a-478b-8f25-f0690a2cf6a6": true,
      },
    },
    "244b0198-2e2a-478b-8f25-f0690a2cf6a6": {
      name: "rightInnerGrid",
      key: "244b0198-2e2a-478b-8f25-f0690a2cf6a6",
      type: "Grid",
      styleProperties: {
        "663f6a7a-feb6-42c7-9bf2-46dcef6af4de": {
          resolutions: {
            ALL: {
              width: {
                value: "500px",
              },
              gap: {
                value: "190px",
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
      styleProperties: {
        "5d916a3d-11a2-47c6-bbfd-80e5a5d10cd2": {
          resolutions: {
            ALL: {
              color: {
                value: "#545454",
              },
              fontSize: {
                value: "24px",
              },
              width: {
                value: "82%",
              },
            },
          },
        },
      },
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
      styleProperties: {
        "5d916a3d-11a2-47c6-bbfd-80e5a5d10cd2": {
          resolutions: {
            ALL: {},
          },
        },
      },
      children: {
        "50e2385d-def6-41d3-ad6c-720c77e8e46d": true,
      },
    },
    "50e2385d-def6-41d3-ad6c-720c77e8e46d": {
      name: "bigImage",
      key: "50e2385d-def6-41d3-ad6c-720c77e8e46d",
      type: "Image",
      properties: {
        width: {
          value: "500px",
        },
        height: {
          value: "398px",
        },
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
