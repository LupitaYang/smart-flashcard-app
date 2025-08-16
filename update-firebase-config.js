#!/usr/bin/env node

// Firebase Configuration Update Script
// This script helps you update your Firebase configuration

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Configuration Update Helper');
console.log('=====================================\n');

console.log('To update your Firebase configuration:');
console.log('1. Go to your Firebase Console: https://console.firebase.google.com/');
console.log('2. Select your project');
console.log('3. Go to Project Settings (gear icon)');
console.log('4. Scroll to "Your apps" section');
console.log('5. If you don\'t have a web app, click "Add app" → Web');
console.log('6. Copy the Firebase configuration object\n');

console.log('Your configuration should look like this:');
console.log(`
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
`);

console.log('\nCurrent configuration in auth-app.js:');
const authAppPath = path.join(__dirname, 'auth-app.js');
const authAppContent = fs.readFileSync(authAppPath, 'utf8');

// Extract current config
const configMatch = authAppContent.match(/const firebaseConfig = \{[\s\S]*?\};/);
if (configMatch) {
    console.log(configMatch[0]);
} else {
    console.log('Configuration not found in auth-app.js');
}

console.log('\n📝 To update your configuration:');
console.log('1. Edit auth-app.js');
console.log('2. Replace the firebaseConfig object with your actual values');
console.log('3. Save the file');
console.log('4. Run: firebase deploy');

console.log('\n🚀 Once updated, you can deploy with:');
console.log('cd /Users/jinqinyang/src/smart-flashcard-app');
console.log('firebase login');
console.log('firebase init (if not already initialized)');
console.log('firebase deploy');
