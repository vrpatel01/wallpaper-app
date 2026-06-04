# AOPPA Mobile App

This repository houses the mobile application codebase for **AOPPA**, built using React Native and the Expo ecosystem. The development workflow is optimized for Linux systems targeting Android devices.

---

## 🚀 Quick Start Guide

Since we are utilizing **Expo**, you can develop and run the application on a physical Android device without needing a full Android SDK setup on your Linux development machine.

### Prerequisites (Verified on Local System)
- **Node.js**: `v20.19.2`
- **npm**: `9.2.0`
- **Git**: Installed for asset tracking

### 1. Bootstrapping the Project
To initialize the React Native project inside this repository using the latest Expo template:
```bash
# From the parent directory (or run locally in this folder after cleaning up)
npx create-expo-app@latest .
```

> [!WARNING]
> If you bootstrap using the command above in this directory, make sure to back up or restore this `README.md` if the generator overwrites it.

### 2. Starting the Development Server
Once initialized, launch the local Bundler:
```bash
npm run start
```

### 3. Testing on a Physical Phone (Expo Go)
1. Install the **Expo Go** application from the Google Play Store on your Android phone.
2. Ensure both your **Linux computer** and your **Android phone** are connected to the **same Wi-Fi network**.
3. Run `npm run start` in your terminal. A large QR code will be displayed.
4. Open **Expo Go** on your device, select **"Scan QR Code"**, and scan the terminal QR code. The app will compile and load instantly.

---

## 🛠️ Advanced: Local Android Emulator Setup (Linux)

If you prefer to run a virtual Android device (emulator) on Linux rather than a physical phone, you will need to set up KVM and Android Studio.

### 1. Enable KVM (Hardware Virtualization)
To run emulators at hardware speed, verify KVM support:
```bash
egrep -c '(vmx|svm)' /proc/cpuinfo
```
*(A output > 0 indicates support)*

Install KVM packages on Debian/Ubuntu:
```bash
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils
sudo usermod -aG kvm $USER
```
> [!NOTE]
> Log out and log back in for group membership changes to take effect.

### 2. Configure Android Studio & Emulator
1. Install Android Studio (e.g. via Flatpak: `flatpak install flathub com.google.AndroidStudio`).
2. Open Android Studio, navigate to **Device Manager**, and create a virtual device (AVD).
3. With the emulator running, press `a` in your Expo terminal menu to launch the application on the emulator.

---

## 📂 Standard Directory Structure

Once bootstrapped, your project structure will look like this:
```text
mobile-app/
├── App.js                # Main entry point (App logic & Dashboard layout)
├── app.json              # Configuration metadata (name, icons, splash screens)
├── assets/               # Local static resources (images, icons, etc.)
├── node_modules/         # Package dependencies (installed via npm)
├── package.json          # Dependency manifest and scripts
└── README.md             # This documentation
```

---

## 📦 Building & Publishing (Generating an APK)

To build a production-ready package (`.apk` or `.aab`):

### Option A: EAS Build (Cloud-based - Recommended)
Uses Expo's cloud infrastructure so you don't need Android build tools installed locally.
1. Install EAS CLI: `npm install -g eas-cli`
2. Log in or create an account: `eas login`
3. Configure the build: `eas build:configure`
4. Build the Android APK: `eas build --platform android`

### Option B: Local Prebuild & Compile (Self-hosted)
1. Prebuild the native Android wrapper:
   ```bash
   npx expo prebuild
   ```
2. Build the APK locally using Gradle (requires Android SDK and Java installed):
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   *Output APK location: `android/app/build/outputs/apk/release/`*
