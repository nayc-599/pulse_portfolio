---
layout: post.njk
permalink: "journal/posts/skeletons.html"
title: "Skeletons before data: writing code we cannot run yet"
description: "We wrote the whole inference loop with stub models returning random numbers. It caught four interface bugs before the weights existed."
ogDescription: "Pulse journal · Build log · 27 August 2026 · Christopher"
category: "BUILD LOG"
date: 2026-08-27
author: "Christopher"
authorRole: "COMPUTER VISION · DATA"
readTime: 5
excerpt: "We wrote the whole inference loop with stub models returning random numbers. It caught four interface bugs before the weights existed."
motif: staircase
listMotif: staircase
chainOrder: 3
---
For about ten days in week five, none of our models worked. So we wrote the entire inference loop anyway, against three stubs that returned random numbers of the right shape.

It felt like procrastination. It was the most useful ten days of the project so far.

## The stubs

<figure>
<pre><code><span style="color:var(--amber-dim)"># pulse/stubs.py: stand-ins with the right shapes and nothing else</span>
<span style="color:var(--purple-300)">def</span> detect_face(frame):
    <span style="color:var(--amber-dim)"># 1 in 8 frames has no face, like a real room</span>
    <span style="color:var(--purple-300)">if</span> random.random() &lt; <span style="color:var(--amber)">0.125</span>: <span style="color:var(--purple-300)">return</span> <span style="color:var(--amber)">None</span>
    <span style="color:var(--purple-300)">return</span> np.zeros((<span style="color:var(--amber)">224</span>, <span style="color:var(--amber)">224</span>, <span style="color:var(--amber)">3</span>), np.uint8)

<span style="color:var(--purple-300)">def</span> features(crop):
    <span style="color:var(--purple-300)">return</span> np.random.randn(<span style="color:var(--amber)">256</span>).astype(np.float32)

<span style="color:var(--purple-300)">def</span> confidence(window):
    <span style="color:var(--purple-300)">return</span> float(np.clip(np.random.normal(<span style="color:var(--amber)">0.4</span>, <span style="color:var(--amber)">0.2</span>), <span style="color:var(--amber)">0</span>, <span style="color:var(--amber)">1</span>))</code></pre>
<figcaption>FIGURE 1 · THREE FUNCTIONS THAT KNOW NOTHING AND STILL FOUND FOUR BUGS.</figcaption>
</figure>

The one decision worth copying is the **1 in 8 frames has no face** line. A stub that always succeeds tests nothing. A stub that fails at a realistic rate turns the missing-face path from a hypothetical into something you trip over on the first run.

## What it caught

- **The buffer never drained.** On a missing face we skipped the frame but also skipped the buffer eviction, so the window silently held frames from ten seconds earlier.
- **Alerts fired every frame.** Above threshold, we sent a notification per frame, thirty per second. We now debounce to one alert per 30-second window unless confidence rises materially.
- **Timestamps came from the wrong clock.** The alert carried the time the notification was built, not the time of the frame that triggered it. Off by up to 400ms, which sounds small until a carer asks what happened when.
- **Startup lied.** For the first 32 frames the window is not full, and we were happily returning a confidence for a partial window. It now reports `warming_up` instead.

<blockquote class="pull-quote"><p>None of these are model bugs. All four would have looked like model bugs if we had found them a week later, with real weights in the loop.</p></blockquote>

## The cost, and what happens next

Two evenings of writing code that did nothing, and a habit of trusting the loop enough to believe the numbers coming out of it, once there are real numbers to believe. The plan for weeks five and six is to swap the stubs out one at a time: Aaron's CNN replaces `features()`, then the LSTM replaces `confidence()`. Nay Chi has already written up the interface contract the two of them will need to agree on before that happens, so we are not starting that argument from nothing.

I would do this again, and earlier. Writing the loop first forced us to decide what a frame, a window and an alert actually are while the decisions were still cheap, before there was a trained model around to make us feel like the hard part was already done.
