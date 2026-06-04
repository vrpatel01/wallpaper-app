#!/bin/bash
set -e

# Get the absolute path of the mobile-app directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting AOPPA Wallpaper App build using Docker..."
echo "📂 Project directory: $PROJECT_DIR"

if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH."
    echo "Please install Docker to run this build."
    exit 1
fi

# Detect the real invoking user ID and group ID if run with sudo
REAL_UID="${SUDO_UID:-$(id -u)}"
REAL_GID="${SUDO_GID:-$(id -g)}"

# Docker image with Android SDK and JDK 17
DOCKER_IMAGE="reactnativecommunity/react-native-android:v20.1"

# Local cache folder for Gradle to avoid downloading everything every time
CACHE_DIR="$PROJECT_DIR/.docker_gradle_cache"
mkdir -p "$CACHE_DIR"

echo "⏳ Pulling Docker image (if not already local)..."
docker pull "$DOCKER_IMAGE"

echo "🏗️ Running Gradle build inside Docker container..."
echo "Note: The first run will take some time as Gradle downloads dependencies and caches them."

# Run Gradle build inside the container.
# We run as root so the container has full write access to the prebuilt Android SDK dir
# (for installing licenses or platforms if Gradle needs to).
# Then we immediately change ownership of the built files to the host user before exiting.
docker run --rm \
  -v "$PROJECT_DIR:/app" \
  -v "$CACHE_DIR:/root/.gradle" \
  -w /app \
  -e GRADLE_USER_HOME=/root/.gradle \
  -e HOST_UID="$REAL_UID" \
  -e HOST_GID="$REAL_GID" \
  "$DOCKER_IMAGE" \
  bash -c "
    cd android && \
    ./gradlew assembleRelease; \
    status=\$?; \
    echo '🔧 Restoring file ownership inside container...'; \
    chown -R \$HOST_UID:\$HOST_GID /app/android/app/build /root/.gradle; \
    exit \$status
  "

# Ensure host cache directory ownership is also updated if run as sudo
if [ -n "$SUDO_UID" ]; then
    echo "🔧 Restoring cache directory ownership on host..."
    chown -R "$REAL_UID:$REAL_GID" "$CACHE_DIR"
fi

echo "🎉 Build finished successfully!"
echo "📦 APK location: $PROJECT_DIR/android/app/build/outputs/apk/release/app-release.apk"
