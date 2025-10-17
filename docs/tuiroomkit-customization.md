# TUIRoomKit Embed Notes

The nobar page now loads Tencent RTC's **TUIRoomKit** build from `public/tuiroomkit/index.html`. The bundle was generated from the open-source project that lives in `TUIRoomKit/Web/example/vite-vue3-ts`.

## Rebuilding the bundle

```
cd TUIRoomKit/Web/example/vite-vue3-ts
npm install
npm run build
```

The build output appears under `dist/`. Copy or sync the contents of that folder to `public/tuiroomkit/` (overwrite the existing files) so the iframe used by `Room/Show.tsx` picks up the change.

## Basic SDK configuration

- Edit `src/config/basic-info-config.js` before building.
- Replace `SDKAPPID`, `SDKSECRETKEY`, and tweak the exported `userInfo` object for your default avatar/name.
- The file still uses the demo `LibGenerateTestUserSig`. For production you must move the UserSig generation to your own backend.

## Custom colours and typography

All visual tokens resolve to CSS variables that end up in `public/tuiroomkit/assets/roomkit-*.css`. You have two options:

1. **Quick tweak** – edit the CSS variables in `roomkit-*.css` (look for `--uikit-color-...`). This survives page reloads but will be overwritten the next time you rebuild.
2. **Source-first tweak** – override the same variables in the Vue source before building. A safe place is `src/components/TUIRoom/components/Chat/ChatKit/assets/styles/color.scss` together with related SCSS files. After editing, rebuild and copy the output as described above.

Use the `ThemeOption` enum (LIGHT/DARK) in `src/views/home.vue` if you only need to switch between the built-in palettes.

## Custom icons and imagery

SVG assets used by the UI live under:

```
src/components/TUIRoom/components/**/assets/icon/*.svg
```

Replace the SVGs you need (keep the original filenames) and rebuild. The bundler inlines the updated icons into the generated `roomkit-*.js`.

## Runtime options from the iframe

The iframe URL accepts query parameters consumed by the Vue app:

- `roomId`: pre-fills the room number (`Room/Show.tsx` already sets this).
- `lang`: force a locale, e.g. `lang=id-ID` or `lang=en-US`.

Additional runtime behaviour (theme, mic defaults, etc.) is controlled inside the Vue source (`src/views/home.vue` and `src/views/room.vue`).

## Legacy Jitsi page

A copy of the previous Jitsi-based implementation is stored in `resources/js/Pages/Room/LegacyJitsiRoom.tsx`. Swap the Inertia render target if you ever need to restore it.
