---
layout: post.njk
draft: true
title: "Same preprocessing, live and in training"
description: "Christopher's face pipeline, and why the camera and the training data have to be prepared exactly the same way."
category: "build-log"
date: 2026-09-16
author: "naychi"
featuring: "christopher"
excerpt: "Christopher's face pipeline, and why the camera and the training data have to be prepared exactly the same way."
readTime: 1
listMotif: "lattice"
motif: "lattice"
---

{#- DRAFT: ask Christopher to read this before it goes live, then move it to journal/posts/, remove draft: true, and give it a permalink and a chainOrder. -#}


Christopher owns the step between the camera and the pain model: finding the face and preparing it.

**Finding the face.** He built face detection on MediaPipe's face landmarker. For each frame it finds the face, crops it and lines it up, so the CNN always sees faces in roughly the same position and size. He started with public test images while we waited for our own data, so the pipeline was ready the day the data arrived.

**Why "the same" matters.** A model only works on the kind of input it was trained on. If training data is cropped one way and the live camera another, the scores drift, and nobody notices until they look wrong. So Christopher changed his pipeline to save the frames it extracts, and both training and live inference now go through the same steps.

**Keeping a window.** Pain shows up over time, not in a single frame. Christopher added a rolling buffer that keeps the most recent stretch of frames, so the sequence model always has a window to read from. We started with a 30-second window and planned to tune it later.

**Next.** In late September he also started researching environmental sensors, for when Pulse reads the room as well as the patient.
