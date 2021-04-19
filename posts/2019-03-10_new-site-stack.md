---
slug: new-site-stack
title: "New site stack"
date: "2019-03-09"
description: "We take a look at the process and technology behind this site."
tags: ["tech"]
---

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

One thing i'm actually working on as I type is the metadata related to this post
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
