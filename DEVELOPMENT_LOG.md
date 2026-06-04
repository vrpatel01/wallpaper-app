# AOPPA Wallpaper Changer - Development Log

This document records the exact step-by-step process followed to construct the React Native Expo wallpaper changer application from scratch.

---

## Step 1: Initializing the Project
We bootstrapped the React Native application using Expo to provide a solid foundation for both fast React development and modular native code extensions.

```bash
cd /home/nono/Documents/codebase/aoppa/mobile-app
npx create-expo-app@latest . --template blank
```

---

## Step 2: Configure Android Metadata & Permissions
To allow the app to access local gallery photos and change the system lock/home screen wallpapers, we configured `app.json` with permissions and an explicit package identifier:

1. **Permissions added:**
   - `android.permission.SET_WALLPAPER` (allows setting system background)
   - `android.permission.READ_MEDIA_IMAGES` (required for Android 13+)
   - `android.permission.READ_EXTERNAL_STORAGE` (fallback for older Android versions)
2. **Package Name:** Set to `com.aoppa.wallpaper`.

---

## Step 3: Scaffold the Custom Native Kotlin Module
Expo does not expose Android's `WallpaperManager` API out of the box. To bridge this, we created a local native module named `my-module`:

1. **Scaffold the module:**
   ```bash
   npx create-expo-module --local modules/my-module
   ```
2. **Write Kotlin Logic (`MyModule.kt`):**
   Located at `modules/my-module/android/src/main/java/expo/modules/mymodule/MyModule.kt`. 
   We implemented a Kotlin function `setWallpaper` that:
   - Takes a file URI string.
   - Normalizes the path (e.g. strips `file://`).
   - Obtains the Android `WallpaperManager` instance.
   - Converts the file into a `Bitmap` factory.
   - Sets the wallpaper to the Home Screen (`FLAG_SYSTEM`), Lock Screen (`FLAG_LOCK`), or both.
3. **Expose to TypeScript (`MyModule.ts`):**
   Located at `modules/my-module/src/MyModule.ts`. We imported the native method and exposed it as:
   ```typescript
   export function setWallpaper(uri: string, screenType: 'home' | 'lock' | 'both'): boolean;
   ```

---

## Step 4: Implement Gallery Picker & UI Layout
We designed a dark-themed glassmorphic UI inside `App.js` with the following integrations:

1. **Dependencies:** Installed `@react-native-async-storage/async-storage` and `expo-image-picker`.
2. **Image Picking:** Integrated `expo-image-picker` to let the user browse their device gallery.
3. **Bypass Option (Crop vs Default):** Added an "Enable Cropping" toggle. When toggled OFF (default), it immediately processes the chosen raw image; when ON, it prompts Expo's built-in cropper at a 9:16 portrait aspect ratio.
4. **Targeting Toggles:** Checkboxes to set the image to the Home Screen, Lock Screen, or Both.

---

## Step 5: Implement Headless Background Scheduler
To enable the background rotation of wallpapers, we built a headless task:

1. **Registered Task Manager:** Integrated `expo-task-manager` and `expo-background-fetch`.
2. **Persistent Storage Pool:** Built storage logic using `AsyncStorage` to save a list of chosen wallpaper image paths (the "Wallpaper Pool").
3. **Headless Execution:** Configured a task named `BACKGROUND_WALLPAPER_ROTATOR`. When triggered by the Android OS (configured for a 15-minute interval), it runs in the background, selects a random image URI from the pool, and applies it using the native `setWallpaper` module.

---

## Step 6: Generate Native Wrappers (Prebuild)
Since the app uses native Kotlin code, we ran Expo prebuild to generate the concrete `android` project directory containing Gradle build sheets:

```bash
npx expo prebuild --clean
```

---

## Step 7: Configure Docker Compilation Pipeline
To build the standalone APK locally without requiring you to install Java or the Android SDK on your host Linux system, we set up a Docker compilation environment:

1. **Dockerized build script:** Created `build-android-docker.sh`.
2. **Volume caching:** Mounted a local `.docker_gradle_cache` workspace directory to `/root/.gradle` inside the container.
3. **Ownership mapping:** Passed host `HOST_UID=$(id -u)` and `HOST_GID=$(id -g)` environments to the container so that it automatically chowns compiled files from `root` back to your user account (`nono`), avoiding any permission blocks or need for host-side `sudo chown`.
4. **Git settings:** Appended `/.docker_gradle_cache/` to `.gitignore`.
