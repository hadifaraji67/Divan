#!/bin/bash

# ۱. ایجاد پوشه و تنظیم فایل ورک‌فلوی GitHub Actions برای بیلد خودکار APK
mkdir -p .github/workflows
cat << 'ES1' > .github/workflows/build-android.yml
name: Build Android APK

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Web Assets
        run: npm run build

      - name: Setup Java JDK
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Sync Capacitor Android
        run: npx cap sync android

      - name: Build Android APK (Debug/Unsigned)
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug --stacktrace

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v3
        with:
          name: divan-app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk
ES1

# ۲. ثبت تغییرات فاز ۴ در Git و Push به GitHub
git add .
git commit -m "Feat: Complete Phase 4 - Configure GitHub Actions Workflow for Automatic Android APK Build"
git push origin main

echo "✅ تنظیمات فاز ۴ اعمال شد و خودکار روی گیت‌هاب آپلود شد."
