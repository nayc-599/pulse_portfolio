---
layout: post.njk
permalink: "journal/posts/update-showing-pulse-live.html"
title: "Showing Pulse live"
description: "What we built in eight weeks, what visitors did with it, and the idea we're taking away."
category: "update"
date: 2026-10-15
week: 9
author: "naychi"
summary: "What we built in eight weeks, what visitors did with it, and the idea we're taking away."
linkedin_url: "TODO"
images: []
readTime: 1
---

Last week we showed Pulse at the Monash DeepNeuron showcase.

Pulse is a monitor for bedridden patients. Some patients can't reach a call button, and nurse rounds can be hours apart. Pulse watches for pain and unusual movement and aims to alert a nurse within a minute, without the patient having to ask.

In eight weeks we built:

- A CNN and LSTM pipeline that reads facial expressions and estimates a pain score (PSPI).
- Pose detection for posture and movement, plus an experimental fall detector.
- A nurse dashboard with live alerts, acknowledgement tracking and an overnight history.
- A first hardware prototype of the camera cube.

Visitors loved pulling their best pain faces to set off an alert. It quickly turned into a competition for the highest score.

The conversations were even better. One visitor suggested we look into remote photoplethysmography (rPPG): using the camera to pick up tiny colour changes in the skin as blood flows, to estimate heart rate without touching the patient. It could take Pulse from reading expressions to reading vital signs.

My biggest lesson as lead: the hard part wasn't training the models, it was getting face detection, pain scoring, pose, alerts and a live dashboard to run together, in real time, on one laptop.

Pulse is a prototype, not a medical device, and there's plenty left to do. We also rebuilt the dashboard the week before the showcase, around how real bedside monitors and hospital alarms work. More on that soon.

[Read the full showcase write-up →](/journal/posts/week-eight-showcase.html)
