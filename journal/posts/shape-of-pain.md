---
layout: post.njk
permalink: "journal/posts/shape-of-pain.html"
title: "We checked whether pain has a shape before we built a model that assumes it does"
description: "Before training anything, I plotted 48,398 frames of the UNBC-McMaster dataset. What the filenames were hiding, what the shape of pain looks like, and the ceiling we cannot engineer past."
ogDescription: "Pulse journal · Research · 13 September 2026 · Nay Chi"
category: "RESEARCH"
date: 2026-09-13
author: "Nay Chi"
authorRole: "PROJECT LEAD · DEEP LEARNING · WEB"
readTime: 9
excerpt: "Before training anything, I plotted 48,398 frames of the dataset. One finding validated our architecture. One we cannot engineer our way past."
motif: scatter
listMotif: scatter
chainOrder: 1
thumb: /media/highest_pain_seq.png
thumbAlt: "Six line charts of PSPI pain intensity over time for the highest-pain sequences, each rising, holding and decaying rather than spiking."
---
Dataset access came through on Monday. The first thing I did was not train anything.

25 subjects. 200 sequences. 48,398 frames. Before any of that touches a model, I wanted to know what was actually in it.

## The thing hiding in the filenames

Every sequence name in UNBC-McMaster parses the same way: subject, trial, movement, limb. I'd read that structure as bookkeeping and moved on the first time I saw it. Looking properly, the limb field is not bookkeeping: it is `aff` or `unaff`, and `unaff` means the unaffected shoulder. The clinician ran the same range-of-motion test on the arm that doesn't hurt.

109 sequences are the painful arm. 91 are the other one.

That is a control condition, built into the dataset, that none of us had noticed. We had been thinking of our negatives as "frames that happened to be neutral," background we'd absorb wherever it showed up, when closer to a third of the data is structurally non-painful by design, from a limb a clinician chose specifically because it wasn't the problem. It also hands us a test nobody had proposed: a model that understands pain should stay quiet on `unaff` sequences almost by construction. If it doesn't, that's not noise to average out, that's the model reacting to the movement itself rather than the pain.

## The question that mattered

Our whole architecture is a bet that pain has temporal structure. The LSTM reads a 32-frame window and outputs one confidence number for it. If PSPI (the frame-level pain intensity score the dataset ships with) spiked for two or three frames and vanished, a 32-frame window would have almost nothing to learn from, and we would have built the wrong shape of model before writing a line of training code.

So before committing to that architecture, I plotted it.

<figure>
<img src="/media/highest_pain_seq.png" alt="Line charts of PSPI intensity across six sequences with the highest recorded pain, each showing a ramp, a hold, and a decay, with a dashed reference line at PSPI 2." style="width:100%;display:block;border:1px solid var(--rule-bone-16)" />
<figcaption>FIGURE 1 · SIX HIGHEST-PAIN SEQUENCES. EPISODES RAMP OVER 20–40 FRAMES, HOLD, THEN DECAY. DASHED LINE IS PSPI 2.</figcaption>
</figure>

It builds. Every one of the six highest-pain sequences shows the same shape: a rise over 20 to 40 frames, a plateau, a decay, not a spike. That validates the window size we'd already committed to, and it means max-in-window labelling (taking the highest PSPI value inside a window as that window's label) is a defensible choice rather than a shortcut we'd have to justify later.

## What is harder

<figure>
<img src="/media/pspi_info.png" alt="Two histograms of PSPI scores across all 48,398 frames, linear and log scale, both dominated by a large bar at PSPI 0." style="width:100%;display:block;border:1px solid var(--rule-bone-16)" />
<figcaption>FIGURE 2 · PSPI DISTRIBUTION ACROSS ALL 48,398 FRAMES, LINEAR AND LOG.</figcaption>
</figure>

Most frames are neutral. On the linear axis almost everything else disappears into the floor; the log axis is the only reason you can see that pain exists in this dataset at all. The imbalance is structural. It is what pain looks like on video, not a preprocessing problem, and no amount of augmentation manufactures pain that was not there in the first place.

<figure>
<img src="/media/class_balance.png" alt="Line chart of positive rate at each PSPI threshold from 1 to 5, plotted for frame-level, window max-rule, and window sustained-rule labelling." style="width:100%;display:block;border:1px solid var(--rule-bone-16)" />
<figcaption>FIGURE 3 · POSITIVE RATE AT EACH PSPI THRESHOLD, UNDER TWO LABELLING RULES.</figcaption>
</figure>

Pick threshold 1 and a quarter of our windows are positive. Pick threshold 5 and it's under 5%. That is a modelling choice with real consequences for precision, recall, and what an "alert" ends up meaning at the showcase, and we have not settled it.

## The uncomfortable one

<figure>
<img src="/media/VAS_OPR_vs_facial_signal.png" alt="Two scatter plots of maximum PSPI per sequence against patient self-reported VAS score and against trained-observer OPR score, with correlation coefficients 0.59 and 0.74." style="width:100%;display:block;border:1px solid var(--rule-bone-16)" />
<figcaption>FIGURE 4 · WHAT THE PATIENT REPORTED AGAINST WHAT THEIR FACE SHOWED.</figcaption>
</figure>

I want to be honest about this one rather than let it sit quietly in a supplementary folder. VAS is what the patient said their pain was. PSPI is what a trained coding system read from their face. The correlation between them is r = 0.59. Against a trained observer's rating it rises to 0.74: a face is easier to grade than it is to match against what the patient says they are feeling, and the two only agree moderately even when a human is doing the reading. That is the ceiling on what any camera-based system can do, including ours, and it exists before a single neural network gets involved. This belongs on the project page, next to the numbers we're claiming, not buried at the bottom of a journal post where it's easy to skim past.

## Close unresolved

25 subjects means a single train/test split is fragile. Hold out five people and the result you report depends materially on which five: a different split can move our headline number more than a genuine architecture change would. We are switching to grouped k-fold, splitting by subject so no person's frames appear in both train and test, and reporting a range rather than a point estimate.

The threshold is still open. I don't have a principled answer yet for which PSPI cutoff defines "positive," and I would rather say that plainly than pick one now and back-justify it later.
