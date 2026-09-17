---
layout: post.njk
permalink: "journal/posts/three-models.html"
title: "Three models, not one: our plan for splitting the pipeline"
description: "One end-to-end network would be simpler to draw and much harder to debug. We are choosing debuggable, before we've trained anything."
ogDescription: "Pulse journal · Engineering · 19 August 2026 · Aaron"
category: "ENGINEERING"
date: 2026-08-19
author: "Aaron"
authorRole: "COMPUTER VISION · ALERTS"
readTime: 6
excerpt: "One end-to-end network would be simpler to draw and much harder to debug. We are choosing debuggable, before we've trained anything."
motif: lattice
listMotif: lattice
chainOrder: 6
thumb: /media/workflow.png
thumbAlt: "Flowchart of the planned pipeline: a live video feed branching into patient detection and a CNN feeding an LSTM, both converging on an alert system and dashboard."
---
The obvious architecture is one network: video in, pain confidence out, trained end to end. We are not building that, and the reason is not accuracy.

The plan is three models instead: a face detector, a CNN feature extractor, and an LSTM over a rolling window, trained separately and frozen at inference once each one exists. Face detection is running already. The CNN and LSTM are weeks five and six on the roadmap, so this is the argument for the split, written down before either of them is trained rather than after.

<figure>
<img src="/media/workflow.png" alt="Flowchart on a dark background: Live Video Feed branches to Patient Detection and to CNN facial feature extraction, which feeds CNN plus RNN/LSTM pain detection; both branches flow into Alert System, then Dashboard / Frontend." />
<figcaption>FIGURE 1 · THE PLANNED FLOW. PAIN DETECTION IS TWO MODELS IN SERIES, NOT ONE, AND IT MEETS PATIENT DETECTION AT THE ALERT SYSTEM.</figcaption>
</figure>

## Why split

- **Each piece will be testable alone.** Once the CNN exists I can check it on single frames without any temporal data, and Nay Chi can check the LSTM on synthetic vectors without any video.
- **Three people can work at once.** With ten weeks and five students, parallel work is not a nicety.
- **Failures will be attributable.** When the output is wrong we will be able to ask which stage was wrong. In an end-to-end model, the answer is always "the model".
- **The data suits it.** We have a modestly sized clinic dataset. Training one large network end to end on that is a good way to memorise it.

## What we expect it to cost

Two things, and I want them written down now rather than discovered by a judge in week eight.

First, **the CNN will not be able to learn temporal cues.** It will see one frame at a time, so anything that only exists as motion, the speed a brow tightens, a wince that resolves in 200ms, has to survive being compressed into a per-frame description before the LSTM ever sees it. An end-to-end model could learn features specifically because they are useful over time. Ours will not be able to.

Second, **two interfaces nobody will own yet.** A split pipeline has seams, and seams are where two reasonable people quietly disagree about normalisation if nobody catches it early. We do not have a fix for that beyond writing the interface down in advance and actually sticking to it, which is a weaker plan than I would like to admit.

<figure>
<pre><code><span style="color:var(--amber-dim)"># what "frozen at inference" is meant to mean, once trained</span>
detector.eval();  <span style="color:var(--amber-dim)"># no gradients, no updates, ever</span>
cnn.eval();
lstm.eval();

<span style="color:var(--purple-300)">with</span> torch.no_grad():          <span style="color:var(--amber-dim)"># the device should not learn the patient</span>
    conf = lstm(window)</code></pre>
<figcaption>FIGURE 2 · THE INTENDED PATTERN. NONE OF THIS RUNS YET.</figcaption>
</figure>

<blockquote class="pull-quote"><p>People will probably assume the device learns the patient over time. It won't. The plan is for the weights to be fixed before the device is ever switched on.</p></blockquote>

That changes what the device is meant to be, so it is worth being explicit about now rather than after someone asks. A system that adapts to an individual would need their data, a training loop on or near the device, and a much longer conversation about consent. Ours is designed to do none of that: a face is meant to flow through three frozen models and a number comes out. It is a smaller, more accurate claim than what people tend to assume, assuming we build it the way we are planning to.

### Would we do it differently with more time

Probably not for this project. If we had a year and a dataset ten times the size, an end-to-end model trained with a temporal objective is very likely the better answer. At ten weeks, with five students learning as we go, debuggable beats optimal, at least on paper. Whether that holds once we are actually debugging it is next month's problem.
