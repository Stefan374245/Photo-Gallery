@echo off
REM Firebase Functions Deployment Script
REM This script configures and deploys the AI Photo Enhancer Cloud Function

echo ========================================
echo Firebase Functions Deployment
echo AI Photo Enhancer Setup
echo ========================================
echo.

echo Step 1: Installing dependencies...
cd functions
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo Step 2: Setting Replicate API Key...
echo WICHTIG: Bitte ersetzen Sie YOUR_API_KEY mit Ihrem echten Replicate API-Key!
firebase functions:config:set replicate.key="YOUR_REPLICATE_API_KEY_HERE"

if %errorlevel% neq 0 (
    echo ERROR: Failed to set API key
    pause
    exit /b 1
)

echo.
echo Step 3: Verifying configuration...
firebase functions:config:get

echo.
echo Step 4: Deploying Firestore rules...
firebase deploy --only firestore:rules

if %errorlevel% neq 0 (
    echo WARNING: Failed to deploy Firestore rules
    echo Continuing with functions deployment...
)

echo.
echo Step 5: Deploying functions...
firebase deploy --only functions

if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Functions deployed
echo ========================================
echo.
echo Your AI Photo Enhancer is now live!
echo.
echo IMPORTANT: 
echo - CORS is configured for localhost:4200
echo - Base64 images are supported
echo - Enhancement time: 15-60 seconds for Base64 images
echo.
echo Test it by clicking the enhance button on any photo.
echo.
pause
