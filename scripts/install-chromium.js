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

// Function to download and set up Chromium
async function setupChromium() {
  try {
    console.log('Installing Chromium using puppeteer...');
    
    // Use puppeteer to install Chrome
    const { execSync } = require('child_process');
    
    // Install Chrome using puppeteer browsers command
    console.log('Downloading Chromium...');
    const installOutput = execSync('npx puppeteer browsers install chrome', { encoding: 'utf8' });
    console.log('Installation output:', installOutput);
    
    // Extract the path from the output
    const pathMatch = installOutput.match(/chrome@[^\s]+\s+(.+)$/m);
    if (pathMatch && pathMatch[1]) {
      const chromePath = pathMatch[1].trim();
      console.log('Found Chrome at:', chromePath);
      
      // Copy the executable to our known location
      const targetExecutable = path.join(chromiumDir, 'chrome');
      
      if (!fs.existsSync(targetExecutable)) {
        console.log('Copying Chromium executable to:', targetExecutable);
        fs.copyFileSync(chromePath, targetExecutable);
        
        // Ensure executable has proper permissions
        fs.chmodSync(targetExecutable, 0o755);
        console.log('Set executable permissions for Chromium');
      }
      
      // Create a symlink for backward compatibility
      const chromiumLink = path.join(chromiumDir, 'chromium');
      if (!fs.existsSync(chromiumLink)) {
        try {
          fs.symlinkSync(targetExecutable, chromiumLink);
          console.log('Created symlink:', chromiumLink);
        } catch (symlinkError) {
          console.warn('Could not create symlink:', symlinkError.message);
        }
      }
      
      // Create additional symlinks for different expected names
      const chromeLink = path.join(chromiumDir, 'chrome-linux');
      if (!fs.existsSync(chromeLink)) {
        try {
          fs.symlinkSync(targetExecutable, chromeLink);
          console.log('Created chrome-linux symlink');
        } catch (e) {
          console.warn('Could not create chrome-linux symlink');
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
      console.error('Could not extract Chrome path from installation output');
      
      // Create a fallback
      const fallbackExecutable = path.join(chromiumDir, 'chrome');
      fs.writeFileSync(fallbackExecutable, `#!/bin/bash
# Chromium fallback script
echo "Starting Chromium..."
# Try to find Chrome in common locations
CHROME_PATHS=("/usr/bin/google-chrome" "/usr/bin/chromium-browser" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
for path in "\${CHROME_PATHS[@]}"; do
  if [ -x "$path" ]; then
    exec "$path" "$@"
  fi
done
echo "Chrome not found in common locations"
exit 1
`, { mode: 0o755 });
      console.log('Created fallback Chromium launcher');
    }
    
  } catch (error) {
    console.error('Error setting up Chromium:', error);
    
    // Create a more sophisticated fallback
    console.log('Creating enhanced fallback Chromium setup...');
    const fallbackExecutable = path.join(chromiumDir, 'chrome');
    
    // Create a shell script that will try to find Chromium
    const fallbackScript = `#!/bin/bash
# Enhanced Chromium fallback script
CHROMIUM_PATHS="/tmp/chromium/chrome /usr/bin/chromium-browser /usr/bin/google-chrome /usr/bin/chrome /opt/google/chrome/chrome"

for chromium_path in $CHROMIUM_PATHS; do
  if [ -x "$chromium_path" ]; then
    echo "Found Chromium at: $chromium_path"
    exec "$chromium_path" "$@"
  fi
done

echo "No Chromium executable found in fallback paths"
exit 1
`;

    fs.writeFileSync(fallbackExecutable, fallbackScript, { mode: 0o755 });
    console.log('Created enhanced fallback Chromium launcher');
  }
}

// Set environment variables
process.env.PUPPETEER_CACHE_DIR = cacheDir;
process.env.CHROME_EXECUTABLE_PATH = path.join(chromiumDir, 'chrome');
process.env.CHROMIUM_EXECUTABLE_PATH = path.join(chromiumDir, 'chrome');

console.log('Environment variables set:');
console.log('PUPPETEER_CACHE_DIR:', process.env.PUPPETEER_CACHE_DIR);
console.log('CHROME_EXECUTABLE_PATH:', process.env.CHROME_EXECUTABLE_PATH);

// Run the setup
setupChromium().then(() => {
  console.log('Chromium installation completed successfully');
  
  // Final verification
  const finalExecutable = path.join(chromiumDir, 'chrome');
  if (fs.existsSync(finalExecutable)) {
    console.log('✅ Chromium executable verified at:', finalExecutable);
  } else {
    console.warn('⚠️ Chromium executable not found at final location');
  }
  
}).catch(error => {
  console.error('Chromium installation failed:', error);
  process.exit(1);
});