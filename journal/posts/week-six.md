---
layout: post.njk
permalink: "journal/posts/week-six.html"
title: "Week six: both models trained, and one number I can't explain yet"
description: "I trained the CNN for the first time and the LSTM on top of it. The CNN landed at a test MSE of 1.952. The LSTM, which should have beaten it, came in at 2.243, and I don't know why yet."
ogDescription: "Pulse journal · Build log · 27 September 2026 · Nay Chi"
category: "BUILD LOG"
date: 2026-09-27
author: "Nay Chi"
authorRole: "PROJECT LEAD · DEEP LEARNING · WEB"
readTime: 6
excerpt: "I trained the CNN for the first time and the LSTM on top of it. The model that should have won didn't, and I'd rather show that than the flattering curve."
motif: scatter
listMotif: scatter
chainOrder: 0
thumb: /media/lstm_training_curve.png
thumbAlt: "Line chart of LSTM train and validation MSE over 15 epochs: validation flat near 0.5, training noisy with a spike to 6.9 at epoch 9, and a dotted test-MSE line at 2.243 above both."
thumbPos: "center 60%"
---
This week I trained both models myself, end to end. One of them came out worse than the other, and it is the one that was supposed to be better.

<figure>
<img src="/media/pipeline_diagram.svg" alt="Pipeline diagram, five stages top to bottom: camera; face and pose detection with MediaPipe producing an aligned face crop; CNN producing per-frame features; LSTM reading a trailing window to predict current pain; dashboard alert via a frontend and backend API." style="width:100%;max-width:520px;display:block;border:1px solid var(--rule-bone-16)" />
<figcaption>FIGURE 1 · THE PIPELINE AS IT STANDS IN WEEK 6. THIS POST IS ABOUT STAGES 03, 04 AND 05.</figcaption>
</figure>

## The CNN had never been trained

When I opened the CNN to wire the LSTM onto it, I found the backbone fully frozen. Nothing in it had ever been fit to our data. Every feature vector it had produced so far came from weights that knew nothing about pain.

So I trained it, with three changes:

- **Unfroze layer4 and the head.** The earlier layers stay frozen; the last block and the head now actually learn.
- **Inverse-frequency weighted loss.** About 94% of our frames are pain-free. [As the dataset post showed](/journal/posts/shape-of-pain.html), that imbalance is structural, not a preprocessing problem, so the fix has to live in the loss: without weighting, predicting "no pain" on every frame is almost free.
- **Matched preprocessing to the live pipeline.** Training was using a plain resize. The live pipeline feeds the CNN an aligned face crop. A model trained on one and served the other is being tested on a distribution it never saw, which is exactly the kind of mismatch [the contract](/journal/posts/contract.html) was written to catch. Training now uses the same aligned-crop approach.

It landed at an unweighted test MSE of **1.952**. Unweighted matters here: the weighting is for training, and the number I report is plain MSE so it can be compared straight across to the LSTM.

## The LSTM, and the gap

The LSTM takes the CNN's per-frame features, windows them, and predicts current pain from the trailing window. It is the whole reason our architecture has two stages: pain [builds and holds](/journal/posts/shape-of-pain.html), so a model that sees the last stretch of frames should do at least as well as one that sees a single frame.

It doesn't. Test MSE is **2.243**, against the CNN's 1.952 at frame level.

<figure>
<img src="/media/lstm_training_curve.png" alt="Line chart of LSTM MSE over 15 epochs. Validation MSE, solid purple, sits between 0.5 and 1.0 throughout and ends at 0.502 at epoch 15, the best checkpoint. Training MSE, dashed amber, is noisy between 0.5 and 2.2 with a spike to 6.939 at epoch 9. A dotted horizontal line marks the test MSE of 2.243, above the validation curve for the entire run." style="width:100%;display:block;border:1px solid var(--rule-bone-16)" />
<figcaption>FIGURE 2 · LSTM TRAIN AND VALIDATION MSE PER EPOCH. VALIDATION ENDED AT 0.502 (BEST CHECKPOINT). TEST MSE ON THAT SAME CHECKPOINT WAS 2.243.</figcaption>
</figure>

I want to be upfront about this chart, because without the dotted line it looks great. Validation MSE settles around 0.5 and finishes at 0.502, the best checkpoint of the run. Put that checkpoint on the test set and it scores 2.243, more than four times worse. A curve that only shows train and validation would hide the most important thing about this model right now.

I haven't explained the gap yet. My leading suspicion is the split rather than the model. With 25 subjects, [which people end up in the test set moves the number a lot](/journal/posts/shape-of-pain.html), and a small test split can make a reasonable model look bad (or a bad one look reasonable). But that is a hypothesis, not a finding, and I'm still working through it. Until I can say which it is, the honest summary is: the LSTM currently underperforms the CNN, and I don't know why.

## Off Streamlit

We are moving the dashboard off Streamlit. It can't handle the latency and alert timing a hospital setting needs: an alert that arrives late or on an unpredictable schedule is worse than no alert, because a carer learns not to trust it. The dashboard is being rebuilt as a proper frontend talking to a backend API, which is stage 05 in Figure 1.

## Everyone else

- **Kate's** CAD design for the cube-shaped monitor is nearly done, and the hardware has arrived at Makerspace for assembly.
- **Naguib** joined the team this week and is leading hardware integration and camera placement. Welcome, Naguib.
- **Aaron** is refining body-part weighting in the detection system.
- **Christopher** is researching environmental sensors.

All of it is aimed at the showcase on 7 October.

## Close unresolved

The showcase is ten days out and the model that is supposed to carry our temporal argument is currently losing to the one it sits on top of. Next week is finding out whether that is the split or the LSTM, before we put either number in front of anyone.
