# wallpaper-app

An Android wallpaper-rotation app built with React Native/Expo. Pick images from the gallery (or
build a pool of them) and either apply one immediately to the home screen, lock screen, or both —
or let a background task rotate a random pick from the pool automatically.

Branded internally as "AOPPA Wallpaper Changer" (package `com.aoppa.wallpaper`, a holdover from
when this lived as the `mobile-app` subfolder of an earlier combined "aoppa" project before being
split into its own repo) — unrelated to the separate `aoppa` repo in this fleet, which is now just
research notes. Same legacy name, two different, independent projects.

## What it does

- **Manual set**: browse the gallery (`expo-image-picker`), optionally crop to a 9:16 portrait
  (toggleable — off by default, applies the raw image as-is), then apply to home screen, lock
  screen, or both.
- **Automatic rotation**: build a "Wallpaper Pool" of chosen images (persisted via
  `AsyncStorage`), and a headless background task (`expo-task-manager` + `expo-background-fetch`,
  ~15-minute interval) picks a random one from the pool and applies it — no app interaction
  needed once the pool is set.
- Expo doesn't expose Android's `WallpaperManager` API directly, so wallpaper-setting itself goes
  through a small local native Kotlin module (`modules/my-module`) exposed to the JS side as
  `setWallpaper(uri, screenType)`.

See `DEVELOPMENT_LOG.md` for the full step-by-step build history.

---

## Quick Start (Linux dev machine, physical Android device via Expo Go)

### Prerequisites
- **Node.js**: `v20.19.2`
- **npm**: `9.2.0`

### Run it
```bash
npm install
npm run start
```
Install **Expo Go** on your Android phone, make sure phone and dev machine are on the same Wi-Fi,
then scan the QR code the terminal prints.

> Native module code (the Kotlin `WallpaperManager` bridge) won't run inside Expo Go — you need a
> prebuilt/dev-client build (see below) to actually test wallpaper-setting, not just the UI.

## Local Android Emulator Setup (Linux)

1. Enable KVM: `egrep -c '(vmx|svm)' /proc/cpuinfo` (>0 means supported), then
   `sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils && sudo usermod -aG kvm $USER`
   (log out/in for the group change to apply).
2. Install Android Studio, create an AVD via Device Manager.
3. With the emulator running, press `a` in the Expo terminal menu.

## Building an APK

Since this app has native Kotlin code, it needs a real Android build, not just Expo Go:

```bash
npx expo prebuild --clean
```

Then either:
- **EAS Build** (cloud, no local Android SDK needed): `eas build --platform android`
- **Local, via Docker** (no Java/Android SDK on the host — see `build-android-docker.sh`,
  `project-framework/AGENTS.md` §6 for the house pattern this should eventually match): builds
  inside a container, mounts a local Gradle cache, chowns output back to your user.
