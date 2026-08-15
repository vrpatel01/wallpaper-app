# wallpaper-app — Learnings

`DEVELOPMENT_LOG.md` is the step-by-step build narrative (how the app was put together, in order).
This file is the fleet-standard gotchas/decisions log instead — what went wrong or had to be
figured out, independent of the build order. Complements it, doesn't repeat it.

## Decisions

### Docker build made self-sufficient from a clean checkout ("zero-dependency builds")

The build script originally assumed `node_modules/` and `android/` already existed on the host
before running the Docker build. It was changed to check for both inside the container and run
`npm install` / `npx expo prebuild --platform android --no-install` itself if missing, rather than
requiring host-side setup first. Worth applying to any future Docker-based mobile build script in
this fleet — don't assume the host has already done npm/prebuild steps the container can just do
itself.

## Gotchas found

### ProGuard/R8 + dynamic ABI splits, needed to get the APK down to ~15MB

Enabled via the `expo-build-properties` plugin (`enableProguardInReleaseBuilds` +
`enableShrinkResourcesInReleaseBuilds` in `app.json`), alongside dynamic ABI splits in the build
script. Without this, a release build ships all architectures' native code plus unminified JS —
worth checking for on any other React Native/Expo app in this fleet that ships a release build.

## Future ideas

(nothing logged yet)

## Open questions

- No test files or CI exist yet (confirmed by the peer-comparison audit) — same honest gap
  `AGENTS.md` §8 already accepts fleet-wide, not specific to this project.
