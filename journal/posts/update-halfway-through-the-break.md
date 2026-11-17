---
layout: post.njk
permalink: "journal/posts/update-halfway-through-the-break.html"
title: "Halfway through the break, a week and a half to go"
description: "Both pain models trained, a fix to the CNN, a move off Streamlit, and a new teammate."
category: "update"
date: 2026-09-27
week: 7
author: "naychi"
summary: "Both pain models trained, a fix to the CNN, a move off Streamlit, and a new teammate."
linkedin_url: "TODO"
images: []
readTime: 1
---

With the showcase a week and a half away, the team pushed hard over the mid-semester break.

My week was mostly models and coordination:

- I trained both the **CNN and the LSTM**, and found the CNN hadn't been trained on pain labels at all. I fixed that, along with how it handled imbalanced classes and its preprocessing.
- The **LSTM was still less accurate than the CNN**. It's meant to improve on frame-by-frame guesses by reading how pain builds over time, so closing that gap became my main focus.
- We started **moving the dashboard off Streamlit**. It wasn't built for the speed and alert timing a ward needs.

The rest of the team moved things forward too. Kate was finishing the CAD design for the camera cube, Aaron was tuning how patient detection weighs different body parts, Christopher was researching environmental sensors, and Nageeb joined us to lead hardware integration.
