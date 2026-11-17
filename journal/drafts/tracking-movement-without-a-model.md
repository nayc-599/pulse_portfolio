---
layout: post.njk
draft: true
title: "Tracking movement without training a model"
description: "Aaron's patient detection started as maths on body landmarks, not machine learning, and that was the right call."
category: "build-log"
date: 2026-09-05
author: "naychi"
featuring: "aaron"
excerpt: "Aaron's patient detection started as maths on body landmarks, not machine learning, and that was the right call."
readTime: 1
listMotif: "lattice"
motif: "lattice"
---

{#- DRAFT: ask Aaron to read this before it goes live, then move it to journal/posts/, remove draft: true, and give it a permalink and a chainOrder. -#}


When Aaron first showed patient detection, the surprise was that there was no trained model in it at all.

**How it works.** MediaPipe finds the body's landmarks in each camera frame (shoulders, hips, knees and so on), and OpenCV handles the camera. From there it's geometry. Aaron measures how the body moves from the waist, frame to frame, and turns that into a movement score. Big movements like walking score high. Small ones, like moving an arm or turning the head, score low. The same landmarks tell standing, sitting and lying down apart.

**Why no model?** We didn't have patient movement data to train on, and a calculation you can read is easier to trust and debug. It also gave the rest of us something real to build the dashboard against while we waited for the pain dataset.

**What was hard.** Sitting. It depends on the knee angle, and knees are easy to misread when they're bent towards the camera or half covered by a blanket. Aaron spent a good few weeks on that, then on how much each body part should count towards the overall movement score, so that a restless patient stands out from someone adjusting their pillow.

**Where it went.** This branch became the "out of bed" half of Pulse: it finds the patient, reads their posture and movement, and feeds the alerts. It's also the base for the experimental fall detection we showed at the showcase.
