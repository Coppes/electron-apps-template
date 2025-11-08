export default {
  packagerConfig: {
    asar: true,
    name: "electron-apps-template",
    icon: "./assets/icon",
    osxSign: {},
    osxNotarize: {},
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        certificateFile: process.env.CERTIFICATE_FILE,
        certificatePassword: process.env.CERTIFICATE_PASSWORD,
        signingCertificate: process.env.SIGNING_CERTIFICATE,
      },
    },
    {
      name: "@electron-forge/maker-zip",
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          maintainer: "Your Name",
          homepage: "https://example.com",
        },
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        background: "./assets/dmg-background.png",
        format: "ULFO",
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-webpack",
      config: {
        mainConfig: "./webpack.main.config.cjs",
        renderer: {
          config: "./webpack.renderer.config.cjs",
          entryPoints: [
            {
              html: "./src/renderer/index.html",
              js: "./src/renderer/index.js",
              name: "main_window",
              preload: {
                js: "./src/preload.js",
              },
            },
          ],
        },
      },
    },
  ],
};

