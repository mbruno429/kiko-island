# Kiko's Island

A play app for young children, built for an Amazon Fire HD 10 tablet. Kiko is a
blue, four-armed alien living on a Filipino island who teaches Tagalog words.

## What's in it so far

- **Home island** – tap Kiko, the sun, the bahay kubo, the bangka and more. Each
  one reacts, and Kiko says its Tagalog name.
- **Drawing studio** – colours, a rainbow brush, stamps, undo and colouring pages.
- **My Art** – a gallery of saved pictures, kept on the device.

## Run it

```bash
npm install
```

```bash
npm run dev
```

`npm run build` type-checks and writes a single self-contained `dist/index.html`
that works offline.

## Layout

- `src/home.ts` – the island scene
- `src/kiko.ts` – the alien character
- `src/studio.ts`, `src/stamps.ts`, `src/pages.ts` – drawing studio, stamps, colouring pages
- `src/gallery.ts`, `src/store.ts` – saved pictures (IndexedDB)
- `src/audio.ts` – synthesised sound effects
