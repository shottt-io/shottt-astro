import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function buildAssets() {
  const sourceImage = '/Users/mahdi.ketabdar/.gemini/antigravity/brain/d4612747-c68e-4c15-ad23-97363535eaf8/shottt_square_logo_1780148643771.png';
  const croppedPath = '/Users/mahdi.ketabdar/Developer/shottt/scratch/cropped.png';

  console.log('Cropping source image to get clean square logo...');
  // 1. Crop to extract the black square logo without the background gradient
  await sharp(sourceImage)
    .extract({ left: 130, top: 130, width: 763, height: 763 })
    .toFile(croppedPath);
  console.log('Clean square logo saved to scratch/cropped.png');

  // 2. Generate favicon.png (32x32)
  console.log('Generating public/favicon.png (32x32)...');
  await sharp(croppedPath)
    .resize(32, 32)
    .toFile('/Users/mahdi.ketabdar/Developer/shottt/public/favicon.png');

  // 3. Generate favicon.ico (32x32, PNG container)
  console.log('Generating public/favicon.ico...');
  await sharp(croppedPath)
    .resize(32, 32)
    .toFile('/Users/mahdi.ketabdar/Developer/shottt/public/favicon.ico');

  // 4. Generate the wordmark logo
  console.log('Generating wordmark logo (sho + [ttt.])...');
  const croppedBase64 = fs.readFileSync(croppedPath).toString('base64');
  
  // We construct an SVG containing the text "sho" and the base64-embedded square icon.
  // The spacing is carefully calculated:
  // - "sho" text starts at x=155, y=210.
  // - The square icon is 180x180 pixels, placed at x=465, y=60.
  const svgLogo = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="800" height="300" fill="none">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300&amp;display=swap');
        .brand-sho {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 300;
          font-size: 160px;
          fill: #171717;
        }
      </style>
      <text x="145" y="210" class="brand-sho" letter-spacing="-0.04em">sho</text>
      <image x="455" y="60" width="180" height="180" href="data:image/png;base64,${croppedBase64}" />
    </svg>
  `;

  // Render the SVG to a 800x300 PNG image
  await sharp(Buffer.from(svgLogo))
    .png()
    .toFile('/Users/mahdi.ketabdar/Developer/shottt/public/logo.png');

  console.log('Wordmark logo saved to public/logo.png');
  console.log('All assets generated successfully!');
}

buildAssets().catch(console.error);
