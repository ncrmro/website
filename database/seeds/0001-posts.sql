insert into main.posts (id, user_id, title, body, description, slug, published,
                        publish_date, created_at, updated_at)
values ('037068ff-0c16-459e-9c21-7038d8434c5f',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Docker Linux Workstation Development', '

Something that will become apparent at some point of your journey using a Linux
workstation as a development environment is that Docker runs as Root hence all
commands must be run with sudo, directories and volumes will be owned by the
root users (and must be removed with sudo for instance) as well.

## [Docker Rootless](https://docs.docker.com/engine/security/rootless/#daemon)

Best practice to run Docker in Rootless mode whenever you can.

If you follow the
[guide](https://docs.docker.com/engine/security/rootless/#daemon) over at
Docker''s website will get your pretty far.

This essentially boils down to a few things

## Finding a Compatible Storage Driver

I ran into some problems around Docker by default continuing to use ZFS (my
workstation
[OS root file system is ZFS](https://openzfs.github.io/openzfs-docs/Getting%20Started/Ubuntu/Ubuntu%2020.04%20Root%20on%20ZFS.html#id5))
for storage that now no longer has permissions to run ZFS commands.

These docs were not immediately clear on how to alleviate this.

Attempting to set the storage driver to any of the recommended `overlay2`,
`fuse-overlay`, `aufs` or depreciated `devicemapper` all gave errors on startup
looking something like a stopped docker service.

Starting the rootless docker image like so

```bash
~/bin/dockerd-rootless.sh
```

Would result in something like this.

```bash
...
ERRO[2021-02-06T07:59:07.331974204-06:00] failed to mount overlay: invalid argument     storage-driver=overlay2
INFO[2021-02-06T07:59:07.332726224-06:00] stopping healthcheck following graceful shutdown  module=libcontainerd
INFO[2021-02-06T07:59:07.332739655-06:00] stopping event stream following graceful shutdown  error="context canceled" module=libcontainerd namespace=plugins.moby
failed to start daemon: error initializing graphdriver: driver not supported
[rootlesskit:child ] error: command [/home/ncrmro/bin/dockerd-rootless.sh] exited: exit status 1
[rootlesskit:parent] error: child exited: exit status 1
```

### VFS

VFS is pretty heavy-handed when
[looking into the details](https://docs.docker.com/storage/storagedriver/vfs-driver/),
Each layer for a downloaded container image is stored separately taking up
exponentially more space than other storage drivers, we will address that caveat
in a second.

Stop Docker

```bash
systemctl --user stop docker
```

Create or modify the `daemon.json`

```bash
nano ~/.config/docker/daemon.json
```

Content should be as follows.

```json5
{
  "storage-driver": "vfs",
}
```

Start Docker

```bash
systemctl --user start docker
```

Check Status of Docker Daemon

```bash
systemctl --user status docker.service
```

### VFS Capping Usage

- note for now, i''ve had a little trouble getting this to start with
  storage-opts \*

To keep our VFS from consuming all of our disk space we can set a max amount of
storage the VFS storage driver will use.

```json5
{
  "storage-driver": "vfs",
  "storage-opts": ["size=25G"],
}
```
', 'Making linux Docker more like Docker Desktop for macOS and Windows.',
        'docker', 1, '2021-02-06', '2023-08-04 14:16:13',
        '2023-08-04 14:16:13'),
       ('3aca3ac3-ddad-4571-9806-e713859fa0e7',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Straight forward reusable React components', '

## Background

I''ve become a big fan of not using too many libraries in my frontend
applications both because of performance concerns and often pre-made components
styles are hard to override with small tweaks.

Now days

- Typically like writing straight simple CSS.
- Try not to write reusable components too early (premature
  optimization/abstractions) Reusable components should carry their own state

## Examples

### HR - [Horizontal Rule](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hr)

Let''s take a `<hr/>` HTML tag for example. Rather than give any specific element
a bottom border we can instead use an `<hr/>` reusable component.

<Image src="horizontal-rule-in-form.png" alt=''Demonstrating the Mutation Updating the Apollo Cache''  />

Writing a reusable component can usually result in decision paralysis

- How do we handle all potential prop cases (further demonstrated in next
  component)
- If we want to override the color defined in the CSS we can pass those in as
  styles

By CMD clicking say the `div` tag we can see the prop types.

```typescript jsx
// HorizontalRule.tsx
import React from "react";
import styles from "./HorizontalRule.module.css";

type HorizontalRuleProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHRElement>,
  HTMLHRElement
>;

const HorizontalRule: React.FC<HorizontalRuleProps> = (props) => (
  <hr className={styles.root} {...props} />
);

export default HorizontalRule;
```

```css
/*HorizontalRule.module.css*/
.root {
  border-top: 1px solid var(--greyLight);
  width: 100%;
}
```

A couple of things to note, about this design pattern.

- Basic CSS styles are applied through the classname prop
- Props are after the initial classname allowing us to pass in a custom
  classname later or just a styles object

## Input

On the Input component a few notes

- The onChange function type is overrode and automatically return the value
  rather than the element
- Now we can automatically pass props to input autocomplete, required, regex
  patterns, etc with having to manually define them again
- Even tho we have a custom onChange method we can still override to get the
  original element (although we might need two on change function type
  declarations)

```typescript jsx
import React from "react";
import styles from "./Input.module.css";

interface Props
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "onChange"
  > {
  id: string;
  label?: string;
  onChange: (value: string) => void;
}

const Input: React.FC<Props> = ({ label, onChange, ...props }) => (
  <div className={styles.root}>
    {label && (
      <label htmlFor={props.id} className={styles.label}>
        {label}
      </label>
    )}
    <input
      className={styles.input}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  </div>
);

export default Input;
```

## Dropdown selector

We can take this idea even further when implementing a dropdown selector in the
code below we can now pass any props to the root/label/select/options tags.

These types come from the react library typings themselves but are not exported.

```typescript jsx
import React from "react";
import styles from "./DropdownSelect.module.css";
export interface DropdownSelectProps {
  id: string;
  name: string;
  value: string;
  values: Array<[value: string, text: string]>;
  onChange: (value: string) => void;
  rootDivProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  labelProps?: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >;
  selectProps?: React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >;
  optionsProps?: React.DetailedHTMLProps<
    React.OptionHTMLAttributes<HTMLOptionElement>,
    HTMLOptionElement
  >;
}

const DropdownSelect: React.FC<DropdownSelectProps> = (props) => (
  <div className={styles.root} {...props.rootDivProps}>
    <label htmlFor={props.id} {...props.labelProps}>
      {props.name}
    </label>

    <select
      name={props.name}
      id={props.id}
      onChange={(e) => props.onChange(e.target.value)}
    >
      {props.values.map(([value, text]) => (
        <option key={value} value={value}>
          {text}
        </option>
      ))}
    </select>
  </div>
);

export default DropdownSelect;
```

## RadioButtons

```typescript jsx
import React from "react";
import styles from "./RadioButtons.module.css";

interface RadioButtonsProps {
  name: string;
  selectedValue: string;
  onSelect: (value: string) => void;
  options: Array<{ id?: string; value: string; text: string }>;
  rootDivProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  labelProps?: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >;
  radioButtonProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
}

const RadioButtons: React.FC<RadioButtonsProps> = (props) => (
  <div className={styles.root} {...props.rootDivProps}>
    {props.options.map((option) => (
      <div key={option.value}>
        <input
          className={styles.input}
          {...props.radioButtonProps}
          value={option.value}
          checked={option.value === props.selectedValue}
          onChange={({ target: { value } }) => props.onSelect(value)}
          id={option.id ?? option.value}
          type="radio"
        />
        <label htmlFor={option.id ?? option.value} {...props.labelProps}>
          {option.text}
        </label>
      </div>
    ))}
  </div>
);

export default RadioButtons;
```

```css
.root {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
```

## Form component

- Classnames can be passed in addition the the bass styles
- onSubmit prop automatically prevents the default form action to happen

```typescript jsx
import React, { ReactNode } from "react";
import styles from "./Form.module.css";

export interface FormProps {
  id?: string;
  className?: string;
  header?: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
  errors?: string[];
  onSubmit?: () => void;
}

const Form: React.FC<FormProps> = (props) => (
  <form
    id={props.id}
    className={
      props.className ? `${styles.root} ${props.className}` : styles.root
    }
    onSubmit={(e) => {
      e.preventDefault();
      props.onSubmit && props.onSubmit();
    }}
  >
    {props.header}
    <div className={styles.errors}>
      {props.errors?.map((e, index) => (
        <span key={index}>{e}</span>
      ))}
    </div>
    <div className={styles.fields}>{props.children}</div>
    <div className={styles.actions}>
      {props.actions || <button type="submit">Submit</button>}
    </div>
  </form>
);

export default Form;
```

```css
.root {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  align-content: center;
  /*max-width: 30rem;*/
}

.errors {
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actions {
  float: right;
}

.actions input {
  float: right;
}

.actions button {
  float: right;
}
```
',
        'Building clean reusable components and avoiding decision paralysis when choosing their props.',
        'straight-forward-reusable-components', 1, '2022-02-02',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('3f0922ee-c2c7-4e7c-981c-ddedb74bc3f6',
        'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Wireguard Based VPN Intranets', '

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
', 'Understanding and Implementing Private Intranets',
        'wireguard-based-vpn-intranets', 1, '2021-01-07', '2023-08-04 14:16:13',
        '2023-08-04 14:16:13'),
       ('3f5aba2f-8533-485b-b5e8-8dd98382d997',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Scytale: Ansible Automated Private Key Infrastructure.', '

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
',
        'Automated private key infrastructure (PKI), Ansible managed certificate authority, server and client certificates.',
        'scytale-automated-private-key-infrastructure', 1, '2020-08-23',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('48062de4-412e-4201-a1b0-06e335c67a52',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Rsync''ing Code Directories Between two computers', '

I often find myself trying to keep the folder called code in which I keep my
code, synced between my workstation and laptop. I''d also like to be able to sync
when I''m not at home so I set the host dynamically based on if we can access the
workstaion at the \*.local domain.

```bash
scode() {
    if nc -z ncrmro-workstation.local 22 > /dev/null 2>&1
    then
        HOST=ncrmro-workstation.local
    else
        HOST=ncrmro-workstation.wg
    fi
    rsync -azP \
    --exclude=''node_modules'' --exclude=''venv'' --exclude=''target'' --exclude=''temp'' \
    --exclude=''*.img'' --exclude=''*.iso'' --exclude=''*.qcow2'' --exclude=''*.zip'' \
    --exclude=''vish'' --exclude=''vish_ml''  --exclude=''panotti'' \
    ncrmro@$HOST:/home/ncrmro/code /Users/ncrmro/code.ts
}
```
',
        'A script to attempt keeping my code folder in sync between my laptop and workstation.',
        'rsync-code-directories', 1, '2020-12-04', '2023-08-04 14:16:13',
        '2023-08-04 14:16:13'),
       ('48dca6a6-81d3-4661-8642-2544e73f0615',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Writing a gear torque calculator', '

Recently I ran into the problem of my stepper motor not able to produce enough
torque. This is even after adding some
[gears](https://www.thingiverse.com/thing:4305) I found on Thingverse based on
[Wades Extruder](https://reprap.org/wiki/Wade%27s_Geared_Extruder) used in 3D
printing.

In a
[previous post](/posts/2020_06_16_driving_stepper_motors_with_microcontroller.md)
previous post I talk about driving a stepper motor with a microcontroller.

The main components are.

- [NEMA Motors](https://en.wikipedia.org/wiki/NEMA_stepper_motor)
- [ESP32](https://en.wikipedia.org/wiki/ESP32)
- [DRV8825](https://www.pololu.com/product/2133)

After field-testing the motor I found it does not have enough torque for my
application.

The cool thing about the previously mentioned gear models is they come with
`.scad` files so they can be opened in OpenCAD to make larger/smaller or adjust
tooth count.

<Image src="gear_in_opencad.png" alt=''Viewing the CAD files in OpenCAD''  />

The code for the large gear for example looks like this.

```bash
module WadesL(){
   difference(){
      gear (number_of_teeth=39,
         circular_pitch=400,
         gear_thickness = 5,
         rim_thickness = 7,
         rim_width = 3,
         hub_thickness = 13,
         hub_diameter = 25,
         bore_diameter = 8,
         circles=4);
      translate([0,0,6])rotate([180,0,0])m8_hole_vert_with_hex(100);
   }
}
```

This is the moment I started to realize I need to brush up the relationship
between torque and gearing. Rather than guessing if a bigger motor or gear would
be sufficient I decided to write a small python library to pass different sized
gears and figure out the final torque.

The source can be found on Github
[here](https://github.com/ncrmro/gear-torque-calc), the Python package can be
found [here](https://pypi.org/project/gear-torque-calc/1.0.0/)

Usage is as follows.

```python
from gear_torque_calc import get_torque
import pprint
pp = pprint.PrettyPrinter()
res = get_torque(drive_shaft_diameter=5, drive_shaft_torque=.2, gear_small_diameter=15, gear_large_diameter=55)
pp.pprint(res)
res = get_torque(drive_shaft_diameter=5, drive_shaft_torque=.2, gear_small_diameter=15, gear_large_diameter=55*2)
pp.pprint(res)
```

This should give you the following output

```python
{''gear_ratio'': 7.333333333333333,
 ''large_gear'': {''force'': 26.666666666666668,
                ''radius'': 55.0,
                ''torque'': 1.4666666666666668},
 ''motor'': {''force'': 80.0, ''torque'': 0.2},
 ''small_gear'': {''force'': 26.666666666666668, ''radius'': 7.5, ''torque'': 0.2}}
{''gear_ratio'': 3.6666666666666665,
 ''large_gear'': {''force'': 26.666666666666668,
                ''radius'': 27.5,
                ''torque'': 0.7333333333333334},
 ''motor'': {''force'': 80.0, ''torque'': 0.2},
 ''small_gear'': {''force'': 26.666666666666668, ''radius'': 7.5, ''torque'': 0.2}}
```

We can now see doubling the large gear doubles our torque.
',
        'While utilizing a stepper motor and gears. I needed more torque and different sized gears. So I wrote a small gear torque calculator.',
        'writing-a-gear-torque-calculator', 1, '2020-07-02',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('4a737450-fd02-4fee-9676-6897fb52ae75',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Mount Kilimanjaro Part 1 - Getting ready', '

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
',
        'Origin''s of my Tanzania Africa trip to climb Kilimanjaro to raise funds for the Arizona Burn center.',
        'kilimanjaro-1-two-weeks-before', 1, '2022-06-01',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('54599438-4a97-4beb-abcb-630399bdfa1a',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Compiling and Testing on a remote microcontroller', '

Recently I''ve been doing a lot of microcontroller work. And I''ve wanted to
offload compiling code as well as having the microcontroller hosted without
carrying it around. These microcontrollers could be Arduino/esp32 etc.

I''ve got an Intel NUC that I''ve set up to automatically connect to my Wireguard
server. This means I always have the same IP to connect to as well as remote
access if I''m not on the same LAN.

Finally, I''d like to avoid using the Arduino IDE as I find it very limited in
capability.

I believe most of this could be dockerized but let''s keep it simple for now.

On Ubuntu 20.

Installing the Arduino CLI instructions can be found
[here](https://arduino.github.io/arduino-cli/installation/). Brew installs are
available if you''d prefer to use a mac.

```bash
mkdir ~/.local/bin &&
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=~/.local/bin sh
```

Let us also add some additional boards, open the CLI config.

`nano ~/.arduino15/arduino-cli.yaml`

Add the esp boards.

```
board_manager:
  additional_urls:
    - http://arduino.esp8266.com/stable/package_esp8266com_index.json
    - https://dl.espressif.com/dl/package_esp32_index.json
```

Update and install the boards you need.

`arduino-cli core update-index && core install esp32:esp32`

Now if you plug in an ESP32 and run list `arduino-cli board list`

You should see the board.

```
Port         Type              Board Name FQBN Core
/dev/ttyUSB0 Serial Port (USB) Unknown
```

Let us create a new Arduino sketch. `arduino-cli sketch my_sketch`

At this point, I''ve set up my Pycharm IDE to auto-deploy and sync the project
folder over SSH.

Lets make our ESP32 blink

#include "wifi_info.h"

```
int led = 2;

void setup() {
  Serial.begin(9600);
  Serial.println("Stepper test!");
  // initialize the digital pin as an output.
  pinMode(led, OUTPUT);
}

void loop() {
    Serial.println("Stepper high!");
    digitalWrite(led, HIGH);
    delay(1000);               // wait for a second
    Serial.println("Stepper low!");
    digitalWrite(led, LOW);
    delay(1000);               // wait for a second
}
```

Now we have a bash script that checksums our sketch folder and compiles and
uploads our code if anything changes. After which it starts a miniterm session
to listen to the serial console.

```bash
# sh deploy.sh
arduino_cli=~/.local/bin/arduino-cli
SRC="my_sketch"
PORT="/dev/ttyUSB0"
BOARD="esp32:esp32:esp32"
INPUT=""

CHECKSUM_FILE=.checksum

touch $CHECKSUM_FILE
CHECKSUM_SRC=$(grep -ar -e . --include="*.ino" --include="*.h" --include="*.c" $SRC | cksum | cut -c-32)

PREVIOUS_CHECKSUM=`cat $CHECKSUM_FILE`
CHECKSUM="$CHECKSUM_SRC"

if [ ! "$CHECKSUM" = "$PREVIOUS_CHECKSUM" ]; then
    echo "Different checksums building and deploying"
    $arduino_cli compile \
    --fqbn $BOARD \
    $SRC

    $arduino_cli upload \
    --port $PORT \
    --fqbn $BOARD \
    $SRC

    echo $CHECKSUM > $CHECKSUM_FILE
else
    echo "No differences detected running existing binary."
fi

echo "Listening on Port"

miniterm $PORT 9600
```

To call this script over ssh (we could make this into another script if ya catch
my drift) we can run.

`ssh -t -t username@hostname.local "cd ~/code/my_sketch && bash deploy.sh"`

Thats it now we should be seeing the output from the serial port.

```bash
--- Miniterm on /dev/ttyUSB0  9600,8,N,1 ---
--- Quit: Ctrl+] | Menu: Ctrl+T | Help: Ctrl+T followed by Ctrl+H ---
Stepper test!
Stepper low!
Stepper high!
Stepper low!
Stepper high!
...
```
',
        'We learn how we can develop microcontroller code using the Arduino CLI, compile it and the upload our code to the micrcontroller.',
        'developing-on-remote-microcontroller', 1, '2020-06-24',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('550b88dd-9ed9-439b-ac0c-dce3f51b82a2',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Driving a stepper motor with a microcontroller', '

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
', 'Controlling a stepper motor.',
        'driving-stepper-motors-with-microcontroller', 1, '2020-06-16',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('5687da3f-82bb-4710-827b-e108c5767ae8',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Alpine k3s based single node Kubernetes cluster.', '

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
', 'This guide shows how to set up a Kubernetes node with Alpine', 'alpine-k3s',
        1, '2021-02-07', '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('6d480824-5797-42af-bf33-78c547bc794d',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Backing up ZFS snapshots remotely without root access', '
', 'TODO', 'backing-up-zfs-snapshots-remotly-without-root', 0, '2022-08-10',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('72854b20-d2e1-425c-a712-f042cc6c130b',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Multi Arch Docker Buildx in CI/CD', '

I''ve recently been working on some projects with some heavy dependencies
(FFmpeg, scipy, NumPy, etc).

Python Libraries, in particular, take forever to install if a
[wheel](https://pythonwheels.com/) is not available for your OS/Arch
[This](https://pythonspeed.com/articles/alpine-docker-python/) explains why it
takes so long to build on Alpine (not even a different arch).

> Side note: Future Mac''s being ARM-based makes the issue of multi-arch builds
> even more poignant.

For less common platforms eg linux/arm/v6 (pi zero and original pis) or
linux/arm64 some of these builds can take forever and require a dedicated PI (or
a
[emulated VM](/posts/gondola_ansible_playbook_for_emulating_raspberry_pi_os_with_kvm))

#### The Difference is in the logs

To demonstrate this we can look at the buildx logs of a image _based_ on the one
_we will be building_ in this post.

If we later build the image on an arm64 based on our prebuilt multi arch image
we can see it''s building for `linux/arm64`, we can also see it

- already has Pythom FFmpeg
- Installing Pip packages
  - `aionotify` does have a pre built wheel for this arch.
  - `asyncpg` doesn''t have a wheel to download for this arch

The `asyncpg` not having a wheel is what takes so long for different
distributions/architectures.

```bash
 => CACHED [linux/arm64 production 4/5] COPY requirements.txt /app/requirements.txt                                                                                                                                                                                                                                                 0.0s
 => [linux/arm64 production 5/5] RUN apt-get update     && apt-get install -y build-essential     && pip install --no-cache-dir -r requirements.txt && apt-get remove -y build-essential && apt-get auto-remove -y && rm -rf /var/lib/apt/lists/*                                                                                  75.5s
 => => # Requirement already satisfied: python-ffmpeg==1.0.11 in /usr/local/lib/python3.8/site-packages (from -r requirements.txt (line 3)) (1.0.11)
 => => # Collecting aionotify==0.2.0
 => => #   Downloading aionotify-0.2.0-py3-none-any.whl (6.6 kB)
 => => # Requirement already satisfied: pyee in /usr/local/lib/python3.8/site-packages (from python-ffmpeg==1.0.11->-r requirements.txt (line 3)) (7.0.2)
 => => # Building wheels for collected packages: asyncpg
 => => #   Building wheel for asyncpg (setup.py): started
```

## [Docker BuildX](https://docs.docker.com/buildx/working-with-buildx/)

Some notes from the Docker Docs.

> Docker Buildx is a CLI plugin that extends the docker command.... It provides
> the same user experience as docker build with many new features like creating
> scoped builder instances and building against multiple nodes concurrently.

...

> Build multi-platform images BuildKit is designed to work well for building for
> multiple platforms and not only for the architecture and operating system that
> the user invoking the build happens to run. When you invoke a build, you can
> set the --platform flag to specify the target platform for the build output,
> (for example, linux/amd64, linux/arm64, darwin/amd64).

Now to show your how to install BuildX (they say it comes with 19.03 and up but
does not..) we can look at the dockerfile I wrote for a buildx enabled docker
image (to run
[docker in docker](https://www.docker.com/blog/docker-can-now-run-within-docker/))
.

To install locally just run the last two `RUN`''s.

```dockerfile
FROM docker:19.03.10

RUN wget https://github.com/docker/buildx/releases/download/v0.4.1/buildx-v0.4.1.linux-amd64

RUN mkdir -p ~/.docker/cli-plugins && mv buildx-v0.4.1.linux-amd64  ~/.docker/cli-plugins/docker-buildx && chmod a+x ~/.docker/cli-plugins/docker-buildx
```

Source for this can be found on
[Github](https://github.com/ncrmro/docker-buildx) the Docker Image is available
[here](https://hub.docker.com/repository/docker/ncrmro/docker-buildx)

## Automated Builds and Deployment (CI/CD)

### The Dockerfile

Let''s take a super simple example. We want to create an image based on the
standard [python image](https://hub.docker.com/_/python), that comes
preinstalled with [FFMPEG](https://ffmpeg.org/). More so we want to build this
for multiple CPU Architectures, eg amd64 and ARM.

The
[Dockerfile](https://github.com/ncrmro/py-ffmpeg-docker-images/blob/master/Dockerfile)
looks like this an automatically handles cleaning up dependencies. This file
could have a few layers, but it''s the same dockerfile I use for all my Debian
based python docker images.

```dockerfile
ARG BASE_IMAGE=python:3.8.5-slim-buster
FROM $BASE_IMAGE as base
WORKDIR /app
ENV PYTHONPATH "${PYTHONPATH}:/app"

##
# Install any runtime depenencies here
ENV RUNTIME_DEPENDENCIES="ffmpeg"

RUN apt-get update \
    && apt-get install -y $RUNTIME_DEPENDENCIES \
&& rm -rf /var/lib/apt/lists/*

ENV BUILD_DEPENDENCIES="build-essential"

COPY requirements.txt /app/requirements.txt

# Install any build dpendencies depenencies here
RUN apt-get update \
    && apt-get install -y $BUILD_DEPENDENCIES \
    && pip install --no-cache-dir -r requirements.txt \
&& apt-get remove -y $BUILD_DEPENDENCIES \
&& apt-get auto-remove -y \
&& rm -rf /var/lib/apt/lists/*
```

### The CI config file.

I''m using a self-hosted Drone CI server and runners. This example could easily
be switched to anywhere you can enable an experimental docker _server_. Note at
the bottom we use docker in docker.

The
[.drone.yml](https://github.com/ncrmro/py-ffmpeg-docker-images/blob/master/.drone.yml)
file looks like this (a few changes to only show the important parts).

```yamlex
kind: pipeline
name: default

environment:
  DOCKER_HOST: tcp://docker-in-docker:2375
  DOCKER_CLI_EXPERIMENTAL: enabled

steps:
- name: Docker Information
  image: ncrmro/docker-buildx:19.03.10
  environment:
    DOCKER_USERNAME: ncrmro
    DOCKER_PASSWORD:
      from_secret: dockerhub_access_token
  commands:
  - docker version
  - docker buildx version
  - echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  - docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
  - docker buildx create --name multiarch --use
  - docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7,linux/arm/v6 -t ncrmro/py-ffmpeg-docker-images:latest -t ncrmro/py-ffmpeg-docker-images:1.0.11 -t ncrmro/py-ffmpeg-docker-images:$DRONE_COMMIT_SHA --push .

services:
- name: docker-in-docker
  docker:
  image: docker:19.03.12-dind
  command: ["dockerd", "--host", "0.0.0.0", "--experimental"]
  privileged: true
```

Also note we

- started `qemu-user-static` This is what emulates our different cpu
  architectures.
- created a builder and seet it as the active builder
- created three image''s, `latest`, `python FFmpeg ver`, `git sha`

Hope you enjoyed the post
', 'Automated Multi Arch Docker Image Builds', 'multi-arch-docker-buildx-ci-cd',
        1, '2020-08-14', '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('75b9cb52-efe2-41e9-bc85-adbcf2bfed34',
        'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Apollo Cache Overview', '

If your using [Apollo](https://www.apollographql.com/docs/)
[GraphQL](https://graphql.org/) and you''ve not yet looked at the
[Apollo Cache](https://www.apollographql.com/docs/react/caching/cache-configuration/)
object in your app I would highly recommend getting familiar with it. As you may
not be getting the benefits of caching as you thought, which I didn''t catch
until working with
[Graphql Mutations](https://graphql.org/learn/queries/#mutations).

In this post, we will cover a few aspects of the Apollo cache.

- [Unique Identities](#unique-identities)
- [Accessing the Cache](#accessing-the-apollo-cache)
- [Testing the Cache](#testing-the-cache)
- [Updating Cache after Mutation](#updating-cache-after-mutation)
- [Full Cache Example](#a-more-fleshed-out-cache-example)
- [Further Reading](#other-parts-of-the-apollo-cache-not-covered-here)

---

### Background

In this case, while working on [JTX](https://jtronics.exchange/) I was trying to
show a list of user parts, then creating a new used part which should then be
reflected in the [React](https://reactjs.org/) frontend.

After taking a look at your GraphQL cache you might find things are not being
cached, this is because you need to explicitly request ids for every object and
in your mocks you will need to remember to apply the `__typname` field.

When testing Mutations modifying the cache or what the cache should look like
during testing it''s best to extract the cache in testing and compare with the
cache in your application.

---

## GraphQL Caching

[This article](https://www.apollographql.com/blog/demystifying-cache-normalization/)
by [Khalil Stemmler](https://khalilstemmler.com/) on the official Apollo Blog
goes much more in-depth into how the Apollo GraphQL cache works by implementing
cache normalization.

An Apollo cache is simply an object!

## Unique Identities

Each of the keys is the GraphQL cache is `__typename` + the `id`
([uuid](https://en.wikipedia.org/wiki/Universally_unique_identifier) in this
case) this is the object''s Unique Identifier in your cache.

```json
{
  "Part:97cfac8a-a4b4-48d0-ba12-901cf474e7e4": {
    "id": "97cfac8a-a4b4-48d0-ba12-901cf474e7e4",
    "__typename": "Part",
    "category": "GPU",
    "name": "EVGA NVIDIA 3090 RTX 24GB",
    "slug": "evga-nvidia-3090-rtx-24gb"
  }
}
```

---

## Accessing the Apollo Cache

Throughout your app, you can access the cache object you initially passed into
your Apollo client. This can be at any point extracted and be inspected.

```typescript
import { client, cache } from "../utils/apollo";

client.extract();

cache.extract();
```

## Testing the Cache

Here we can demonstrate using running a snapshot on the extracted snapshot. We
could do all sorts of additional assertions but more than anything the snapshot
gives us a quick visual inspection and then again on any git commits.

```typescript jsx
describe("ViewerPartsRoute", () => {
  beforeEach(() => {
    cache = new InMemoryCache();
    page = render(
      <MockedProvider mocks={graphqlMocks} cache={cache} addTypename={true}>
        <ViewerContext.Provider value={Viewer}>
          <ViewerOwnedPartsPage />
        </ViewerContext.Provider>
      </MockedProvider>
    );
  });
  it("should query with cache", () => {
    await waitFor(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(cache.extract()).toMatchSnapshot(
      "cache should have a viewer parts query"
    );
  });
});
```

---

## Custom Cache Key

In some cases we would rather not cache based on a unique ID, In my case, we
build the Next app in CI so that each statically rendered page (like a
[part category page](https://jtronics.exchange/parts/cpu)) contains a hot cache
for that page. Since we do this with a fresh database rather than putting a load
on the production database, this leads to different cache keys (uuids) on the
statically generated page vs when the client makes a query.

Luckily we store another unique key in our database which is the Part slug that
we use in our urls!

```typescript
import { InMemoryCache } from "@apollo/client";
new InMemoryCache({
  typePolicies: {
    Part: {
      keyFields: ["slug"],
    },
  },
});
```

Now our cached part looks like this

```json
{
  "Part:{\"slug\": \"evga-nvidia-3090-rtx-24gb\"}": {
    "id": "97cfac8a-a4b4-48d0-ba12-901cf474e7e4",
    "__typename": "Part",
    "category": "GPU",
    "name": "EVGA NVIDIA 3090 RTX 24GB",
    "slug": "evga-nvidia-3090-rtx-24gb"
  }
}
```

### Cache Access in Mutations

Mutations when creating or deleting nodes don''t automatically update the cache
and thus you can specify an
[update function](https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates)
on the
[Mutation options](https://www.apollographql.com/docs/react/data/mutations/#options).
We cover this more [further down](#updating-cache-after-mutation)

```typescript
const update = (cache, { data: { createOwnedPart } }) => {
  console.log("EXISTING CACHE", JSON.stringify(cache.extract()));
};
```

---

## A more fleshed out Cache example

In our case the Viewer object is always based on the JWT token found in the
GraphQL requests header, we can see that the viewer object on the `ROOT_QUERY`
points to the key `USER:uuid` which then has a few other objects on it. Notice
the viewer query it actually pointing to a GraphQL User:uuid object.

```json
{
  "User:e1e5989c-37f5-42e8-85d1-06ea6de5f29b": {
    "id": "e1e5989c-37f5-42e8-85d1-06ea6de5f29b",
    "__typename": "User",
    "systemsByOwnerId": {
      "__typename": "SystemsConnection",
      "nodes": [
        {
          "__ref": "System:8dd2bcf4-d722-4d10-9aa5-14300ec86186"
        }
      ]
    },
    "ROOT_QUERY": {
      "__typename": "Query",
      "viewer": {
        "__ref": "User:e1e5989c-37f5-42e8-85d1-06ea6de5f29b"
      }
    }
  }
}
```

We can see a more full interconnected cache here.

```json
{
  "System:8dd2bcf4-d722-4d10-9aa5-14300ec86186": {
    "id": "8dd2bcf4-d722-4d10-9aa5-14300ec86186",
    "__typename": "System",
    "name": "Test User''s Backup System"
  },
  "User:e1e5989c-37f5-42e8-85d1-06ea6de5f29b": {
    "id": "e1e5989c-37f5-42e8-85d1-06ea6de5f29b",
    "__typename": "User",
    "systemsByOwnerId": {
      "__typename": "SystemsConnection",
      "nodes": [
        {
          "__ref": "System:8dd2bcf4-d722-4d10-9aa5-14300ec86186"
        }
      ]
    },
    "ownedPartsByOwnerId": {
      "__typename": "OwnedPartsConnection",
      "nodes": [
        {
          "__ref": "OwnedPart:39a336d6-188f-4589-8d31-fa0455b47be1"
        }
      ]
    }
  },
  "ROOT_QUERY": {
    "__typename": "Query",
    "viewer": {
      "__ref": "User:e1e5989c-37f5-42e8-85d1-06ea6de5f29b"
    }
  },
  "Part:97cfac8a-a4b4-48d0-ba12-901cf474e7e4": {
    "id": "97cfac8a-a4b4-48d0-ba12-901cf474e7e4",
    "__typename": "Part",
    "category": "CPU",
    "name": "Intel Pentium G3470",
    "slug": "intel-pentium-g3470"
  },
  "OwnedPart:39a336d6-188f-4589-8d31-fa0455b47be1": {
    "id": "39a336d6-188f-4589-8d31-fa0455b47be1",
    "__typename": "OwnedPart",
    "partByPartId": {
      "__ref": "Part:97cfac8a-a4b4-48d0-ba12-901cf474e7e4"
    },
    "systemBySystemId": null
  }
}
```

In this way, we end up only ever keeping one copy of the actual object around
and every other GraphQL node in the cache references that cache key. This stops
bloat but also means any components that are using that object automatically
update if we need to make a Mutation.

---

## Updating Cache after Mutation

Mutating a node that already exists in the cache will automatically update it.

Adding a new node to our viewer''s OwnedPartConnection is a little trickier. This
means the new part is in our cache but doesn''t show up on the page because the
original Viewer Part Connection on our Viewer part Query in our Cache hasn''t
been updated.

To Demonstrate courtesy of [JTX](https://jtronics.exchange/account/parts).

PS. apologies for the scaling of the video feel free to zoom in for now!

<Image src="mutation_example.gif" alt=''Demonstrating the Mutation Updating the Apollo Cache''  />

We can see the cache has a few items,

- one of which is the Viewer/User which contains our OwnedParts connection which
  has two objects in it,
- once we perform our part search those are then loaded into the cache.
- After performing the mutation the cached viewer Owned Part connection should
  have three items in it
- a new card should appear in the frontend

```typescript
const update = (cache, { data: { createOwnedPart } }) => {
  // First we find the original query we made in the cache.
  const data = cache.readQuery<ViewerPartsQuery>({
    query: ViewerPartsDocument,
  });

  // From that we can get the reference of the viewer in the cache
  const viewerRef = cache.identify({
    __typename: "User",
    id: data.viewer.id,
  });

  // The mutation already added the new viewer part
  //let''s get a reference to the new viewer part.
  const newViewerPartRef = cache.identify(createOwnedPart.ownedPart);

  // we update the viewer object in our cache
  // on ownedPartsByOwnerId nodes  field we include the new viewer part refrence.
  cache.modify({
    id: viewerRef,
    fields: {
      ownedPartsByOwnerId: (existingCommentRefs) => ({
        nodes: [...existingCommentRefs.nodes, { __ref: newViewerPartRef }],
      }),
    },
  });
};
```

## Other Parts of the Apollo Cache not covered here.

- [Setting Fetch Policy](https://www.apollographql.com/docs/react/data/queries/#setting-a-fetch-policy)
- [Cursor Base Pagination](https://www.apollographql.com/docs/react/pagination/cursor-based/)
- [Cache Key Args](https://www.apollographql.com/docs/react/pagination/key-args/)
- [@connection directive](https://www.apollographql.com/docs/react/caching/advanced-topics/#the-connection-directive)
- [Resetting the cache](https://www.apollographql.com/docs/react/caching/advanced-topics/#resetting-the-store)
', 'What is the Apollo cache, ensure correct usage and update post mutation.',
        'apollo-cache-overview', 1, '2021-01-02', '2023-08-04 14:16:13',
        '2023-08-04 14:16:13'),
       ('77e118f4-2a13-4f01-b054-e495782ab829',
        'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Gondola', '

Recently I was working a project that is deployed on a raspberry pi zero. This
became problematic with trying to build stuff on the zero.

It''s pretty simple, check the repo out. Install ansible and the rest of the pip
requirements.

`pip install -r requirements.txt`

Then run `sh main.sh` this will take a few minutes.

After running the Ansible play you''ll have a PI that you can clone, revert etc.

The project is available [here](https://github.com/ncrmro/gondola).

## Some updates jul 29 2020

Some limitations is its single threaded and limited to 256mb of ram and I
haven''t had enough time to investigate.
', 'Ansible Playbook for Emulating Raspberry Pi OS with KVM',
        'gondola-ansible-playbook-for-emulating-raspberry-pi-os-with-kvm', 1,
        '2020-07-22', '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('8dbc714d-89f7-4e05-919c-fcb13959375a',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Building a Enum Based Form Stepper In React Typescript', '

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
', 'We look at a streamlined form stepper design pattern.', 'typescript', 1,
        '2021-01-18', '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('8f6e42cc-866d-4757-b946-30be6f51b365',
        'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Last Vegas Evo 2022', '
', 'TODO', 'las-vegas-evo-2022', 0, '2022-08-08', '2023-08-04 14:16:13',
        '2023-08-04 14:16:13'),
       ('96141f1f-58e1-4390-b039-c911de72c686',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Summertime Adventure in New Orleans', '

## Background - Friday, July 15, 2022

While coworking with my friend Andy at EQ a coffee shop in the Heights he was
telling me about a trip to Chicago he was planning to calm some mental
turbulence.

With a craving for wanderlust, I inquired about joining the journey. It was
decided to leave the next morning, the departure took place after lunch at
Govinda''s.

## Getting Into New Orleans - Saturday, July 16, 2022

The trip was uneventful with the only notable stop being Lake Charles. We found
our way to an [AirBnB](https://www.airbnb.com/rooms/10068423) we booked unloaded
the car, put on some fabcuer clothes and went on the hunt for dinner.

### Dinner at [Cafe Carmo](http://cafecarmo.com)

<Image src="IMG_0579.jpeg" alt=''Plates of food a cafe carmo''  />

Cafe Carmo had a nice mix of vegan (Andy is vegan) and non-vegan options. The
menu was comprised of all sorts of Latin American drinks and dishes.

I had the Rico which had boar (pulled pork almost) on top of grilled plantains.
We also shared a vegan flatbread with cheese and other goodies. For cocktails
Andy ordered a Cajarita which felt like a bit of a play on a margarita and I
believe I had a Caipirinhas, both very refreshing drinks perfect for the summer
or a beach.

After the meal, we talked with the bartender and the two other waitresses. The
bartender had just moved from Portland and one of the other waitresses was from
Turkey!

I jokingly asked had the Portlander already made questionable decisions in Heras
and the Turkish lady laughed and told us how she was super up and then lost a
bit of money.

We enjoyed our jib on the way back to the car and did a bit of driving to get to
the [Allways Lounge](https://theallwayslounge.net) which we couldn''t get into
because we where missing one of our wallets.

## Sunday

initially, the plan was to keep driving but quickly realized we had a ton of
stuff (and work) left to see and booked another day

Sunday we started the day by getting lunch at [Ital Garden](italgardennola.com)
which was proper vegan soul food. We ordered just about everything on the menu.

<Image src="IMG_0586.jpeg" alt=''Plates of food a ITal''  />

- Cajun Pasta
- Quona Jumbala
- Gumbo
- Fried Cauliflower
- Golden Potatoes
- Jackfruit Ribs

### French Quarter and Jackson Square

<Image src="IMG_0597.jpeg" alt=''Andy taking a photo in the french quarter''  />

<Image src="IMG_0599.jpeg" alt=''The a street in the French Quarter''  />

After lunch, we were on the hunt for coffee and a place to work.
[CC''s coffee house](https://www.ccscoffee.com) on Royal street is where we had
originally planned to visit.

I mentioned that Andy had to do a bit of walking around the French Quarter and
more specifically
[Jackson Square](https://www.neworleans.com/listing/jackson-square/32150/) .

Quickly though we found the heat to become unbearable as we both wore jeans and
button-ups (which I suggested against, but became appreciated later).

We had hoped to find a nice place to get a coffee and do some work but
eventually, the original destination CC''s Coffee house seemed like a better
idea.

### Coffee Shop, Hookah, Locals and The Argentinans

While in CC''s I offered a dad who had been mentioning his phone was dead while
his daughter used the bathroom. This is when two beautiful ladies walked in and
sat at the same table as me.

I asked them had they already done all the touristy things which they had and
were relaxing until their plane ride home that night? Turns out they are both
from Argentina and met through an agency that places young women with families
in need of live-in help.

Three more women walk up to the table and start a conversation (and they also
were in need of phone charging).

After learning they are locals, we ask about Hookah places and they suggest
[Haifa](https://haifacusinenola.com). We all decided to go, we get a bucket of
beer, and snacks while enjoying some hookah.

We then ask if they smoke at lake Pontchartrain near our Airbnb.

The walk along the river has us admiring the people fishing, baby ducks,
throwing fish back in the water, and even had Andy show us how to dance Salsa to
one of the fishers boomboxes.

Afterward, we go to a bar near their hostel and they split and I notice a guy
with chef knives. We split after this

## Monday

Again we decide to stay in New Orleans and do some work.

### Breakfast at the [The Vintage](http://thevintagenola.com) in the [Garden District](https://www.neworleans.com/plan/neighborhoods/uptown-garden-district/)

<Image src="IMG_0619.jpeg" alt=''The Bar at the Vintage''  />

<Image src="IMG_0620.jpeg" alt=''Beignets at the Vintage''  />

The local ladies we met previously recommended Beignets from the Vintage.

We ordered a traditional and a raspberry-filled beignet which both were amazing.
I also ordered some egg bites. Andy amusingly couldn''t take a bite without
inhaling powdered sugar.

The espresso machine stopped working after our first order of coffee, I always
wonder if this happens to stop people from spending all day working. I saw they
had cucumber dill gimlet (I love gimlets) and ordered one with Ahi tuna which
was an amazing protein snack.

### Lunch [Killer Po Boys](http://www.killerpoboys.com/)

<Image src="IMG_0626.jpeg" alt=''Po Boys at Killers''  />

After this Andy had not eaten and I had to make sure he had a Po Boy before
leaving New Orleans. He had a Thai BBQ po boy and I had the beef which had
pickled green beans and horseradish and was quite tasty.

Then we had to get a Po Boy for Andy and Killer Poboys had three vegan options.

### Mid Afternoon - Working at the [Irish Cultural Museum](https://www.neworleans.com/listing/the-irish-cultural-museum-of-new-orleans/30407/)

<Image src="IMG_0639.jpeg" alt=''A glass of Guiness, Powers Whisky Bottle and glass of Whisky''  />

Andy found a coffee shop inside the Irish Cultural Museum. Fun fact in 1800s New
Orleans the Irish population was 1 in 5. The Irish coffees are said to be great,
though we didn''t want to start drinking so early.

I chatted with the bartender about tasting a reasonable whisky. My friend Chuck
said he wanted to try [Red Breast](https://www.redbreastwhiskey.com/) but they
only had 123 and 173 a glass.

After he listened to my preferences (less sweet, no fancy barrels) he
recommended a
[Prowlers John''s Lane Pot still](https://www.powerswhiskey.com/en-us/product/johns-lane)
and a pint of [Guinness](https://www.guinness.com/). He told me this pairing of
flavors was something they would be drinking 150 years ago in Ireland. I spoke a
bit about my Mexican Irish heritage and he told me all about the name Irish
Mexicans.

While I was waiting for him to finish I walked next door and ordered a double
well whisky at the
[Three-Legged Dog](https://www.neworleans.com/listing/three-legged-dog/33371/) ,
a much seedier local bar that had quite the cast of characters in it.

### Dinner [Sneaky Pickle](https://www.yousneakypickle.com/)

Almost everyone we asked for vegan options recommended Sneaky Pickle and finally
got to try it. We talked to two ladies at a neighboring table who were from
Seatle for one of their weddings.

- Smoked tempeh Reuben (with a gorgeous red cabbage saukrat) with fries
- A sort of Trumpet Mushrooms on grits
- Mac n Cheese

The lady next door left a whole half sandwich which we grabbed and ate without
shame.

### Evening [Frenchman Street](https://www.neworleans.com/plan/streets/frenchmen-street/)

<Image src="IMG_0654.jpeg" alt=''Andy Pointing at the Frenchman Inn Sign''  />

At this point, Andy still wanted to see some Jazz. And to be honest, at this the
point I don''t think I''ve taken full advantage of the music scene in my previous
excursions.

We walked through a market and stopped outside a few places until we settled in
on [The spotted cat](https://www.spottedcatmusicclub.com/) which had
[The Frenchman Street All-stars](https://www.louisianamusicfactory.com/product/dominick-grillo-the-frenchmen-street-all-stars/)
doing an amazing job.

## Tuesday

Tuesday I started the morning and walked to Waffle House .7 miles away as Andy
is a breakfast person.

### Morning Downtown NOLA

After that, we went ahead and being our working day at
[Breads on Oak](https://www.breadsonoak.com/), which was sort of an entertaining
place to work as it''s downtown surrounded by hotels so lots of opportunities to
do people watching.

For lunch, we walked over to [Shangia Thai](http://singhathai-cafe.com/) Lunch,
Garlic Softshell Crab and pad la.

### Afternoon [Old World Coffee](https://oldroadcoffee.com/)

At Old World, I met a fellow Houstonian
[Mark](https://linktr.ee/marktwilliamsii) who now lives in NOLA. He wrote two
books that I skimmed and were quite poetic. He mentioned two art shoes which
were also going to be giving away bags full of art supplies to youth who need
them the most.

### A long drive home

At this point, Andy had to get back to Houston and we decided to start the
journey home.

On the way we stopped for a quick bite at a Lousianin/Mexican restaurant called
Mestizo. The Server recommended guac which had grilled peaches and feta, quite
the odd combo but was pretty tasty. They mentioned that they also do it with
pomegranate arils which I think would be quite visually stunning.
', 'Visiting New Orleans with my friend Andy',
        'summertime-adventure-new-orleans', 1, '2022-07-16',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('9d5ee3f7-b7f5-4729-9625-3bdf7dfbc41f',
        'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Getting your Heart in Redzone', '

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
', 'How to train for Vo2 max using the Apple Watch.',
        'vo2-max-training-with-apple-watch', 1, '2022-11-20',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('a28ab496-58f7-4375-8f0f-cdc73890ee21',
        'ca55d247-66e2-4346-b130-06c2d5a7c826', 'New site stack', '

The new site was created using
[react-static](https://github.com/nozzle/react-static). It reads the contents of
the post directory which contain
[markdown](https://en.wikipedia.org/wiki/Markdown) files. The code its
automatically pushed to [Netlify](https://netlify.com).

Netlify builds the project and then informs [sentry](https://sentry.io) of a new
build and release. Sentry gives us insites into errors that occur in our code
base.

Getting Sentry to recognize the repo to link commit history to was a pain but
should real useful in future projects. Uploading site maps was relatively easy.

One thing i''m actually working on as I type is the metadata related to this post
is markdown meta data. As usual I used my favorite tool regex to extract the the
markdown meta data. This uses the
[YAML section markers](https://stackoverflow.com/questions/44215896/markdown-metadata-format)
and we parse out various metadata.

```markdown
---
layout: post
title: New site stack
description: We take a look at the process and technology behind this site.
datePosted: 3/9/2019
---

The new site was created using...
```

The goal was to have an extremely customizable blog I can write markdown in and
make any customizations I like easily while having zero worries about
maintenance.

The source code for the site can be found on Github here
[here](https://github.com/ncrmro/ncrmro-static).
', 'We take a look at the process and technology behind this site.',
        'new-site-stack', 1, '2019-03-10', '2023-08-04 14:16:13',
        '2023-08-04 14:16:13'),
       ('a733da87-ed78-40ad-bd4d-66e707f9834e',
        'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Contemplating Dunning-Kruger.', '

I''ve been contemplating
the [Dunning-Kruger effect](https://en.wikipedia.org/wiki/Dunning–Kruger_effect)
.

> The Dunning–Kruger effect is a cognitive bias whereby people with low ability,
> expertise, or experience regarding a certain type of task or area of knowledge
> tend to overestimate their ability or knowledge. Some researchers also include
> in their definition the opposite effect for high performers: their tendency to
> underestimate their skills.

This idea boils down to the fact that I''m knowledgeable in a very few specific
niches
and in many other silos prob not the best.

Furthermore, I think the more we loathe something the more likely we are to
overestimate
our ability and thus show more carelessness to that specific topic.

For instance, I bought a house for all the typical reasons but also as an
investment. Later though I learned that I prefer a digital nomad lifestyle. And
thus this
investment has turned out a be a bit of a headache. I''m not a great home seller,
more
because I loath the home and thus want to think about it as little as possible.

Or in a common case engineers love to build a startup but may not know they should
be validating it first and building it''s brand.

## An Analogy

An analogy for the feeling I was having while contemplating the Dunning Kurgger
the effect is as follows.

Every person gets a view of the same stage but we are
all viewing the performance with different lights on and off.

Thus each person has a specific view of a situation such as business or
interpersonal relationships etc.

The anxiety I felt though is as successful as I''ve been, I''ve allowed myself to
drift from
my main goals (Successful Business/Financial Freedom/Art) which I now realize
maybe because I lack the knowledge and insight to
make these dreams and goals a success (although things like chance still play
into this).

### A solution in our analogy

The goal here would be increasing you''re IQ/EQ/Knowledge resulting in more
illuminated lights on stage, we could also think about each light or field of
thought/knowledge
to be brighter the higher percentile performer you are but never quite covering
lesser lights.

## On increasing the stage lights.

Now this contemplation in me lead to a bit of anxiety. Figuring out

### Short Form Read and Writing

I''d have to say short-form learning through reading or media consumption (think
Twitter or TikTok)
does not lead to critical thought and is more passive consumption or
regurgitation of ideas.

### Long-Form Reading

One activity successful people have is reading. Getting into this mindset
allows our brain to slow down and digest complex ideas
in a way that doom scrolling and manic switching between social media apps
doesn''t allow for.

### Long-Form Writing

Lastly, I think communication of ideas in the modern world such as tweets,
Facebook posts, Instagram stories/posts and TikTok, etc do not serve in illuminating
our stage.

Each idea is condensed to its most myopic form and then thrown
into a blender for our consumption leading us to bounce between echo chamber rooms
of thought without ever forming any novel ideas.
',
        'I''ve been contemplating the Dunning-Kruger effect and it''s caused a bit of anxiety. ',
        'contemplating', 1, '2022-12-13', '2023-08-04 14:16:13',
        '2023-08-04 14:16:13'),
       ('addde3a1-9765-43cb-8970-668d03c27ae8',
        'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Typescript React Grid Areas', '

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
',
        'A Reusable Component Design Pattern for CSS Grid Areas in Typescript React.',
        'typescript-react-grid-areas', 1, '2020-12-17', '2023-08-04 14:16:13',
        '2023-08-04 14:16:13'),
       ('bfec772e-e472-41fa-93e6-3d1d77c89f27',
        'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Project Quiescent', '

I''ve had this idea for awhile of a personal website where files exist first and
foremost as documents committed to a repo rather than a database.

Currently this blog was the initial catalyst for this project. I''ve acheved the
tech but the experience of writing posts is still cumbersome.

I started with an
[shell script](https://github.com/ncrmro/ncrmro-static/blob/4c1573fc0573049b8788ff4385d51bd374d92cea/new_post.zsh)
that generates the markdown for me with todays data, title, slug and a
description.

Without all the variables being initialized the main bit is bellow

```bash
cat <<EOT >> $posts_dir/$post_file_name
---
slug: $post_title_slug
title: $post_tile
date: ''${current_date}''
description: CHANGEME
tags: [''CHANGEME'']
---
Hello World
EOT
```

# Current Pain Points about existing workflow

- Prettier always messes up the post attribute
- Adding pictures is awkward
  - Galleries is even harder
-

### Posts

- Markdown Files
- Full React file
  - Style pictures and other media how ever you like

#

The big paradigm here is the frontend can operate both locally and remotely on a
git repository introducing changes

##

The hard part has been getting the thing working

## Following the Graph back out of the post

Eg how can we have the blog post show case conversations on twitter about it
without knowing about it''s creation

Using analytics and other services
',
        'A new project i''m working on to build better blogs that live inside of git.',
        'quecent', 1, '2022-07-27', '2023-08-04 14:16:13',
        '2023-08-04 14:16:13'),
       ('c46e5535-0aa9-4cfd-976e-be943c842882',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Choosing the best multi-OS setup with PCIe device passthrough', '

## Why have bare-metal hypervisor Linux workstation

- Choose your hardware
- Free and opensource OS
- Easily experiment with other OS
  - Can be transferred to new hardware without re-activating
- Windows Guest
- PCIe Passthrough
  - Pass an entire device like a GPU into a guest VM for near baremetal
    performance.

In this post, I will attempt to outline a few ways to run multiple OS''s on a
single workstation host but also use the hardware for other tasks such as
passing the GPU into a VM for gaming and machine learning workloads,

- Multiple OS installed as root and choice is selected at the bootloader (system
  startup).
- Linux Desktop OS installed with two graphics cards, two USB chipsets each
  going into a KVM switch.
- Minimal Server OS installed with GPU and USB chipsets reallocated at guest
  boot.
- Linux Desktop OS installed as Workstation with GPU and USB chipsets
  reallocated at guest boot.

As a note, it is significantly easier to have a Linux desktop environment (could
be a VM) to run [`virt-manager`](https://virt-manager.org/) which is a GUI to
manage KVM VM''s.

## Multiple root OS''s

The original the one we know and love.

## Linux KVM baremetal hypervisors

[KVM](https://en.wikipedia.org/wiki/Kernel-based_Virtual_Machine) (Kernal-based
Virtual Machine) allows the Linux kernel to act as a
[hypervisor](https://en.wikipedia.org/wiki/Hypervisor) which can create and run
[virtual machines](https://en.wikipedia.org/wiki/Virtual_machine).

One of the neat things we can do is choose PCIe devices not in use by the host
os to pass into a virtual machine to get near bare metal performance. Later in
this post, we will discuss how to reallocate devices that are already in use by
the host OS.

Additionally, we can easily transfer an activated Windows Guest VM between
computers without having to reactivate.

### Linux Desktop OS with KVM Switch

My first successful foray into PCIe passthrough into a guest VM had a
[i5 4790k](https://www.intel.com/content/www/us/en/products/sku/80811/intel-core-i54690k-processor-6m-cache-up-to-3-90-ghz/specifications.html)
which contained an iGPU and a
[770 GTX](https://www.nvidia.com/en-us/geforce/graphics-cards/geforce-gtx-770/specifications/).

The KVM switch used is made by [Black Box](https://www.blackbox.com).

In this configuration our KVM switch which is typically used to share a
keyboard, mouse, and monitor between multiple computers is instead used to have
a video, sound, and USB cable (keyboard and mouse) split between two GPU''s/USB
chipsets.

- Dedicated GPU has drivers blacklisted on boot typically to avoid host OS
  attaching
- KVM switch can be expensive, extra wires (three display/USB cables)
- Needs two GPU''s as well as two USB chipsets on the motherboard
  - Note\* having a dedicated PCIe based USB chipset also passed into the VM is
    the best option here is if your going to also plug in a Bluetooth dongle.
  - Alternatively, the entire Bluetooth chipset can be passed to guest for the
    best controller performance.

### Minimal Linux Server OS, Single Dedicated GPU (no iGPU) with Guest VM''s

At the time of writing this post is being typed on the following setup. The
hardware chosen was a
[AMD Ryzen 7 5800X3D](https://www.amd.com/en/products/cpu/amd-ryzen-7-5800x3d)
(one of the first CPU''s to feature 3D cache) which does not come with an iGPU,
furthermore I choose a mini ITX case
[Louqe Raw S1](https://www.louqe.com/portfolio/raw-s1/) and motherboard (one
PCIe slot) paired with a
[3080 RTX Ti](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3080-3080ti/).

Essentially as much power as one can fit into the smallest space possible.

In this scenario, we install a minimal OS like Ubuntu server for the host OS.
The novel idea here is that we use KVM hooks to mount and unmount hardware
during the lifecycle stages of a guest VM.

The flow after the host VM is booted and we are in the terminal logged in as the
root user is we would type `virst start gamevm`.

This c

- Host OS is kept super clean with minimal amount of dependencies.
  - This allows us to try out multiple linux distributions quite easily
- By default the entire system never goes to sleep nor does the monitor sleep if
  GPU is attached to host OS
- Guest also don''t ever quite go to sleep as nicely as one would like.
- Host OS only has a root account, disk is unencrypted.
  - Having this disk unencrypted allows us to remotely (re)start the host using
    WoL magic packets
  - Guest VM''s can manage their own disk encryption.

### Desktop Linux OS (Workstation)

This I think is the best solution for a true Workstation and what I think my
next iteration will be. While I don''t like the idea of having a hypervisor OS
cluttered with dependencies I think this provides us with a more
workstation-like setup that can also be used for gaming.

- Boot directly to a Desktop environment
- Prometheus Metrics/Temp Hardware etc are more directly accessible

Unknowns

- When shutting down the host what happens to VM''s that are suspended but still
  have a GPU is attached.
',
        'In this post I discuss my experience with my Linux workstations that use a technology called PCIe passthrough to use a dedicated GPU for gaming in a Windows Guest.',
        'choosing-the-best-multi-os-setup', 1, '2022-12-21',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('c7841ff3-7c3b-43d0-938f-6663bb72c44f',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Learning network security with IoT/HomeKit.', '

## It started with [HomeKit](https://www.apple.com/ios/home/).

When I started writing this post I was evaluating weather or not to start buying
home kit smart gear. Mostly simple things like turning lights on and off with my
phone. I found out you need
["home hub"](https://support.apple.com/en-us/HT207057) which works out to a
newer Apple tv, Home Pod, or IPad you always have at home.

## Ubiquity, Subnets and Firewalls

Getting back to Ubiquity''s Unifi gear. At the moment I have a Google fiber''s
router plugged into a Ubiquity secuirty gateway, thats plugged into a inline POE
adapter that feeds the network switch and which powers a access point. I had
been wanting to start digging into networking more. I''ve often find myself
saying the networking is usually a skill most developers could use a little
brushing up on.

To get the most out of Ubquitiy I believe it''s pretty much required to have a
unifi controller. I have mine hosted on a ubuntu vm. It''s one of this things
that I believe it''s better to set up following their instructions for a specific
os version than a homebrew docker container. I''ve personally experienced exotic
networking bugs before like syslog packets not combing in.

## The guest network

First thing I did was set up separate subnets, ubiquity has a few different
network types with varying firewall config profiles. One is a guest network.
Which by the way you can now tell your iOS devices to not automatically connect
to certian wifi networks, but keep the wifi password in your keychain. This lets
you share your guest network password easly using the iOS wifi password sharing
feature.

By default the guest network does not allow any connections other that to the
WAN, this is nice your smart tvs like Roku where you dont want them
[snooping on](https://www.reddit.com/r/YouShouldKnow/comments/97an7p/ysk_roku_hardware_is_collecting_and_sharing/?depth=1)
your network Traffic.

## Subnets for everyone.

So we have the default network which becomes the Management Network/VLAN all the
devices talk to each other on. Since my Unifi controller is a VM on bridge mode
I expierenced some dificulty getting everything moved to a newly created
managment VLAN. This is why we keep the orginal LAN as Managment and created a
new LAN network.

We also create a network for homekit/IoT. Each network is tagged with a VLAN.
Most of the networks will then be associated with their respective network and
VLAN tags. We splits the homekit network between 2 and 5 GHz because some
devices do not support 5.

## Firewall

At this point the network isn''t completely hygienic. That is because VLAN''s
while ideally are secure they shouldn''t be thought as air tight by default.

A good rule of thumb is default deny every thing on LAN in and make a groups if
Staticlly assigned IPs access. I followed
[this](https://community.ubnt.com/t5/UniFi-Routing-Switching/HomeKit-on-Isolated-VLAN/m-p/2263456/highlight/true#M79654)
post orginally which covers setting up homekit. I just made it where my phone,
laptop, and desktop I remote into are admin devices which can access anything.
', '"How setting up IoT/HomeKit can teach you about network security."',
        'how-homekit-led-to-learning-about-network-security', 1, '2019-04-15',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('ca683406-9fbe-49c2-8260-cac9ab26c4aa',
        'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Hello World - 2019', '

A simple blog post to test the codebase this site is built on.
', 'A simple blog post to test the codebase this site is built on.',
        'hello-world-2019', 0, '2019-03-07', '2023-08-04 14:16:13',
        '2023-08-04 14:16:13'),
       ('d40b8737-8558-40e3-97e8-298da7de7009',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'Building a scheduled CI E2E test failure Slack notifier', '

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
', 'How to build a Slack notifier when scheduled E2E tests fail.',
        'scheduled-ci-e2e-test-failure-slack-notification', 1, '2021-03-24',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('eef3187f-27dd-4739-9696-e7162b7f212f',
        'ca55d247-66e2-4346-b130-06c2d5a7c826', 'MacOS fast user switching.', '

[Fast user switching](https://en.wikipedia.org/wiki/Fast_user_switching)

[Enabling Fast user Switching MacOS](https://www.howtogeek.com/339517/how-to-enable-fast-user-switching-in-macos/)

- Clean separation of dependencies.
- All your apps and developer tools are already installed \* Using tools like
  NVM and PyENV allow you to have different versions of Python or Node
- Install new tools by switching To admin \* Which can be a touchID away.
- Separate lines of notifications _ No business stuff on personal hours _ No
  personal notifications 🍑🍆 when your showing something off at work.
- Your new account will have a name like Nicholas Romero @ google or some
  variation \* username can be the name of the company.
- Use your personal apple ID but turn everything off
  - eg email, contacts notes etc feel free to turn something on if it needs to
    be shared.
- Sign into chrome with your GSutie email.
',
        'Use fast user switching for hygienic separation between personal and professional accounts on a single laptop.',
        'macos-fast-user-switching', 1, '2019-04-09', '2023-08-04 14:16:13',
        '2023-08-04 14:16:13'),
       ('f1dff5c7-e2d8-492e-89e2-3c55b0abddf3',
        'ca55d247-66e2-4346-b130-06c2d5a7c826',
        'India Part 1 - Arrival and PyCon India', '

## How I got there

Most likely I saw PyCon on twitter make a post about PyCon India and I had been
working on a software boilerplate called Rjango. I decided to apply in October
and what do ya know I was accepted. I had about month till I had to be in India.
I''ve never been out of the country and had to get my passport and visa into
India.

## Getting there

I flew from Houston to Paris, had a few hour layover and then to Itially where I
had a 19 hour layover. Has some espresso and wine, snuck into the fancy members
only lounge for a bit then finally went on my way to India.

## Arrival

When I got there I had to go through customs. I exchanged some dollars for
rubbies and naturally bought some whisky at the duty free store. An interesting
thing about getting a sim card in India is that it doesn''t activate for 12 or so
hours. So no way to get an uber. Thus I had to go outside and attempt to hail a
cab.

While attempting to hail a cab I met a cabbie who offered to show me around a
bit. Some pictures below

He mentioned I might want to check out the Tourist center. Being super jet
lagged I didn''t really argue.

## Delhi Tour and Services

I arrived at Delhi Tour and Services around six in the morning, there I met
Danish who politely informed me that the room I had reserved in was not in a
great part of Delhi and promptly offered to let me stay with him and his friend
Moosah.

<Image src="IMG_0113.jpeg" />

Danish then smoothly talked me into a tour of northern india, I hesitantly
crossed the street to pull out a thousand or so dollars over a few transactions
which my bank didn''t mind at all.

<Image src="IMG_0117.jpeg" />

After paying Danish sent me with one of the company drivers and we set off
accross the town while he finished up the work day.

## The Apartment

After getting dropped off I met Mooshi, the apartments stay in help on the
street carried my stuff up to the apartment for me. Moosah was also at work but
I met Noel who was seeing Moosah at the time. We spoke for a bit, I think at
this time its around 10:30 am IND or 9:30 PM CST. After shower I promptly
crashed until 7:50 AM.

<Image src="IMG_0118.jpeg" />

The next day (lot of this is based of the metadata in the pictures I took) where
I was greated by what would become my standard breakfeast when staying at the
apartment.

AN omlet with veg, naan and a chai.

<Image src="IMG_0127.jpeg" />

## Party Time

After breakfast Noel and I chatted and shared some whisky, which we get Mooshi
to drink a little (which may have not be super kosher). Noel then invited her
friend over and we partaked in

## Pycon India

Ironically the catalyst for this journey PyCon India is really but a footnote in
the larger picture. It was held in a small college and had a few interesting
talks

## Dinner after words
', 'The beginning of my trip to India.', 'india-1', 0, '2017-11-01',
        '2023-08-04 14:16:13', '2023-08-04 14:16:13'),
       ('fb01a5b9-c1c8-427f-9a35-94f31b0c1113',
        'ca55d247-66e2-4346-b130-06c2d5a7c826', 'Evaluating Rust.', '

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
', 'A look at setting using Rust for REST APIs and Embedded development.',
        'evaluating-rust', 1, '2020-06-15', '2023-08-04 14:16:13',
        '2023-08-04 14:16:13')
on conflict do nothing;