---
layout: post.njk
permalink: "journal/posts/update-ethics-before-data.html"
title: "Ethics before data"
description: "A camera pointed at a patient raises questions. We worked through some of them, and saw the first movement demo."
category: "update"
date: 2026-09-02
week: 3
author: "naychi"
summary: "A camera pointed at a patient raises questions. We worked through some of them, and saw the first movement demo."
images: []
readTime: 1
---

A mentor from Monash DeepNeuron joined us this week to talk through the ethics of putting a camera next to a patient's bed.

What we settled on:

- Video is only kept as long as it's needed for training. Pulse isn't meant to store footage of patients.
- The data we can get is licensed for research only, so Pulse stays a research prototype.
- Anything we publish showing a face is one of us, with our consent.

On the build side, Aaron showed the first **movement detection** demo. It could already tell standing, walking and lying down apart, using pose landmarks rather than a trained model. We also chose a Raspberry Pi camera module for the future device, mostly for budget reasons.

We were still waiting on the dataset, so training stayed on hold.
