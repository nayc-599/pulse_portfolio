---
layout: post.njk
permalink: "journal/posts/update-code-before-data.html"
title: "Writing the code before the data arrives"
description: "No dataset yet, so we wrote skeletons, researched augmentation and set up the repo."
category: "update"
date: 2026-08-27
week: 2
author: "naychi"
summary: "No dataset yet, so we wrote skeletons, researched augmentation and set up the repo."
images: []
readTime: 1
---

We still didn't have the dataset, so this week was about getting everything else ready.

- Amelie researched **data augmentation**: small flips and colour changes help, but pushing them too far makes faces look unrealistic.
- Christopher started on **face detection** with public test images, so the pipeline would be ready the moment real data arrived.
- Aaron had a first **Streamlit dashboard** running.
- Amelie and I wrote **skeletons** for the training code, so training could start as soon as the data did.

We also set up a shared repository under Monash DeepNeuron and agreed on one picture of the pipeline: video comes in, splits into a face branch (pain) and a body branch (patient detection), and both feed the alerts.
