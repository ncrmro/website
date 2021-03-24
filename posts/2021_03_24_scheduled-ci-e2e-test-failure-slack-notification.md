---
slug: scheduled-ci-e2e-test-failure-slack-notifier
title: Building a scheduled CI E2E test failure Slack notifier
date: "2021-03-24"
description: How to build your own Slack notifier when scheduled E2E tests fail.
tags: ["E2E", "testing", "CI"]
---

## Background

At one of my jobs we needed to build out an E2E test suite. We settled on
Microsoft's [Playwright](https://playwright.dev/) along with
[playwright-test](https://github.com/microsoft/playwright-test) and
[folio](https://github.com/microsoft/folio) as the test runner.

These E2E tests serve to insure that our [React](https://reactjs.org/) and
[Next.JS](https://nextjs.org/) front end worked as expected with the
corresponding GraphQL and Rest endpoints across our various environments.

Our end goal being a [Slack](https://slack.com/) channel titled
`scheduled-testing` that gets messages we send from a
[Slack API Webhook](https://api.slack.com/messaging/webhooks) that look like the
following (Testing against is the url of the environment we are testing against,
redacted for work).

![A Slack message showing which E2E tests failed, what CI job they failed on, the total time and the error count.](/images/post/2021_03_24_scheduled-ci-e2e-test-failure-slack-notification/slack-notification-for-failed-e2e-tests.jpg)

## Building it

I wanted to build it using the minimal amount of dependencies. playwright-test
gives us the option to export a junit report of what tests fail.

The entire `package.json` might look like the following

```json
{
  "name": "e2e",
  "version": "1.0.0",
  "main": "index.js",
  "private": true,
  "scripts": {
    "test": "npx folio --timeout=120000 --param browserName=firefox --param screenshotOnFailure",
    "test:h": "yarn test --param video --param headful",
    "test:v": "yarn test --param video"
  },
  "dependencies": {
    "@playwright/test": "^0.192.0",
    "dotenv": "^8.2.0",
    "playwright": "^1.9.2",
    "playwright-core": "^1.9.2",
    "typescript": "^4.1.3",
    "xml2js": "^0.4.23"
  }
}
```

The nice thing here is we already utilize the junit report (supported out of the
box with playwright-test) to pass to [Gitlab](https://gitlab.com/) CI to get
reporting of specific test failures inside our merge requests.

In CI we tag on the junit reporter like so.

```bash
yarn run test --reporter=junit,line
```

We would then call the notification script like so

```bash
node notification.js
```

The contents of `notification.js`

```javascript
const https = require("https"),
  fs = require("fs"),
  xml2js = require("xml2js"),
  parser = new xml2js.Parser();

async function msgBuilder() {
  const contents = fs.readFileSync(__dirname + "/junit.xml", "utf8");
  const {
    testsuites: {
      $: { name, tests, failures, errors, time },
      testsuite,
    },
  } = await parser.parseStringPromise(contents);
  const failedSuites = testsuite.filter(({ $: { failures } }) => failures > 0);
  if (failedSuites.length === 0) {
    return;
  }
  let msg = `
Total Time: ${time}s
Tests / Failures / Errors: ${tests}, ${failures}, ${errors}
Testing against: ${process.env.FRONTEND_URL}
Gitlab Job: <${process.env.CI_JOB_URL}|${process.env.CI_JOB_ID}>
> Failures:`;
  failedSuites.forEach(({ $: { name }, testcase }) => {
    const failures = testcase.filter((tc) => tc.failure);
    if (failures) {
      failures.map(
        ({ $: { name } }) =>
          (msg = `${msg}
>     ${name}`)
      );
    }
  });
  return msg;
}

async function notifier() {
  const msg = await msgBuilder();
  if (msg) {
    const data = JSON.stringify({
      text: msg,
    });
    const options = {
      host: "hooks.slack.com",
      path: "/services/THIS/IS/FAKE",
      port: 443,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });

    req.on("error", (error) => {
      console.error(error);
    });

    req.write(data);
    req.end();
  }
}

notifier();
```
