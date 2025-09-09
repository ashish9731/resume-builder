// Custom script to ensure Chromium is properly installed for Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running custom Chromium installation script...');

// Create cache directory
const cacheDir = process.env.PUPPETEER_CACHE_DIR || '/tmp/puppeteer-cache';
if (!fs.existsSync(cacheDir)) {
  console.log(`Creating cache directory: ${cacheDir}`);
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Set environment variables
process.env.PUPPETEER_CACHE_DIR = cacheDir;

try {
  // Try to load @sparticuz/chromium
  const chromium = require('@sparticuz/chromium');
  console.log('Chromium version:', chromium.version);
  
  // Ensure the executable path exists
  chromium.executablePath()
    .then(execPath => {
      console.log('Chromium executable path:', execPath);
      if (fs.existsSync(execPath)) {
        console.log('Chromium executable exists!');
      } else {
        console.log('Chromium executable does not exist, attempting installation...');
        // Force reinstall
        try {
          execSync('node node_modules/@sparticuz/chromium/install.js', { stdio: 'inherit' });
          console.log('Chromium installation completed');
        } catch (installError) {
          console.error('Error during Chromium installation:', installError);
        }
      }
    })
    .catch(error => {
      console.error('Error getting executable path:', error);
    });
} catch (error) {
  console.error('Error loading @sparticuz/chromium:', error);
}

// Create alternative directories that might be used
const altDirs = [
  '/tmp/chromium',
  '/var/task/.next/server/app/api/bin'
];

altDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating alternative directory: ${dir}`);
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      console.error(`Failed to create directory ${dir}:`, err);
    }
  }
});

console.log('Chromium setup completed');