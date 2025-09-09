// Custom script to ensure Chromium is properly installed for Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running custom Chromium installation script...');

// Create cache directory
const cacheDir = process.env.PUPPETEER_CACHE_DIR || '/tmp/puppeteer-cache';
if (!fs.existsSync(cacheDir)) {
  console.log(`Creating cache directory: ${cacheDir}`);
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
  } catch (err) {
    console.error(`Failed to create cache directory ${cacheDir}:`, err);
  }
}

// Set environment variables
process.env.PUPPETEER_CACHE_DIR = cacheDir;

// Create additional directories that might be needed
const additionalDirs = [
  '/tmp/chromium',
  '/var/task/.next/server/app/api/bin'
];

for (const dir of additionalDirs) {
  try {
    if (!fs.existsSync(dir)) {
      console.log(`Creating additional directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.error(`Failed to create directory ${dir}:`, err);
  }
}

// Try to load @sparticuz/chromium
try {
  const chromium = require('@sparticuz/chromium');
  console.log('Successfully loaded @sparticuz/chromium');
  
  // Try to get the executable path
  try {
    chromium.executablePath()
      .then(execPath => {
        console.log('Chromium executable path:', execPath);
        if (fs.existsSync(execPath)) {
          console.log('Chromium executable exists!');
        } else {
          console.log('Chromium executable does not exist');
          // We'll handle this in the PDF generation code
        }
      })
      .catch(error => {
        console.error('Error getting executable path:', error);
      });
  } catch (pathError) {
    console.error('Error checking executable path:', pathError);
  }
} catch (error) {
  console.error('Error loading @sparticuz/chromium:', error);
  console.log('This is expected during build. The PDF generation code will handle this at runtime.');
}

console.log('Chromium setup completed');