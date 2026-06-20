# 🍓 Jass's Birthday Page

A little strawberry-themed birthday site: greeting screen → click to enter →
spin a wheel of names → an envelope pops open with that person's message.

## Files
```
jass-birthday/
├── index.html       ← page structure (2 screens + envelope overlay)
├── style.css         ← strawberry/pink/green aesthetic, all animations
├── script.js          ← wheel spin logic, envelope reveal, music handling
├── messages.js         ← ⭐ EDIT THIS to add more birthday greetings
└── audio/
    ├── README.md        ← instructions for adding the music file
    └── dahil-minahal-mo-ako.mp3   ← (you add this — see audio/README.md)
```

## Adding more greetings
Open `messages.js`. Each person is one block:
```js
{
  name: "Their Name",
  message: "Their message here."
},
```
Copy an existing block, paste it before the closing `];`, fill in the name
and message, save. The wheel and envelope pick it up automatically — no
other file needs to change.

## Adding the music
See `audio/README.md` — short version: name the MP3 file exactly
`dahil-minahal-mo-ako.mp3` and put it in the `audio/` folder.

## Deploying with GitHub Pages
1. Create a new GitHub repo (e.g. `jass-birthday`) and push all these files
   to it (keeping the same folder structure, especially `audio/`).
2. In the repo: **Settings → Pages → Source** → select your default branch
   (usually `main`) and root folder (`/`) → Save.
3. GitHub gives you a URL like `https://yourusername.github.io/jass-birthday/`
   — that's the link to send Jass.
4. It can take a minute or two after pushing for the site to go live/update.

## Notes
- Works on mobile and desktop (the wheel and envelope both resize).
- Music starts only after the "click me 🍓" button is tapped — browsers
  block autoplay before any user interaction, so this is the cleanest way
  to guarantee it plays.
- There's a small speaker button in the bottom-right of the main screen to
  mute/unmute if needed.
