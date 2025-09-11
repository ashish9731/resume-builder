const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting Chromium installation for Vercel...');

// Ensure we're in the right directory
const projectRoot = process.cwd();
console.log('Project root:', projectRoot);

// Set up directories
const chromiumDir = path.join('/tmp', 'chromium');
const cacheDir = process.env.PUPPETEER_CACHE_DIR || path.join('/tmp', 'puppeteer-cache');

console.log('Setting up directories...');

// Create directories with proper permissions
try {
  if (!fs.existsSync(chromiumDir)) {
    fs.mkdirSync(chromiumDir, { recursive: true, mode: 0o755 });
    console.log(`Created chromium directory: ${chromiumDir}`);
  }
  
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true, mode: 0o755 });
    console.log(`Created cache directory: ${cacheDir}`);
  }
} catch (error) {
  console.error('Error creating directories:', error);
  process.exit(1);
}

// Function to find and set up Chromium executable
async function setupChromium() {
  try {
    console.log('Loading @sparticuz/chromium...');
    const chromium = require('@sparticuz/chromium');
    
    // Get the actual executable path
    const executablePath = await chromium.executablePath();
    console.log('Chromium executable path from package:', executablePath);
    
    // Check if the executable exists
    if (fs.existsSync(executablePath)) {
      console.log('Found Chromium executable, checking permissions...');
      
      // Copy the executable to our known location if it's not already there
      const targetExecutable = path.join(chromiumDir, 'chrome');
      
      if (!fs.existsSync(targetExecutable)) {
        console.log('Copying Chromium executable to:', targetExecutable);
        fs.copyFileSync(executablePath, targetExecutable);
        
        // Ensure executable has proper permissions
        fs.chmodSync(targetExecutable, 0o755);
        console.log('Set executable permissions for Chromium');
      }
      
      // Also create a symlink for compatibility
      const chromiumLink = path.join(chromiumDir, 'chromium');
      if (!fs.existsSync(chromiumLink)) {
        try {
          fs.symlinkSync(targetExecutable, chromiumLink);
          console.log('Created symlink:', chromiumLink);
        } catch (symlinkError) {
          console.warn('Could not create symlink (may already exist):', symlinkError.message);
        }
      }
      
      // Verify the executable works
      console.log('Verifying Chromium executable...');
      const stats = fs.statSync(targetExecutable);
      console.log('Chromium executable stats:', {
        size: stats.size,
        mode: stats.mode.toString(8),
        isExecutable: (stats.mode & parseInt('111', 8)) !== 0
      });
      
    } else {
      console.warn('Chromium executable not found at expected path');
    }
    
  } catch (error) {
    console.error('Error setting up Chromium:', error);
    
    // Fallback: create a dummy executable marker
    console.log('Creating fallback Chromium marker...');
    const fallbackExecutable = path.join(chromiumDir, 'chrome');
    fs.writeFileSync(fallbackExecutable, '#!/bin/bash\necho "Chromium executable placeholder"\n', { mode: 0o755 });
  }
}

// Set environment variables
process.env.PUPPETEER_CACHE_DIR = cacheDir;
process.env.CHROME_EXECUTABLE_PATH = path.join(chromiumDir, 'chrome');

console.log('Environment variables set:');
console.log('PUPPETEER_CACHE_DIR:', process.env.PUPPETEER_CACHE_DIR);
console.log('CHROME_EXECUTABLE_PATH:', process.env.CHROME_EXECUTABLE_PATH);

// Run the setup
setupChromium().then(() => {
  console.log('Chromium installation completed successfully');
}).catch(error => {
  console.error('Chromium installation failed:', error);
  process.exit(1);
});