# Kiko's Island

A play app for young children, built for an Amazon Fire HD 10 tablet. Kiko is a
blue, four-armed alien living on a Filipino island who teaches Tagalog words.

## What's in it so far

- **Home island** – tap Kiko, the sun, the bahay kubo, the bangka and more. Each
  one reacts, and its Tagalog name is shown and spoken.
- **Drawing studio** – colours, a rainbow brush, stamps, undo and colouring pages.
- **My Art** – a gallery of saved pictures, kept on the device.

## Play it

https://mbruno429.github.io/kiko-island/

## Run it

```bash
npm install
```

```bash
npm run dev
```

## Build and publish

```bash
npm run build
```

This type-checks, then writes one self-contained page that works offline:

- `dist/index.html` – the build output.
- `index.html` at the repo root – a copy of it. GitHub Pages serves this file straight
  from the `main` branch, so **commit it together with any change to `src/`**. Never edit
  it by hand. A GitHub Actions check fails if it is out of date.

Pushing to `main` updates the public page within a minute or so.

## Spoken words

Tapping something on the home island says its Tagalog name. The clips are in
`src/voice/`, one MP3 per word, named after the `voice` id in `src/home.ts`. They are
built into the page, so speech works offline.

`scripts/make-voice.sh` makes them with the eSpeak NG synthesizer (it needs `espeak-ng`
and `ffmpeg`). eSpeak NG has no Tagalog voice, so each word is written out as sounds
with its Tagalog stress; the comments in the script explain the notation. To add or
change a word, edit the list at the bottom of the script, then:

```bash
bash scripts/make-voice.sh
```

```bash
npm run build
```

To use a real recording for a word instead, replace its MP3 in `src/voice/` with a
short, trimmed, mono clip and rebuild.

## Layout

- `src/index.html` – the page shell
- `src/home.ts` – the island scene
- `src/kiko.ts` – the alien character
- `src/studio.ts`, `src/stamps.ts`, `src/pages.ts` – drawing studio, stamps, colouring pages
- `src/gallery.ts`, `src/store.ts` – saved pictures (IndexedDB)
- `src/audio.ts` – synthesised sound effects
- `src/voice.ts`, `src/voice/` – the spoken Tagalog words
- `scripts/postbuild.mjs` – copies the build to the repo root and makes a preview fragment
- `scripts/make-voice.sh` – generates the spoken-word clips
