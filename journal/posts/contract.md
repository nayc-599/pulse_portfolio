---
layout: post.njk
permalink: "journal/posts/contract.html"
title: "Writing the contract between our CNN and our LSTM, before either exists"
description: "Two people are about to train two models against two different ideas of what a feature vector is. Here is the one-page contract we wrote to catch that before it costs us a debugging afternoon."
ogDescription: "Pulse journal · Engineering · 28 August 2026 · Nay Chi"
category: "ENGINEERING"
date: 2026-08-28
author: "Nay Chi"
authorRole: "PROJECT LEAD · DEEP LEARNING · WEB"
readTime: 10
excerpt: "Two people are about to train two models against two different ideas of what a feature vector is. Here is the contract we wrote to catch that in advance."
motif: scatter
listMotif: lattice
chainOrder: 2
---
Aaron is going to train a CNN that outputs 256 numbers per frame. I am going to train an LSTM that reads 256 numbers per frame. Neither exists yet, both are on the roadmap for weeks five and six, and when we sat down this week to compare notes before either of us writes training code, we found we had already made four different assumptions about what those 256 numbers actually are.

Nothing is broken, because nothing is built. But if we had trained both models against our own separate assumptions and only plugged them together afterward, the likely result is a confidence output that sits at some meaningless flat number for as long as it takes us to notice, followed by an afternoon of each of us assuming the other person's model is wrong.

## Four disagreements we found in one afternoon, before training either model

We sat down with both of our design notes open side by side. Within an hour we had found four separate mismatches, none of which would ever throw an exception, all of which would quietly produce nonsense:

1. **Normalisation.** Aaron's plan has the CNN emit raw activations from a layer with no bound. My LSTM design assumes vectors scaled to zero mean and unit variance. Anything his model produced would have looked like an outlier to mine.
2. **Ordering.** My rolling buffer is designed oldest-first. Aaron's extraction script, as sketched, writes newest-first. The LSTM would have read the last 1.1 seconds backwards.
3. **Missing frames.** Aaron's plan, when the face detector finds nothing, is to return a zero vector. Mine expects the frame to be skipped entirely. A patient turning over would have become, to the LSTM, a sustained and very confident nothing.
4. **Dtype.** `float64` planned out, `float32` planned in. Harmless by itself, but exactly the kind of thing that costs twenty minutes of suspicion once something else is also wrong.

<blockquote class="pull-quote"><p>Every one of these was a decision one of us had already made alone, in a document the other hadn't read.</p></blockquote>

## The contract

So we wrote one page now, ahead of training either model. Not a design document: a contract, in the sense that either side can be tested against it independently once it exists. It will live in the repo next to the models, and the plan is for it to be the first thing either of us checks when something doesn't work.

<figure>
<pre><code><span style="color:var(--amber-dim)"># pulse/contract.py: the interface between stage 3 and stage 5</span>
<span style="color:var(--purple-300)">FEATURE_DIM</span>   = 256          <span style="color:var(--amber-dim)"># fixed. never inferred at runtime</span>
<span style="color:var(--purple-300)">WINDOW</span>        = 32           <span style="color:var(--amber-dim)"># frames &#8776; 1.1s at 30fps</span>
<span style="color:var(--purple-300)">DTYPE</span>         = np.float32
<span style="color:var(--purple-300)">ORDER</span>         = <span style="color:var(--amber)">"oldest_first"</span>
<span style="color:var(--purple-300)">NORMALISED</span>    = <span style="color:var(--amber)">True</span>         <span style="color:var(--amber-dim)"># zero mean, unit variance, per-dim</span>
<span style="color:var(--purple-300)">ON_NO_FACE</span>    = <span style="color:var(--amber)">"skip"</span>        <span style="color:var(--amber-dim)"># never a zero vector. skip the frame.</span>

<span style="color:var(--purple-300)">def</span> validate(window):
    assert window.dtype == DTYPE
    assert window.shape == (WINDOW, FEATURE_DIM)
    assert abs(window.mean()) &lt; 0.5      <span style="color:var(--amber-dim)"># catches un-normalised input</span>
    return window</code></pre>
<figcaption>FIGURE 1 · THE WHOLE CONTRACT. NEITHER MODEL EXISTS YET TO TEST IT AGAINST.</figcaption>
</figure>

The assertion on the mean is the one I expect to matter most. It is crude, since a normalised window can legitimately drift, but the idea is that it should catch the un-normalised case within seconds instead of after an afternoon of staring at a flat line, assuming we actually remember to call it once there is code to call it on.

### What our separate assumptions were, against what the contract now says

| DECISION | WE EACH ASSUMED | THE CONTRACT SAYS |
|---|---|---|
| Normalisation | wherever, unspecified | CNN side, always |
| Window order | oldest-first vs newest-first | oldest first |
| No face in frame | zero vector vs skip | skip frame |
| Validation | none planned | on every window |

## Why we are doing this in week four, not week seven

Because splitting the pipeline into three models is the right call, and it is exactly the kind of decision that hides its cost until later. Three models mean three people can work at once, and each piece will be debuggable on its own: that is the whole argument for the split, and we still believe it. But it also means two interfaces nobody owns, and an interface nobody owns is a place where two reasonable people can quietly disagree for weeks without either of them noticing until the numbers come out wrong.

This is the part I am least sure about, so I am writing it down rather than pretending it is settled: I do not know whether the right fix is more documents like this one, or fewer seams. For a ten-week project, the document is cheaper. For anything that lived longer, I suspect we would want the contract to be executable, a shared type, not a page of constants two people have to remember to read.

We have not trained either model yet, so we do not actually know if this contract holds. That is a week five and week six problem, and I expect to be back here writing about what it missed.
