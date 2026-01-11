// app.config.ts
import { defineConfig } from "@tanstack/start/config";
var app_config_default = defineConfig({
  server: {
    port: 3080,
    preset: "node-server"
  },
  vite: {
    resolve: {
      alias: {
        "~": new URL("./src", import.meta.url).pathname
      }
    }
  }
});
export {
  app_config_default as default
};
