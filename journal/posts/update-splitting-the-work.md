---
layout: post.njk
permalink: "journal/posts/update-splitting-the-work.html"
title: "Splitting the work three ways"
description: "Modelling, hardware and the dashboard, each with an owner."
category: "update"
date: 2026-08-19
week: 2
author: "naychi"
summary: "Modelling, hardware and the dashboard, each with an owner."
images: []
readTime: 1
---

This week we turned the idea into jobs.

We split Pulse into three areas:

- **Models.** One branch looks at the face and estimates pain over time (a CNN for single frames, then a sequence model on top). The other branch looks at the whole body to find the patient and how they're moving.
- **Hardware.** A case for the camera, designed in Onshape.
- **Dashboard.** Where alerts show up for the carer.

We decided each model should report on its own instead of being merged into one big model. If something goes wrong, it's much easier to see which part caused it.

We also drew our first block diagram and a week-by-week timeline, and started asking for access to a pain dataset through our supervisors.
