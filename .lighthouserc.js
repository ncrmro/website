const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  ci: {
    collect: {
      startServerCommand: "yarn start",
      startServerReadyPattern: "started server on",
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/resume",
        "http://localhost:3000/about",
        "http://localhost:3000/posts/apollo-cache-overview",
      ],
      settings: {
        chromeFlags: "--disable-gpu --no-sandbox --disable-dev-shm-usage",
      },
    },
    assert: {
      preset: "lighthouse:recommended",
    },
    upload: {
      // token and server url are set from environment variables and .env file
      target: "lhci",
    },
  },
};
