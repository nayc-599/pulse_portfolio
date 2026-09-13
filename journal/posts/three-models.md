---
layout: post.njk
permalink: "journal/posts/three-models.html"
title: "Three models, not one: how we split the pipeline"
description: "One end-to-end network would have been simpler to draw and much harder to debug. We chose debuggable."
ogDescription: "Pulse journal · Engineering · 19 August 2026 · Aaron"
category: "ENGINEERING"
date: 2026-08-19
author: "Aaron"
authorRole: "COMPUTER VISION · ALERTS"
readTime: 6
excerpt: "One end-to-end network would have been simpler to draw and much harder to debug. We chose debuggable."
motif: lattice
listMotif: lattice
chainOrder: 5
---
The obvious architecture is one network: video in, pain confidence out, trained end to end. We did not build that, and the reason is not accuracy.

We built three models — a face detector, a CNN feature extractor, and an LSTM over a rolling window — trained separately and frozen at inference. Here is the argument, including the part where it costs us something.

## Why split

- **Each piece is testable alone.** I can check the CNN on single frames without any temporal data, and Nay Chi can check the LSTM on synthetic vectors without any video.
- **Three people can work at once.** With twelve weeks and five students, parallel work is not a nicety.
- **Failures are attributable.** When the output is wrong we can ask which stage was wrong. In an end-to-end model, the answer is always "the model".
- **The data suits it.** We have a modestly sized clinic dataset. Training one large network end to end on that is a good way to memorise it.

## What it costs

Two things, and I want them written down rather than discovered by a judge in week nine.

First, **the CNN cannot learn temporal cues.** It sees one frame at a time, so anything that only exists as motion — the speed a brow tightens, a wince that resolves in 200ms — has to survive being compressed into a per-frame description before the LSTM ever sees it. An end-to-end model could learn features specifically because they are useful over time. Ours cannot.

Second, **two interfaces nobody owns.** A split pipeline has seams, and seams are where two reasonable people quietly disagree about normalisation for three weeks. That happened. It cost us an afternoon and produced a written contract, which is the fix.

<figure>
<pre><code><span style="color:var(--amber-dim)"># what "frozen at inference" actually means</span>
detector.eval();  <span style="color:var(--amber-dim)"># no gradients, no updates, ever</span>
cnn.eval();
lstm.eval();

<span style="color:var(--purple-300)">with</span> torch.no_grad():          <span style="color:var(--amber-dim)"># the device cannot learn the patient</span>
    conf = lstm(window)</code></pre>
<figcaption>FIGURE 1 · THREE MODELS, NO GRADIENTS. NOTHING ADAPTS AFTER DEPLOYMENT.</figcaption>
</figure>

<blockquote class="pull-quote"><p>People assume the device learns the patient over time. It does not. The weights are fixed before it is switched on.</p></blockquote>

This is worth stating loudly because it changes what the device is. A system that adapts to an individual would need their data, a training loop on or near the device, and a much longer conversation about consent. Ours does none of that: a face flows through three frozen models and a number comes out. That is a smaller claim, and it is the true one.

### Would I do it differently with more time

Probably not for this project. If we had a year and a dataset ten times the size, an end-to-end model trained with a temporal objective is very likely the better answer. At twelve weeks, with five students learning as we go, debuggable beats optimal.
