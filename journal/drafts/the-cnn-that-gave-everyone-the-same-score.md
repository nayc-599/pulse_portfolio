---
layout: post.njk
draft: true
title: "The CNN that gave everyone the same score"
description: "Amelie on augmenting faces carefully, and the bug where very different expressions all got the same pain score."
category: "build-log"
date: 2026-09-16
author: "naychi"
featuring: "amelie"
excerpt: "Amelie on augmenting faces carefully, and the bug where very different expressions all got the same pain score."
readTime: 1
listMotif: "lattice"
motif: "lattice"
---

{#- DRAFT: ask Amelie to read this before it goes live, then move it to journal/posts/, remove draft: true, and give it a permalink and a chainOrder. -#}


Amelie built the first half of our pain model: the CNN that looks at one face at a time.

**Augmenting faces carefully.** Before the data arrived, she researched how to stretch a small face dataset further. Flips and small colour changes help. Heavy skewing doesn't, because the faces stop looking like real faces. Because our data is video, the same change has to be applied to every frame in a clip, or the model learns the augmentation instead of the expression.

**The bug.** Once training started, the CNN gave almost the same pain score to very different expressions. The cause was imbalance: most frames show little or no pain, so always guessing "low" was the easiest way for the model to look accurate.

**The fix.** Amelie switched to using a pretrained ResNet-18 as a feature extractor. Each face becomes a set of 256 numbers that describe it, instead of a single score. Those features are what my LSTM reads to judge how pain changes over time. A couple of weeks later I went back and trained the CNN properly on pain labels, with the class imbalance handled.

**Why it matters.** Every pain score Pulse shows starts with these features. If the CNN can't tell expressions apart, nothing after it can either.
