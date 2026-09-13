---
layout: post.njk
permalink: "journal/posts/week-one.html"
title: "Week one: we argued our way from falls to pain"
description: "Falls detection was the obvious project. Two hours of arguing got us somewhere less crowded and more useful."
ogDescription: "Pulse journal · Build log · 12 August 2026 · Nay Chi"
category: "BUILD LOG"
date: 2026-08-12
author: "Nay Chi"
authorRole: "PROJECT LEAD · DEEP LEARNING · WEB"
readTime: 5
excerpt: "Falls detection was the obvious project. Two hours of arguing got us somewhere less crowded and more useful."
motif: scatter
listMotif: staircase
chainOrder: 6
---
We walked into the first Wednesday meeting intending to build falls detection. We walked out with pain detection, two hours later, mostly because of one question nobody could answer.

The question was: who is the alert for, and what do they do differently because of it?

## Falls, and why we dropped it

Falls detection is the obvious camera-in-a-bedroom project. It is also, we found within an hour of reading, extremely well covered — by commercial products, by published work, and by cheap accelerometers that do not need a camera at all. And a fall is a loud event. Someone in the house usually knows.

- **Crowded.** We would be a worse version of something you can buy.
- **Already solved without cameras.** A wrist accelerometer detects a fall more reliably than we could from video.
- **The wrong gap.** A fall is detectable by other means. Silent pain is not.

## What we chose instead

A bedridden patient who cannot reach a call button has no channel at all. Not a weak channel — none. Between scheduled rounds, pain simply goes unreported. That is a gap a camera is unusually well suited to, because the face is where the signal already is.

<blockquote class="pull-quote"><p>Not "improves response times". Forty-one seconds, not four hours.</p></blockquote>

We also liked that the claim is small and checkable. Pulse does not diagnose, does not treat, does not replace a carer. It says: this face looks like pain, at this confidence, right now. A person decides what that means. Every hard question that follows — thresholds, false alarms, trust — sits inside that one sentence, which is a good sign that the sentence is the right size.

## What we agreed in that first meeting

- The output is one notification to one carer, with a still frame and a confidence.
- No video leaves the device, and nothing is stored.
- The dataset would be UNBC-McMaster, with the domain gap stated up front rather than buried.
- We would write the journal as we went, including the parts we got wrong.

Three of those four have held. The fourth — writing as we go — slipped by about two weeks, which is why this entry is being published after the ones that follow it chronologically. We are catching up, unedited.
