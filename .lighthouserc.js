const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  ci: {
    collect: {
      startServerCommand: "yarn start",
      startServerReadyPattern: "started server on",
      url: [
        "http://localhost:3300/",
        "http://localhost:3300/resume",
        "http://localhost:3300/about",
        "http://localhost:3300/posts/apollo-cache-overview",
        "http://localhost:3300/posts/summertime-adventure-new-orleans",
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
