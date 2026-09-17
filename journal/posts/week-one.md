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
chainOrder: 7
---
We walked into the first Wednesday meeting planning to build falls detection. Two hours later we walked out with pain detection instead, mostly because of one question nobody in the room could answer.

The question was: who gets the alert, and what do they actually do differently because of it?

## Falls, and why we dropped it

Falls detection is the obvious camera-in-a-bedroom project. Within about an hour of reading around it we found it's also crowded: commercial products cover it, there's published work on it, and a cheap wrist accelerometer catches a fall more reliably than a camera would, without needing a camera at all. A fall is also a loud event. Someone in the house usually notices on their own.

- **Crowded.** We would be a worse version of something you can already buy.
- **Already solved without cameras.** An accelerometer beats video here.
- **The wrong gap.** A fall gets noticed through other means. Pain that someone is silently sitting with does not.

## What we chose instead

A bedridden patient who cannot reach a call button has no way to report pain between scheduled rounds. That gap is one a camera is well placed to close, because the face is already carrying the signal.

We liked that the claim stays small and checkable. Pulse does not diagnose, does not treat, and does not replace a carer. It says: this face looks like pain, at this confidence, right now. A person decides what that means. Every hard question that follows from there, thresholds, false alarms, whether anyone trusts the thing after the third false alert, sits inside that one sentence.

Scheduled rounds can run up to four hours apart. What we want to build should be able to close that to something closer to forty-one seconds. That difference is the whole pitch.

## What we agreed in that first meeting

- The output is one notification to one carer, with a still frame and a confidence.
- No video leaves the device, and nothing is stored.
- The dataset would be UNBC-McMaster, with the domain gap stated up front rather than buried.
- We would write the journal as we went, including the parts we got wrong.

Three of those four have held. The fourth, writing as we go, slipped by about two weeks: this entry is going up after some of the ones that follow it chronologically, because we are catching up. Unedited, as promised, just late.
