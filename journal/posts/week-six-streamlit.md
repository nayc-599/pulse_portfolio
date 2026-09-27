---
layout: post.njk
permalink: "journal/posts/week-six-streamlit.html"
title: "Week six: moving the dashboard off Streamlit"
description: "Streamlit can't handle the latency and alert timing a hospital needs, so the carer dashboard is moving to a proper frontend and a backend API."
ogDescription: "Pulse journal · Engineering · 26 September 2026 · Nay Chi"
category: "ENGINEERING"
date: 2026-09-26
author: "Nay Chi"
authorRole: "PROJECT LEAD · DEEP LEARNING · WEB"
readTime: 2
excerpt: "A decision, not a writeup: the carer dashboard is moving off Streamlit, because an alert that arrives late is worse than no alert."
motif: lattice
listMotif: lattice
chainOrder: -2
---
We are moving the carer dashboard off Streamlit.

The reason is timing. Streamlit can't handle the latency and alert timing a hospital setting needs, and in that setting an alert that arrives late, or on an unpredictable schedule, is worse than no alert at all: a carer learns not to trust it.

So the dashboard is being rebuilt as a proper frontend talking to a backend API. That is stage 05 in [the pipeline diagram](/journal/posts/week-six-training.html).

That's the whole decision. What the new stack looks like is a post for when it exists.
