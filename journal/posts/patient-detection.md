---
layout: post.njk
permalink: "journal/posts/patient-detection.html"
title: "The other branch: what patient detection does when the face isn't enough"
description: "Pulse has a second branch for when the patient is out of bed. It reads the body, not the face. Here is what the demo shows today, and what it doesn't."
ogDescription: "Pulse journal · Engineering · 17 September 2026 · Aaron"
category: "ENGINEERING"
date: 2026-09-17
author: "Aaron"
authorRole: "COMPUTER VISION · ALERTS"
readTime: 5
excerpt: "Pulse has a second branch for when the patient is out of bed. It reads the body instead of the face. Here is what the demo shows today, and what it doesn't yet."
motif: lattice
listMotif: lattice
chainOrder: 0
# Draft pending Aaron's sign-off. Everything below is limited to what the 17 Sep
# recording visibly shows and what the project page already states. Confirm with
# Aaron: the pose model and keypoint count, and the current debugging status.
thumb: /media/Person_Detection_Demo-poster.jpg
thumbAlt: "Webcam frame of a person standing in a hallway with green tracking dots on the face and body, and an overlay reading Patient detected, Posture standing, Movement low."
---
Most of what we write about on this site is the face. That makes sense, because in bed the face is all there is: a blanket hides the body, so the pain branch has to work from expression alone. But a patient is not always in bed, and the moment they are up, the face stops being the most useful thing in the frame.

That is what patient detection is for. It is the out-of-bed branch, and it reads the body instead of the face.

## Why a second branch at all

The two branches answer different questions. The facial branch asks whether someone in bed looks like they are in pain. The pose branch asks where a person's body is and what it is doing: standing, sitting, moving a lot or barely at all. Those need different inputs. A face crop tells you almost nothing about whether someone is upright, and a set of body keypoints tells you almost nothing about a grimace.

So rather than stretch one model across both situations, the pose branch maps the body to a set of keypoints (head, shoulders, elbows, wrists, hips, knees, ankles) and works from their positions over time.

## What the demo shows now

There is finally a recording worth putting up, so here it is.

<figure>
<video controls preload="none" playsinline poster="/media/Person_Detection_Demo-poster.jpg" style="width:100%;display:block;border:1px solid var(--rule-bone-16);background:var(--charcoal)" aria-label="Screen recording of pose tracking on a live webcam feed, with keypoints drawn on a person as they stand, move around and sit down, and readouts for posture and movement level.">
<source src="/media/Person_Detection_Demo.mp4" type="video/mp4" />
</video>
<figcaption>FIGURE 1 · ONE MINUTE OF LIVE WEBCAM INPUT. ONE PERSON, ONE ROOM, STANDING AND SITTING ONLY.</figcaption>
</figure>

Three things are happening on screen:

- **Detection.** When a person is in frame, the overlay says so and draws the keypoints on them, and those points follow along as they walk, turn and wave an arm.
- **A posture label.** Each frame is labelled standing or sitting, shown next to a knee angle. In this recording the sitting frames are the ones where that angle drops to roughly 110 to 120 degrees; standing sits up near 170.
- **A movement level.** An overall movement score, broken down into head, arms, torso and legs, bucketed into low, medium or high.

That is a real step on from where week two left off, when the skeleton was being tracked and nothing was being read from it yet.

<blockquote class="pull-quote"><p>It can tell you someone is standing. It cannot yet tell you whether that should worry anyone.</p></blockquote>

## What it doesn't do yet

I want to be precise here, because a video with labels on it is very easy to over-read.

- **There is no fall detection in this demo.** Nothing in the recording involves lying down or falling, and nothing on screen classifies a fall. Posture is standing or sitting, and that's all it shows.
- **It is not connected to alerts.** The movement level is a number on screen. Nothing downstream acts on it yet, and we have not decided what "high" should mean for a carer.
- **It has been tested in one room, on one person.** Good light, a plain wall, a full body in view. The bedroom at 3am problem from the domain gap entry applies here too, probably worse, because pose needs more of the body visible than the face branch needs of a face.
- **It is still being debugged.** This is a working demo, not a finished component, and I would not trust the posture and movement cutoffs outside this room yet.

## What's next

The obvious next job is the one this branch exists for: deciding what a fall, or a patient who has got up and not come back, actually looks like in keypoints, and then wiring that into the same alert path as the facial branch. I'd rather write about that once it runs than describe it in advance, so for now this is what works, and it's less than it looks like in a demo.
