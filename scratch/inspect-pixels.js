import sharp from 'sharp';

async function scanImage() {
  const imagePath = '/Users/mahdi.ketabdar/.gemini/antigravity/brain/d4612747-c68e-4c15-ad23-97363535eaf8/shottt_square_logo_1780148643771.png';
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // Scan the horizontal line at y = height / 2
  const centerY = Math.floor(height / 2);
  const rowPixels = [];
  for (let x = 0; x < width; x++) {
    const idx = (centerY * width + x) * info.channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    rowPixels.push({ x, brightness });
  }

  // Find the bounding box
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // The square is extremely dark (brightness < 5)
      if (brightness < 5) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Bounding box: x=${minX}, y=${minY}, width=${maxX - minX}, height=${maxY - minY}`);
}

scanImage().catch(console.error);
