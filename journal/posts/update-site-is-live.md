---
layout: post.njk
permalink: "journal/posts/update-site-is-live.html"
title: "The dataset arrived, and the site went live"
description: "The dataset arrived, the CNN produced its first features, and we put this site online."
category: "update"
date: 2026-09-18
week: 6
author: "naychi"
summary: "The dataset arrived, the CNN produced its first features, and we put this site online."
linkedin_url: "TODO"
images: []
readTime: 1
---

This week we put this site online, journal and all.

Pulse is a camera that watches for the moments between scheduled check-ins. Bedridden patients who can't call for help rely on rounds that can be hours apart. If something goes wrong in between, nobody knows until the next check. Pulse is our attempt to close that gap.

Where things stood:

- **Dataset access came through**, and most of the following days went into indexing frames and checking labels.
- **Amelie finished the CNN.** It turns each face into a set of features, and she fixed a problem where it gave very different expressions the same score.
- **I started the LSTM** on top of those features, to read how pain changes over time.
- **Christopher** worked on making training and the live camera use exactly the same preprocessing, so the two don't drift apart.
- **Face detection and patient detection** both worked on their own, and Ai Lin started joining them up in the dashboard. Aaron kept refining patient detection.

One thing still open was what exactly the model should predict, and over how long a window of time. Small assumptions like that add up fast on a five-person team, so we said them out loud instead of letting two people build against two different ideas.
