# Hello World Static Website

This is a simple static website template ready to be deployed with Firebase Hosting.

## Files
- `index.html`: Main HTML file
- `styles.css`: Basic styling
- `script.js`: Simple JavaScript

## Deployment
1. Install Firebase CLI if you haven't already:
   ```powershell
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```powershell
   firebase login
   ```
3. Initialize Firebase in this directory:
   ```powershell
   firebase init hosting
   ```
   - Select `public` directory as `.` (current directory)
   - Configure as a single-page app: `No`
   - Overwrite `index.html`: `No`
4. Deploy:
   ```powershell
   firebase deploy
   ```

Your site will be live on your Firebase Hosting URL!
