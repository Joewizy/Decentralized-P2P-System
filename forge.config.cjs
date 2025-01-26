const path = require("path");

module.exports = {
    packagerConfig: {},
    makers: [
      {
        name: '@electron-forge/maker-squirrel', // This creates a Windows installer
        config: {
          name: 'e4', // The name of your app
        },
      },
      // {
      //   name: '@electron-forge/maker-zip', // Optional: for a simple ZIP package
      //   platforms: ['win32'],
      // },
    ],
  };
  