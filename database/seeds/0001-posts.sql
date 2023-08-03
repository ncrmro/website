insert into main.posts (id, user_id, title, body, slug, published, publish_date, created_at, updated_at)
values  ('086356f9-8a70-4529-bcd2-25c9c8fea62c', 'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Evaluating Rust.', '

# [Rust](https://www.rust-lang.org)

This post documents my experience learning and working with Rust and why I
choose to add it to my daily driver [Python](https://www.python.org), javascript
etc.

## [Strong Typing](https://en.wikipedia.org/wiki/Strong_and_weak_typing)

Python is also not typed although things like Python type hints and Fast API use
these. In Rust, typing is strictly enforced. My first experience using types was
a bit of [c#](<https://en.wikipedia.org/wiki/C_Sharp_(programming_language)>)
although I didn''t get the hang of it until using
[Typescript](https://www.typescriptlang.org) which has a great ecosystem

I''ve found working with types initially a bit confusing until a basic
understanding of
[genrics](https://en.wikipedia.org/wiki/Generic_programming#Programming_language_support_for_genericity)
is understood. Now disregarding the Javascript ecosystem. Once you have all the
build tools set up typescript is pretty nice, most packages have a pre-existing
typed version of their packages such as
[@types/express](https://www.npmjs.com/package/@types/express).

## Development Velocity

In any case, a developer''s initial velocity will feel quite low working with
typed languages often struggling to figure out specific errors or how to extend
a type using the previously mentioned generics.

But you will spend waay less time down the road catching undiscovered bugs, like
undefined variables, unhandled errors or exceptions and other bad coding
practices.

Once core functionality and workflow are established releasing new features or
refactors becomes much easier. Plus your CLI''s and web server start nearly
instantly which makes spinning up a free [Heroku](http://heroku.com) Dyno from
sleep is feel like a quick lambda

## Strong Ecosystem

Cargo is the default package manager for Rust and is very easy to use. The
communities are all great, often getting back to you very quickly.

## Building Better API''s: Moving away from Django

[Django](http://djangoproject.com) batteries included is a blessing and a curse,
concepts that don''t work well with a pure API such as using
[django forms](https://docs.djangoproject.com/en/3.0/topics/forms/) for example
in [django-rest-frameworks](https://www.django-rest-framework.org) to validate
request
[REST validation](https://www.django-rest-framework.org/api-guide/validators/#validation-in-rest-framework)
is great piggybacking if you already have a Django codebase, but doesn''t
translate well outside of Django. Or trying to build anything custom in the
Django Admin becomes laborious when the rest of your front end is written in
[React](http://reactjs.org).

Previously I''ve written a React/Django Boilerplate called
[Rjango](https://github.com/ncrmro/rjango), which I spoke a
[PyCon India 2017](https://in.pycon.org/cfp/2017/proposals/building-single-page-javascript-apps-with-django-graphql-relay-and-react~axoze/)
I''ve found GraphQL and Relay are pretty optional outside (Relay I don''t even
really recommend using) so I like to stick to stick with just REST nowadays.

### The replacement API built in Rust: [planet-express](https://github.com/ncrmro/planet-express)

My replacement for Rjango is a Rust Boilerplate called
[planet-express](https://github.com/ncrmro/planet-express). It uses
[SQLx](https://github.com/launchbadge/sqlx) so your queries are written in SQL
which is checked at compile time to ensure your SQL is compliant and your
Database and Rust Types are always in line.

For the webserver, I''ve used [Actix](https://actix.rs) in conjunction wither
[PaperClip](https://github.com/wafflespeanut/paperclip) generate
[OpenAPI](https://www.openapis.org) spec which can be used to generate
client-side libraries for your API.

## Embedded Development

I''ve been wanting to get into more IoT,
[Home Automation](https://en.wikipedia.org/wiki/Home_automation),
Robotics/Drones and [SCADA](https://en.wikipedia.org/wiki/SCADA),
[MicroSats](https://en.wikipedia.org/wiki/Small_satellite) etc. I''ve got a few
projects in mind. Although typically you will be working at a much lower level
using Rust and I''m finding quick MVPs may still be easier in
[Arduino](http://arduino.cc) or [MicroPython](https://micropython.org).

For hardware, I''ve primarily been using
[Raspberry Pi Zero WH](https://www.raspberrypi.org/blog/raspberry-pi-zero-w-joins-family/)
and [ESP32](https://en.wikipedia.org/wiki/ESP32) (ESP32 and ESP8266) are often
used to add WiFi or Bluetooth capabilities to Ardunio but can be programmed
outright with their own set of
[GPIO](https://en.wikipedia.org/wiki/General-purpose_input/output) pins,
[I2C](https://en.wikipedia.org/wiki/I²C), PWM, real-time clock support, etc.

For the various kids of hardware you might find there is usally a
[embedded-hal](https://github.com/rust-embedded/embedded-hal)) implementation
available.

A [HAL](https://en.wikipedia.org/wiki/Hardware_abstraction) is a hardware
abstraction layer it provides a standardized way to interact with GPIO pins,
i2c, PWM etc. One available for linx is
[linux-embedded-hal](https://github.com/rust-embedded/linux-embedded-hal)

### Rust on Pi

Getting Rust to work on a Pi is much simpler with compiling happening in a
docker container on your local machine and then being deployed over
[SCP](https://en.wikipedia.org/wiki/Secure_copy), the binary on the Pi is is
then executed using [SSH](https://en.wikipedia.org/wiki/Secure_Shell) with
output piped to back to your local machine. When the SSH connection is closed
the binary is stopped, this is easy to verify with say an LED from a Blink
example (a common form of hello world in the embedded community). This all
happens in
[this](https://gist.github.com/ncrmro/ac6fa59c9125ac612c827391998e09fb) script
which also only builds and copies the files if anything has changed. It will
execute the binary regardless. I''ve got a few of these simple repositories up
for personal reference and experimenting with the various packages.
[Here](https://github.com/ncrmro/rust-pi-blink) is the code for a rust based
blink on a pi.

### Rust on ESP32

To get the ESP32 to work with rust we used
[MabezDev''s](https://github.com/MabezDev)
[rust-extensa](https://github.com/MabezDev/rust-xtensa) fork.
[Extensa](https://docs.espressif.com/projects/esp-idf/en/release-v3.0/get-started/linux-setup.html)
being the ESP32 platform. He is very helpful on the
[esp-rs matrix channel](https://matrix.to/#/#esp-rs:matrix.org).

Although atm I''ve been unable to get WiFi or Bluetooth working in a super
streamlined manner.
[MabezDev linked](https://matrix.to/#/!LdaNPfUfvefOLewEIM:matrix.org/$WB3t660N0rQ-wyOue1-cB6UtDnH-nxqo1u5JHVJOoKY?via=matrix.org&via=matrix.0x1010.de&via=laas.fr)
to [this](https://github.com/reitermarkus/esp32-hello) project by
[reitermarkus](https://github.com/reitermarkus) which builds on the
[ESP-IDF](https://github.com/espressif/esp-idf) the official ESP32 framework.

## Closing

I''ve just scratched the surface. But I feel I''ve got a pretty good evaluation of
what using Rust is like. As per usual when learning a new technology I''m trying
to figure out when not to use as much as when to use it.
', 'evaluating-rust', 0, null, '1', '2023-08-01 01:55:36'),
        ('09f64ff0-e654-45b0-b1b4-824739780ec9', 'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Building a Enum Based Form Stepper In React Typescript', '

First, we are going to create our steps as enums. If we don''t define values for
our enums the will by default increment. This design pattern works best with at
least 3 form steps.

```typescript jsx
enum FormState {
  Default, // 0
  Address, // 1
  Billing, // 2
}
```

Next, let''s add the state and for now, we will deal with only the default case
which is the first step in our multipart from stepper. We can see that we can
now also increment the stepper, because of our default case it will also be our
first step named default.

```typescript jsx
enum FormState {
  Default, // 0
  Address, // 1
  Billing, // 2
}

const Form: React.FC = () => {
  const [formStep, setFormStep] = useState<FormState>(FormState.Default);
  let step;
  switch (formStep) {
    case FormState.Default:
    default:
      step = <>First step</>;
      break;
  }
  return (
    <form>
      <div>{step}</div>
      <div>
        <Button onClick={() => setFormStep(formStep - 1)}>Back</Button>
        <Button onClick={() => setFormStep(formStep + 1)}>Next</Button>
      </div>
    </form>
  );
};
```

Lastly, we add the other steps (which could be components defined elsewhere) and
`gridTemplateAreas`, which we could use to further change our form layout.

```typescript jsx
enum FormState {
  Default, // 0
  Address, // 1
  Billing, // 2
}

const Form = () => {
  const [formStep, setFormStep] = useState<FormState>(FormState.Default);
  let step;
  switch (formStep) {
    case FormState.Address:
      step = <div>Address Step</div>;
      break;
    case FormState.Billing:
      step = <div>Billing Step</div>;
      break;
    case FormState.Default:
    default:
      step = <>First step</>;
      break;
  }
  return (
    <form
      style={{
        gridTemplateAreas: "''step-body'' ''step-action''",
        gridTemplateRows: "auto auto",
      }}
    >
      <div style={{ gridArea: "step-body" }}>{step}</div>
      <div className="flex justify-end" style={{ gridArea: "step-action" }}>
        <Button onClick={() => setFormStep(formStep - 1)} className="mr-2">
          Back
        </Button>
        <Button onClick={() => setFormStep(formStep + 1)}>Next</Button>
      </div>
    </form>
  );
};
```
', 'building-a-enum-based-form-stepper-in-react-typescript', 0, null, '1', '2023-08-01 01:55:36'),
        ('13287431-d5e3-4ebd-8b35-5a9b2577f113', 'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Typescript React Grid Areas', '

While working on [JTX](https://jtronics.exchange/) I''ve started to design for
mobile-first.
[CSS Grid Layout ](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
has been on my to-learn list for a long time. While learning more about Grid
Layout I learned about this neat feature (CSS property) called
[grid-template-areas](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas)

Naturally, I wanted to make this into a
[React reusable component](https://reactjs.org/docs/components-and-props.html)
with [Typescript Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
I could lock down styling to specific use cases.

These components use [Tailwind](http://tailwindcss.com/docs) for styling, but
the Typescript enums that define which style to use could easily be switched
out.

We can also
[enable grid area names](https://developers.google.com/web/tools/chrome-devtools/css/grid#area-names)
in [Chrome Devtools](https://developers.google.com/web/tools/chrome-devtools)

### The Code

I will first show us using the components and the next section shows the actual
components

```typescript jsx
import React from "react";
import PageLayout from "../components/PageLayout";
import SearchFilters from "../components/SearchFilters";
import { Grid, GridSection, GridType } from "../components/Grid";

interface SearchResultsProps {}
enum GridArea {
  Sidebar = "search-sidebar",
  Results = "search-results",
}

const SearchResults: React.FC<SearchResultsProps> = (props) => {
  return (
    <PageLayout id="search">
      <Grid
        type={GridType.ThreeColumn}
        areas={[GridArea.Sidebar, GridArea.Results]}
      >
        <GridSection
          id={GridArea.Sidebar}
          className="w-auto md:w-64"
          area={GridArea.Sidebar}
        >
          <SearchFilters />
        </GridSection>
        <GridSection
          id={GridArea.Results}
          className="col-span-2"
          area={GridArea.Results}
        >
          <Grid type={GridType.SingleColumn}>
            {data.searchResuls.nodes.map((result, idx) => (
              <div key={idx}>result.name</div>
            ))}
          </Grid>
        </GridSection>
      </Grid>
    </PageLayout>
  );
};
```

```typescript jsx
import React from "react";

/**
 * These are the various ways we want to use out grid
 * @enum {string}
 * */
export enum GridType {
  Auto = "grid-flow-row md:grid-flow-col auto-cols-max",
  SingleColumn = "grid-flow-row auto-cols-max",
  ThreeColumn = "grid-cols-3 gap-4",
}

interface GridProps {
  children;
  type?: GridType;
  gridTemplateAreas?: string;
  className?: string;
  areas?: Array<string>;
}

interface GridStyles {
  gridTemplateAreas?: string;
}

/**
 * Our universal grid component
 * The areas props allows us to use named grid areas
 */
export const Grid: React.FC<GridProps> = (props) => {
  const type = props.type ? props.type : GridType.Auto;
  const className = `grid ${type} ${props.className ? props.className : ""}`;
  const styles: GridStyles = {};

  if (props.areas) {
    styles.gridTemplateAreas = "";
    props.areas.forEach(
      (area) =>
        (styles.gridTemplateAreas = `${styles.gridTemplateAreas} ''${area}''`)
    );
  }
  return (
    <div className={className} style={styles}>
      {props.children}
    </div>
  );
};

/**
 * Our universal grid section component
 * The area prop allows us to specify the grid area name
 */
export interface GridSectionProps {
  id?: string;
  children;
  className: string;
  area: string;
}

export const GridSection: React.FC<GridSectionProps> = (props) => (
  <div
    id={props.id}
    className={props.className}
    style={{ gridArea: `${props.area}` }}
  >
    {props.children}
  </div>
);

export default Grid;
```

Hope you enjoyed!
', 'typescript-react-grid-areas', 0, null, '1', '2023-08-01 01:55:36'),
        ('15801caa-0009-4ca7-b2b9-568d7f48f3c9', 'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Alpine k3s based single node Kubernetes cluster.', '

Setting up a Kubernetes cluster can be pretty straightforward, in this guide we
are going to set up a Single Node Kubernetes cluster using
[Alpine](https://alpinelinux.org/about/) and [k3s](https://k3s.io/). If you''ve
worked with containers previously you should have some experience with Alpine
and if not this is a great way to familiarize yourself.

I originally was using [k3os](https://github.com/rancher/k3os) (an operating
system specifically for running k3s) but its terseness becomes slightly
difficult to work around at a certain point.

The breaking point for k3os for me was utilizing
[9p filesystem passthrough](https://wiki.qemu.org/Documentation/9psetup) when
running my cluster from inside a VM running on my
[KVM](https://en.wikipedia.org/wiki/Kernel-based_Virtual_Machine) based
[baremetal Hypervisor](https://en.wikipedia.org/wiki/Hypervisor), which I was
not able to configure using k3os.

The beauty here is you don''t need to concern yourself with the esoteric
idiosyncrasy of various cloud providers. Instead, you can
[install Alpine](https://wiki.alpinelinux.org/wiki/Installation) in what ever
environment most suites you.

This means your free to install Alpine on bare-metal, in a VM, or even on a
cloud provider.

## Alpine Install

I''m not going to cover
[how to install Alpine](https://wiki.alpinelinux.org/wiki/Installation) here
in-depth.

You''ll need to
[download the extended edition](https://alpinelinux.org/downloads/) of Alpine,
then flash to a USB or boot in a VM.

You''ll find yourself at the login prompt and the username is `root` if you read
the notes post login you''ll see it mentions running a script to install Alpine.

```bash
setup-alpine
```

Follow the directions and reboot. If you''re running inside a VM for initial
testing now is a good time to take a snapshot.

### Alpine OS configurations

We need to set up SSH access. Feel free to enable root password SSH key access,
although a more modern approach would be to download your Public Keys from
Github.

```bash
apk add curl
mkdir ~/.ssh
touch ~/.ssh/authorized_keys
curl https://github.com/your-username.keys >> ~/.ssh/authorized_keys
```

Now you should be able to login!

```bash
ssh root@ALPINE_IP_ADDRESS
```

## K3s Install

[Installing K3s](https://github.com/k3s-io/k3s#quick-start---install-script) is
quite easy.

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--write-kubeconfig-mode 644" sh -
```

At this point, we have a fully functional (single node) Kubernetes cluster!

```bash
kubectl get pods --all-namespaces
```

This will output the following.

```bash
NAMESPACE     NAME                                      READY   STATUS      RESTARTS   AGE
kube-system   local-path-provisioner-7c458769fb-mqcqm   1/1     Running     0          18m
kube-system   metrics-server-86cbb8457f-nwwb9           1/1     Running     0          18m
kube-system   coredns-854c77959c-4jcx8                  1/1     Running     0          18m
kube-system   helm-install-traefik-qgxr2                0/1     Completed   0          18m
kube-system   svclb-traefik-kgb8n                       2/2     Running     0          18m
kube-system   traefik-6f9cbd9bd4-5kk9d                  1/1     Running     0          18m
```

## Remote Kubectl Access

Now to set up remote access and control of our Kubernetes cluster we can
download the Kube config locally.

```bash
scp root@ALPINE_IP_ADDRESS:/etc/rancher/k3s/k3s.yaml ./
```

Once you have the file locally we need to edit the cluster IP address

```yaml
apiVersion: v1
clusters:
  - cluster:
    server: https://127.0.0.1:6443
```

At this point, we can move this to the default kube config location

```bash
mv k3s.yaml ~/.kube/config
```
', 'alpine-k3s-based-single-node-kubernetes-cluster', 0, null, '1', '2023-08-01 01:55:36'),
        ('16893915-584f-48c9-84a0-0a6757d04ec7', 'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Mount Kilimanjaro Part 1 - Getting ready', '

## Overview

I''m writing this about two weeks from the trip to Tanzania to climb/hike
Kilimanjaro. I''m going with Courage Rising a partnership between
[Valleywise Health Foundation](http://valleywisehealthfoundation.org) and
[K2 adventures](https://k2adventuretravel.com) as a part of a group consisting
of burn survivors, health professionals, and donors. We are raising money for
the Arizona Burn Center, I need to raise an additional 7.5k to meet my goal.
Donations can be made
[here](https://secure.givelively.org/donate/valleywise-health-foundation/courage-rising/nicholas-romero-2)

## How I got involved

My friend and coworker [Juan Palomino](https://twitter.com/JuanForTheMoney)
invited me. He set up setting up an NFT drop called
[Viva Muerto](https://www.vivamuertos.com) to raise money for Valley Health. Our
friend and his girlfriend Mikala works at Valleywise Health and has been helping
organize the trip.

## Raising Money

The goal for each of the team members is to raise 10,000$ USD. This money goes
to the foundation and K2 then has donated their guided tour, as of writing.

Fundraising is hard I''ve learned, it''s not easy to push politely, with friends
and family and any donations should be met with gratitude. Previously it was
(verbally) mentioned that we could raise what we could and call it a day.

With a large amount of hubris during the on boarding call said I would cover
what remained after my fundraising attempts. An email was sent out later
mentioning anyone who doesn''t meet their goal won''t be able to attend, and
further correspondence mentioned that we could (again) donate the rest ourselves
(for a nice tax write-off).

## Expenses (Gear & Travel)

The fundraiser does not include the travel or gear costs. The K2 team provided
[a gear list](http://valleywisehealthfoundation.org/wp-content/uploads/20…)
Although after a bit of research and discussion this gear list is slightly
superfluous, eg multiple types of boots.

The flight to Tanzania on KLM is about 2000$ itself. And I''ve spent around 1000
dollars on gear. Some of which I''m hoping to use in the future. Currently, I''ve
gotten my last haul of shipments and trying to open all the boxes.

## Physical Fitness and Altitude

The summiting the mountain for a group can take anywhere between 5 to 9 days.
Longer trips give climbers more time to acclimate to the altitude, and they say
9 day trips have around 80% success summiting the mountain.

It''s also recommended to get altitude medication, which is usually Diamox.

I''ve not done to much to prepare myself physically other than my usual
powerlifting three times a week (dead lifted 450x4 today for example), Some HIT
workouts in the pool and some hot yoga. I do wish I was running still a bit more
and gotten more altitude training in.

I did some reading though on the world record holders and Kili has been (with
acclimation and not carrying food) summited in 6 hours, this has giving me a
large amount of hope that I won''t have problems summiting.
', 'mount-kilimanjaro-part-1---getting-ready', 0, null, '1', '2023-08-01 01:55:36'),
        ('1d0d19ff-4147-434c-9adf-8d24a57170cf', 'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Building a scheduled CI E2E test failure Slack notifier', '

## Background

At one of my jobs, we needed to build out an E2E test suite. We settled on
Microsoft''s [Playwright](https://playwright.dev/) along with
[playwright-test](https://github.com/microsoft/playwright-test) and
[folio](https://github.com/microsoft/folio) as the test runner.

These E2E tests serve to ensure that our [React](https://reactjs.org/) and
[Next.JS](https://nextjs.org/) front end worked as expected with the
corresponding GraphQL and Rest endpoints across our various environments.

Our end goal is a [Slack](https://slack.com/) channel titled `scheduled-testing`
that gets messages we send from a
[Slack API Webhook](https://api.slack.com/messaging/webhooks) that look like the
following (Testing against is the URL of the environment we are testing against,
redacted for work).

<Image src="slack-notification-for-failed-e2e-tests.jpg" alt=''A Slack message showing which E2E tests failed, what CI job they failed on, the total time, and the error count.''  />

## Building it

I wanted to build it using a minimal amount of dependencies. playwright-test
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

We would then call the notification script

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
', 'building-a-scheduled-ci-e2e-test-failure-slack-notifier', 0, null, '1', '2023-08-01 01:55:36'),
        ('2049a265-2e47-4c0a-9ec4-2bcd6faddad6', 'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Scytale: Ansible Automated Private Key Infrastructure.', '

> In cryptography, a scytale, is a tool used to perform a transposition cipher,
> consisting of a cylinder with a strip of parchment wound around it on which is
> written a message. The ancient Greeks, and the Spartans in particular, are
> said to have used this cipher to communicate during military campaigns.
>
> [Wikipedia](https://en.wikipedia.org/wiki/Scytale)

Scytale Github Link [here](https://github.com/ncrmro/scytale)

## Background

While building my own infrastructure/intranet I started wanting to have SSL/TLS
connections. Almost all of my connections currently take place over Wireguard
anyway. This is handled by a project called Mercury that I still need to
opensource.

Now I have a couple VM''s at the moment that host various docker containers.
While they all sit inside the Wireguard network some connections I would prefer
to happen without leaving the LAN. All of the hosts are VM''s on the same NAS
that creates the NFS shares that the Docker hosts create their volumes from. But
only one of the Docker hosts contains the stateful applications, eg Postgres,
Docker Registry, RabitMQ, Prometheus.

This is where the SSL comes in we want our services to talk to Postgres/RabitMQ
etc over SSL/TLS. Additionally we can require any clients to also present a
certificate for authentication.

## PKI Basics

Both the server and client certificates are signed by our Root CA. The Root CA
certificate is installed on both the client and server thus they can each
validate each other against the Root CA. More of this is covered in the
project''s readme.

## Getting Started

Some setup

```
git clone https://github.com/ncrmro/scytale.git

cd scytale

pip install ansible==2.9.10

# If you already have an Ansible Vault Key set its path in vars.yml otherwise
echo random_password > ~/.ansible/vault/default_key.txt
```

To run the ansible play just run

```bash
sh ./main.sh
```

This calls

```bash
ansible-playbook --vault-password-file ~/.ansible/vault/default_key.txt -i hosts main.yml
```

Whoot! now you have your private key infrastructure.

If you check your `vars_vault.yml` it now contains all your private keys which
can be checked into your git repo!
', 'scytale-ansible-automated-private-key-infrastructure', 0, null, '1', '2023-08-01 01:55:36'),
        ('25738c17-ec4e-4d3a-a584-03b5fccb2ac2', 'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Driving a stepper motor with a microcontroller', '

I''m sitting here after accidentally destroying another ESP32 module and 3.3v
buck converter... Working with physical hardware can be a bit of a doozy coming
from the world of software.

## Hardware

Currently, I''ve anciently destroyed...

Parts I''ve anciently destroyed.

- x4 [ESP32](https://en.wikipedia.org/wiki/ESP32) Modules These get cooked with
  the voltage converters
- x3
  [Voltage Buck converters](https://smile.amazon.com/dp/B07FSLGPR8/ref=cm_sw_em_r_mt_dp_U_e.18EbYT0QC4M)
- x1
  [drv8833](https://learn.adafruit.com/adafruit-drv8833-dc-stepper-motor-driver-breakout-board)
  (didn''t realize it wasn''t a fan of 12v)
- x1 [drv8825](https://www.pololu.com/product/2133)
- couple LEDs

Some of these where simply wires coming loose in the breadboard and touching
things they were not supposed to. Having a multimeter on hand is a physical
debugger, kinda running blind without out. (left mine in Houston)

Also included

- bread boards
- NEMA 17 motor
- [Arduino Uno](https://en.wikipedia.org/wiki/Arduino_Uno)
- Pi Zero WH (The h means the headers are soldered to the board)
- 100 uf capacitor
- [12v Wall wart](https://smile.amazon.com/dp/B07DCPT1N7/ref=cm_sw_em_r_mt_dp_U_dz28EbW3A14S0)
- [Barrel jack plugs](https://smile.amazon.com/dp/B074LK7G86/ref=cm_sw_em_r_mt_dp_U_Rz28Eb3CF0KZ4)

<Image src="drv8833.jpeg" alt=''A drv8833 stepper motor in a breakout board format.''  />

This drv8833 I had to solder the header''s to it with the help of my friend
Johhny.

### Hardware Background

This isn''t my first time working with this kind of stuff. I built a 3D printer
ages ago while printing what parts I could. The rest is ordered. The drv8833 and
[nema motors](https://en.wikipedia.org/wiki/National_Electrical_Manufacturers_Association)
(National Electrical Manufacturers Association) are often used in 3D printing so
I knew those where a good place to start.

Typically the number designates the faceplate size of the motor eg the four
mounting points around the shaft, you can typically get the same size motor in
different lengths for more or less torque. The NEMA 17 for instance has 1.7"
inch faceplates. Below is a bunch of different sized images.

<Image src="nema-stepper-motors.jpg" alt=''Diffrent sized NEMA motors''  />

### Power

To power the whole affair we use 2.1mm barrel jack''s on the breadboard and 12v
wall-wart. This gives us the power for the drv8825/drv8833. Then we had the buck
voltage converter to power the microcontroller when not plugged into USB.

## Checking in your designs

Another thing I learned is taking pictures, I was able to get the motor working
with the drv8833 and came back to in a few days later and was not able to
reproduce so I''ve learned it''s usually a good idea to ''check everything in'' with
a few photos.

### Running the stepper motor with PWM Signals

Now driving the motors using the Arduino or the ESP32 and the Arduino IDE is
relatively easy. Using the Pi is a bit more involved, you need to enable kernel
support for PWM and you only have two PWM outputs. With the Uno you''ll get 6,
the ESP32 has 16!

This
[article](http://blog.oddbit.com/post/2017-09-26-some-notes-on-pwm-on-the-raspberry-pi/)
getting the Pi hardware PWM working.

A simple working example for the Arduino IDE and ESP32 follows. This spins the
motor one direction and then reverse.

```c
/*Example sketch to control a stepper motor with A4988/DRV8825 stepper motor driver and Arduino without a library. More info: https://www.makerguides.com */

// Define stepper motor connections and steps per revolution:
#define dirPin 16
#define stepPin 17
#define stepsPerRevolution 200

void setup() {
  Serial.begin(9600);

  Serial.println("Stepper test!");

  // Declare pins as output:
  pinMode(stepPin, OUTPUT);
  pinMode(dirPin, OUTPUT);
}

void loop() {
  Serial.println("Going clockwise!");
  // Set the spinning direction clockwise:
  digitalWrite(dirPin, HIGH);

  Serial.println("One slow revolution");
  // Spin the stepper motor 1 revolution slowly:
  for (int i = 0; i < stepsPerRevolution; i++) {
    // These four lines result in 1 step:
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(2000);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(2000);
  }

  delay(1000);

  Serial.println("Set direction counterclockwise");
  // Set the spinning direction counterclockwise:
  digitalWrite(dirPin, LOW);

  Serial.println("One slow revolution");
  // Spin the stepper motor 1 revolution quickly:
  for (int i = 0; i < stepsPerRevolution; i++) {
    // These four lines result in 1 step:
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(1000);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(1000);
  }

  delay(1000);
}
```

### It works!

<Image src="working-motor.gif" alt=''spinning stepper motor''  />
', 'driving-a-stepper-motor-with-a-microcontroller', 0, null, '1', '2023-08-01 01:55:36'),
        ('36a548f3-aafc-4c94-a469-fba7cca2ab7c', 'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Wireguard Based VPN Intranets', '

In this post, we will discuss why you might want a private intranet. An intranet
is a private computer network, a subspace of the internet.

- [LAN Intranets](#lan-intranets)
- [VPN Intranets](#vpn-intranets)
- [Private and Off the Grid](#private-and-off-the-grid)
- [How VPN''s Work](#how-vpns-works)
- [Domains and DNS](#domains-and-dns)
- [PKI (SSL Certs)](#pki-and-certificates)
- [Implementation](#implementation)

## LAN Intranets

Almost everyone these days has an intranet already, your wifi router gives all
of your home devices a LAN (pocket of the internet) behind a single public IP
address. This process of mapping ports to and from device IP addresses to a port
not in use on the external-facing IP address is called
[Network Address Translation](https://en.wikipedia.org/wiki/Network_address_translation).

Inside this network, you can access other computers and servers like a NAS for
instance say maybe to perform a backup or watch a movie of it. What happens
though when you want to access this server remotely or maybe have a family
member access or host a server themselves for you to access.

## VPN Intranets

In this case, we want a
[Virtual Private Network VPN](https://en.wikipedia.org/wiki/Virtual_private_network),
this is a server that acts very much like the router you have at home. The VPN
also authenticates and encrypts any connections to the VPN server. Most people
are familiar with this usage to send all your data over a VPN for privacy or to
route around Geolocation restrictions.

## Private and "Off the Grid"

In many situations, if you wanted to access your self-hosted server you could
always port forward to a proxy inside your LAN. The problem of course is now
everyone can access your server good passwords or not it would still be nicer if
we could both access our servers remotely but not have them publicly accessible.

## How VPN''s works

Both your VPN and it''s clients (your devices and server) all get an IP address,
the VPN most likely listening on an either port forwarded port from your public
external IP or listings directly on the external address.

The clients get LAN IP addresses from whatever router''s lan they are on.

### VPN Subnet

Now all these LANs have their subnets defined by the router. Our VPN is no
different (then a router) and has it''s own
[subnet](https://en.wikipedia.org/wiki/Subnetwork).

For my VPN subnets I typically like `10.2.3.0/24` (easy to remember it 1.2.3),
this means our VPN server would usually give it''s self the first IP in that list
of 256 IP address, all the clients would then get an IP from the remainder
available on the subnet and would send their data to `10.2.3.1` (the VPN
server''s address inside the VPN).

This now means if you on your phone (eg: IP address 10.2.3.4) you could access
your NAS (eg: 10.2.3.10) even on separate networks.

## Domains and DNS

Now trying to connect to all of your services by IP address would be a huge pain
And this is cause we''ve only implemented
[layer 3 (Network layer IP4/IP6)](https://en.wikipedia.org/wiki/Network_layer)
and
[Layer 4 (Transport Layer TCP/UDP)](https://en.wikipedia.org/wiki/Transport_layer)
of the [OSI Model](https://en.wikipedia.org/wiki/OSI_model)

[DNS](https://en.wikipedia.org/wiki/Domain_Name_System) the protocol that maps
hostnames to IP address is actually
[layer 7 (Application Layer)](https://en.wikipedia.org/wiki/Application_layer)
and not required or implemented by a VPN server.

Furthermore, we probably want to have our services sit behind a
[proxy server](https://en.wikipedia.org/wiki/Proxy_server) so we could have many
services sitting behind a single VPN IP address.

### Unlimited Domains

Once we have our DNS server we can then assign any IP address routed by our VPN
to any number of hostnames. We can typically tell our VPN client software we
would like all DNS traffic routed to a specified server (typically one also
listening on the VPN).

## PKI and Certificates

PKI means
[Public Key Infrastructures](https://en.wikipedia.org/wiki/Public_key_infrastructure)

Even though all of our network traffic is encrypted already over the VPN, all
major browsers will give you the dreaded SSL warnings. Furthermore, with trusted
SSL certs for these custom domains, the VPN server itself would not be able to
read traffic in the clear between any two clients or servers.

This means generating a
[Root CA](https://en.wikipedia.org/wiki/Root_certificate), distributing and
installing it to any clients or servers, then generating Certs for your various
services.

## Implementation

I''ve implemented this concept of an intranet using various open-source tools and
Ansible roles I''ve built out.

The "stack" per se here consists of

- VPN - [Wireguard](https://www.wireguard.com/)
- DNS - [PiHole](https://pi-hole.net/)
- PKI - [Scytale](https://github.com/ncrmro/scytale)

### Wireguard

To set up the VPN server I use an
[Ansible Playbook](https://docs.ansible.com/ansible/latest/user_guide/playbooks.html)
I wrote called [Mercury](https://github.com/ncrmro/mercury), which at the time
of writing could use some refactoring.

Essentially you specify the subnet and clients you want to be defined and the
ansible script will install Wireguard and generate all of the various
certificates.

Adding new users allows for subsequent runs to generate any deltas required.

### PiHole

I typically install PiHole inside of a docker container and call it a day. The
PiHole also blocks ads and trackers, while also, allow you to specify custom DNS
records (eg any custom domains).

### PKI

For PKI I also use an Ansible Playbook called
[Scytale](https://github.com/ncrmro/scytale) that generates the Root CA and any
other certificates you need. It then checks those certs into the Vault allow
them to be committed as encrypted files.
', 'wireguard-based-vpn-intranets', 0, null, '1', '2023-08-01 01:55:36'),
        ('5406d34d-6b44-4c15-97ee-66289d801ebc', 'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Getting your Heart in Redzone', '

# Why

I recently got my fourth DEXA scan over at [Live Lean RX](http://liveleanrx.com)
and the technician coaches me on nutrition and other aspects of living lean.

One thing he always mentions is training for [Vo2 max](https://en.wikipedia.org/wiki/VO2_max). This increasing your
[Resting Metabolic Rate (RMR)](https://blog.nasm.org/nutrition/resting-metabolic-rate-how-to-calculate-and-improve-yours) aka your metabolism completely at rest.

The RMR test has you fast and then exhale into a tube for a few minutes and
checks the levels of the gases in your breath the Vo2 max test is the same but
with you working out super hard.

# How

Raising our Vo2 Max levels involves us getting our Heart to maximum BPM just for
a few seconds just like lifting heavier and heavier weights just for a bit will
make you stronger.

In [Watch OS 9](https://www.apple.com/watchos/watchos-9/) Apple introduced the
[heart rate zones screen](https://support.apple.com/guide/watch/view-heart-rate-zones-apd30fa26bb4/watchos)
in the Workout app.

<Image src="IMG_0521.jpeg" alt=''Apple watch heart rate zone screen showing blue zone before a workout''  />

This allows us to get a visual indication of when we hit the sought-after red
zone.

<Image src="IMG_0522.jpeg" alt=''Apple watch heart rate zone screen showing orange zone right after workout''  />

# What

I decided to use a rower to get a full-body workout, it took a bit longer than I
expected and I pushed the rower to max resistance but lowered it after I started
to get gassed.

<Image src="IMG_0523.jpeg" alt=''Apple watch heart rate zone screen showing red zone''  />

Standing up after the workout I was super shakey and for the rest of the day had
a runner''s high.

Final heart rate graph here

<Image src="IMG_0524.jpeg" alt=''Apple watch heart rate zone screen showing red zone''  />
', 'getting-your-heart-in-redzone', 0, null, '1', '2023-08-01 01:55:36');