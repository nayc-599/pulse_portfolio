---
layout: post.njk
permalink: "journal/posts/domain-gap.html"
title: "Our dataset is a physio clinic. Our room is a bedroom at 3am."
description: "What UNBC-McMaster actually contains, and the honest distance between that footage and the room we are aiming at."
ogDescription: "Pulse journal · Research · 27 August 2026 · Amelie"
category: "RESEARCH"
date: 2026-08-27
author: "Amelie"
authorRole: "DEEP LEARNING · HARDWARE"
readTime: 7
excerpt: "What UNBC-McMaster actually contains, and the honest distance between that footage and the room we are aiming at."
motif: ring
listMotif: scatter
chainOrder: 1
---
Every number we report at the showcase will have been measured on video of seated adults in a physiotherapy clinic, in good light, facing the camera, in acute pain that a clinician provoked on purpose. Our target is a person lying down, in the dark, at an oblique angle, possibly in pain that has lasted for weeks.

That distance has a name — domain gap — and naming it is not the same as fixing it. This entry is the honest version of what we have, what we did about it, and what we are still going to be wrong about.

## What is actually in the archive

The UNBC-McMaster Shoulder Pain Expression Archive is video of patients with shoulder injuries undergoing range-of-motion tests. Frames are coded for facial action units and for pain intensity, which is what makes it usable at all: it is one of very few pain datasets where the labels are per-frame rather than per-clip. It is licensed for non-commercial research and teaching, and we use it under those terms.

- **Population.** Adults with shoulder injuries. No children, no dementia patients, no post-operative sedation.
- **Pose.** Seated, upright, roughly frontal to the camera.
- **Lighting.** Clinical and consistent. No infrared, no dark room, no lamp casting half a face in shadow.
- **Pain type.** Acute and provoked, in short episodes with a clear onset. Not chronic, not sustained across an hour.

## Four ways our room differs

We wrote the differences down as a list rather than a paragraph, because a list is harder to skim past:

- **Angle.** A bedside cube looks up at a face from roughly 30–50°. Almost nothing in the training data looks like that.
- **Occlusion.** Pillows, blankets, an arm across the face, a head turned into the mattress. In the clinic the face is always available.
- **Light.** A dark room at 3am. Whatever we do at the showcase will be in a lit room, which flatters us.
- **Duration.** Chronic pain may not produce the sharp onset the LSTM learned to look for. A face that has been in pain for an hour may be still.

<blockquote class="pull-quote"><p>The mitigations we have are real and they are not enough. Both halves of that sentence matter.</p></blockquote>

## What we did about it

Two things, both partial. First, **face alignment**: before the CNN sees a crop, we warp it to a canonical set of landmark positions, which removes some of the pose difference. Second, **angle augmentation**: during training we rotate and perspective-jitter the clinic footage to synthesise oblique views.

<figure>
<pre><code><span style="color:var(--amber-dim)"># augmentation applied to every training crop</span>
aug = Compose([
    RandomRotate(limit=<span style="color:var(--amber)">18</span>),           <span style="color:var(--amber-dim)"># degrees</span>
    RandomPerspective(scale=<span style="color:var(--amber)">0.12</span>),    <span style="color:var(--amber-dim)"># fakes an upward camera</span>
    RandomBrightnessContrast(<span style="color:var(--amber)">0.3</span>, <span style="color:var(--amber)">0.3</span>),
    RandomOcclusion(max_frac=<span style="color:var(--amber)">0.25</span>),   <span style="color:var(--amber-dim)"># pillow, arm, blanket</span>
])</code></pre>
<figcaption>FIGURE 1 · SYNTHESISING A BEDROOM OUT OF A CLINIC. IT IS A GUESS, NOT A GROUND TRUTH.</figcaption>
</figure>

Perspective jitter is not the same as a camera actually being below someone. It moves pixels; it does not add the parts of a face you can only see from underneath. We are honest about that in the write-up and we will be honest about it on stage.

## What we are not going to claim

We are not going to report an accuracy figure as if it were an accuracy figure for a bedroom. Any number we show is measured on held-out clinic footage, and we will say so in the same breath as the number. If someone reads our result as evidence that this works at a bedside, we have misled them, even if every digit is correct.

This is the part I am least sure about, so I am writing it down rather than pretending it is settled: I do not know how much of the gap the augmentation closes. Measuring that honestly needs footage we do not have and cannot ethically collect in twelve weeks. So the answer for now is that we do not know, and a Week 9 demo is not the thing that finds out.
