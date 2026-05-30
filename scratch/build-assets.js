import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function buildAssets() {
  console.log('Generating unified brand logo assets with increased letter spacing...');

  // 1. Generate the logo.png (sho + [ttt.])
  // Spacing has been adjusted with positive letter-spacing (0.02em) for elegance.
  // The box is at x=430, y=50, width=250, height=200.
  const logoSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="800" height="300" fill="none">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800&amp;display=swap');
        .brand-text {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 800;
          font-size: 160px;
          letter-spacing: 0.02em;
        }
      </style>
      <!-- "sho" in dark charcoal -->
      <text x="130" y="195" class="brand-text" fill="#171717">sho</text>
      
      <!-- Rounded black box for "ttt." -->
      <rect x="430" y="50" width="250" height="200" rx="32" fill="#171717" />
      
      <!-- "ttt." inside the box, matching size, weight and baseline of "sho" -->
      <text x="555" y="195" class="brand-text" fill="#ffffff" text-anchor="middle">ttt.</text>
    </svg>
  `;

  await sharp(Buffer.from(logoSvg))
    .png()
    .toFile('/Users/mahdi.ketabdar/Developer/shottt/public/logo.png');
  console.log('Wordmark logo saved to public/logo.png');

  // 2. Generate the favicon.png & favicon.ico
  // favicon text also matching the new 0.02em letter spacing
  const faviconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240" fill="none">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800&amp;display=swap');
        .favicon-text {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 800;
          font-size: 160px;
          fill: #ffffff;
          letter-spacing: 0.02em;
        }
      </style>
      <rect x="15" y="20" width="210" height="200" rx="32" fill="#171717" />
      <text x="120" y="165" class="favicon-text" text-anchor="middle">ttt.</text>
    </svg>
  `;

  console.log('Generating public/favicon.png (32x32)...');
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .toFile('/Users/mahdi.ketabdar/Developer/shottt/public/favicon.png');

  console.log('Generating public/favicon.ico...');
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .toFile('/Users/mahdi.ketabdar/Developer/shottt/public/favicon.ico');

  console.log('All assets generated successfully!');
}

buildAssets().catch(console.error);
