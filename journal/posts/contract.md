---
layout: post.njk
permalink: "journal/posts/contract.html"
title: "Writing down the contract between our CNN and our LSTM"
description: "Two people trained two models against two different ideas of what a feature vector is. Here is the one-page contract that fixed it, and why we should have written it in week five."
ogDescription: "Pulse journal · Engineering · 28 August 2026 · Nay Chi"
category: "ENGINEERING"
date: 2026-08-28
author: "Nay Chi"
authorRole: "PROJECT LEAD · DEEP LEARNING · WEB"
readTime: 11
excerpt: "Two people trained two models against two different ideas of what a feature vector is. Here is the document that fixed it."
motif: scatter
listMotif: lattice
chainOrder: 2
---
Aaron trained a CNN that outputs 256 numbers per frame. I trained an LSTM that reads 256 numbers per frame. We plugged them together on Tuesday and the confidence output sat at 0.5 for eleven minutes of video, regardless of what the person in the video did.

Nothing was broken. Both models did exactly what they were trained to do. They just disagreed about what a feature vector *is*, and neither of us had written that down anywhere.

## Four disagreements we found in one afternoon

We sat down with both training scripts open side by side. Within an hour we had four separate mismatches, none of which would ever have thrown an exception:

1. **Normalisation.** His CNN emitted raw activations from a layer with no bound. My LSTM was trained on vectors scaled to zero mean and unit variance. Everything I fed it looked like an outlier.
2. **Ordering.** My rolling buffer was oldest-first. His extraction script wrote newest-first. The LSTM was reading the last 1.1 seconds backwards.
3. **Missing frames.** When the face detector finds nothing, his code returned a zero vector. Mine expected the frame to be skipped entirely. A patient turning over became, to the LSTM, a sustained and very confident nothing.
4. **Dtype.** `float64` out, `float32` in. Harmless, but it cost us twenty minutes of suspicion.

<blockquote class="pull-quote"><p>Every one of these is a decision someone made deliberately, alone, at 11pm, and never told anyone about.</p></blockquote>

## The contract

So we wrote one page. Not a design document — a contract, in the sense that either side can be tested against it independently. It lives in the repo next to the models and it is the first thing either of us changes now.

<figure>
<pre><code><span style="color:var(--amber-dim)"># pulse/contract.py — the interface between stage 3 and stage 5</span>
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
<figcaption>FIGURE 1 · THE WHOLE CONTRACT. IT IS DELIBERATELY SHORT ENOUGH TO READ.</figcaption>
</figure>

The assertion on the mean is the useful one. It is crude — a normalised window can legitimately drift — but it has caught the un-normalised case twice since, both times within seconds rather than after an afternoon of staring at a flat line.

### What changed on both sides

| DECISION | BEFORE | NOW |
|---|---|---|
| Normalisation | wherever | CNN side, always |
| Window order | newest first | oldest first |
| No face in frame | zero vector | skip frame |
| Validation | none | on every window |

## Why this took until week eight

Because splitting the pipeline into three models was the right call and we let it hide a cost. Three models mean three people can work at once, and each piece is debuggable on its own — that was the whole argument, and it held. But it also means two interfaces nobody owns, and an interface nobody owns is a place where two reasonable people quietly disagree for three weeks.

This is the part I am least sure about, so I am writing it down rather than pretending it is settled: I do not know whether the right fix is more documents like this one, or fewer seams. For a twelve-week project, the document is cheaper. For anything that lived longer, I suspect we would want the contract to be executable — a shared type, not a page of constants two people have to remember to read.

For now: eleven minutes of video, and the confidence output moves.
