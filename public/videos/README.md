# Show hero videos

Drop finished clips in here and the show pages pick them up automatically —
no code or frontmatter changes needed. Each show looks for a file named
after its slug:

```
public/videos/fleetwood-mac.webm
public/videos/fleetwood-mac.mp4
public/videos/queen.webm
public/videos/queen.mp4
public/videos/tribute-mad.webm
public/videos/tribute-mad.mp4
```

Add either format on its own, or both (recommended — WebM is
significantly smaller and is what most browsers will actually use; MP4 is
there for Safari/older browsers that don't support VP9 WebM). A show with
no files here just keeps showing its poster image, so there's no rush to
do all three at once.

## What to export

- **Length:** roughly 8–18 seconds, trimmed so the last frame flows back
  into the first — the video loops seamlessly and silently in the
  background. There's no hard limit; longer just means a bigger file.
- **No audio.** The player is always muted, so strip the audio track
  entirely — it shrinks the file and avoids any risk of it playing with
  sound.
- **Resolution:** 1920×1080 is plenty; this plays as a cropped background,
  never full native resolution. Busy, high-motion footage (stage lighting,
  crowds, camera movement) compresses much worse than static shots —
  1280×720 is often the better choice for this kind of clip (see "Still
  too heavy?" below).
- **File size:** aim for well under 5MB per file. A well-compressed
  18-second silent clip at this length usually lands at 2–4MB — busy
  concert/stage footage can land noticeably heavier at the same CRF.

## Suggested ffmpeg commands

Run from the folder holding your edited, trimmed source clip
(`source.mov` below — swap in your actual filename), once per show. Trim
the source itself to your loop point first — these commands don't cut the
clip, just re-encode it:

```sh
# WebM (VP9) — primary, smallest file
ffmpeg -i source.mov -vf "scale=1920:-2" -an \
  -c:v libvpx-vp9 -crf 32 -b:v 0 \
  fleetwood-mac.webm

# MP4 (H.264) — fallback for Safari and older browsers
ffmpeg -i source.mov -vf "scale=1920:-2" -an \
  -c:v libx264 -crf 23 -preset slow -movflags +faststart \
  fleetwood-mac.mp4
```

Lower the `-crf` number for higher quality/larger files, raise it for
smaller/lower quality (roughly 28–36 is the useful range for VP9, 20–28
for H.264).

## Still too heavy?

If you're already at the aggressive end of the CRF range (32–36 for VP9)
and the file's still bigger than you'd like, pushing CRF even higher
starts trading size for visible blockiness — better to pull one of these
levers instead, which usually buy back more size than CRF alone with less
quality loss:

```sh
# WebM (VP9)
ffmpeg -i source.mov \
  -vf "scale=1280:-2,fps=24,hqdn3d=1.5:1.5:6:6" -an \
  -c:v libvpx-vp9 -crf 34 -b:v 0 \
  fleetwood-mac.webm

# MP4 (H.264) — same filter chain, kept in sync with the WebM above
ffmpeg -i source.mov \
  -vf "scale=1280:-2,fps=24,hqdn3d=1.5:1.5:6:6" -an \
  -c:v libx264 -crf 26 -preset slow -movflags +faststart \
  fleetwood-mac.mp4
```

- `scale=1280:-2` — downscale to 720p. This is the biggest win: it's a
  background layer behind a scrim and text, so full 1080p detail is
  wasted anyway.
- `fps=24` — caps the frame rate if your source is 30/60fps. Drop it
  further (e.g. `fps=18`) for a slow, ambient loop with no visible cost.
- `hqdn3d=1.5:1.5:6:6` — a light denoise pass. Camera sensor noise in
  low-light stage footage is expensive to encode (the compressor wastes
  bits preserving random grain); smoothing it slightly first often saves
  more than raising CRF does.

The MP4 command bumps CRF from the earlier 23 to 26 — still within the
20–28 useful range for H.264, just leaning toward the smaller end to
match the WebM's own move to a heavier CRF (32→34).

## Behaviour to expect

The hero always shows the poster image first and only loads/plays a video
if the visitor's browser allows autoplay, they haven't set "reduce
motion", and their connection isn't flagged as Data Saver or a slow
(2G/3G-class) connection — so nothing extra is ever downloaded for
visitors who wouldn't see it play anyway. When a video is playing, a
small pause/play icon button appears bottom-right of the hero (required
by WCAG for looping auto-playing motion) — it swaps icon on click and
carries an accessible label ("Pause/Play background video") for screen
readers and as a hover tooltip.
