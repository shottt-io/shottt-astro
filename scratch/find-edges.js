import sharp from 'sharp';

async function findEdges() {
  const imagePath = '/Users/mahdi.ketabdar/.gemini/antigravity/brain/d4612747-c68e-4c15-ad23-97363535eaf8/shottt_square_logo_1780148643771.png';
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  const getBrightness = (x, y) => {
    const idx = (y * width + x) * info.channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  const threshold = 5;

  // Scan inwards from Left
  let leftEdge = 0;
  for (let x = 0; x < centerX; x++) {
    // Check if there is a vertical column where the dark square starts
    // In the column, the pixels belonging to the square will be near-black (brightness < threshold)
    // Let's check a few rows around the center
    let darkCount = 0;
    for (let y = centerY - 100; y <= centerY + 100; y++) {
      if (getBrightness(x, y) < threshold) darkCount++;
    }
    if (darkCount > 150) { // If most rows in this column are dark
      leftEdge = x;
      break;
    }
  }

  // Scan inwards from Right
  let rightEdge = width - 1;
  for (let x = width - 1; x > centerX; x--) {
    let darkCount = 0;
    for (let y = centerY - 100; y <= centerY + 100; y++) {
      if (getBrightness(x, y) < threshold) darkCount++;
    }
    if (darkCount > 150) {
      rightEdge = x;
      break;
    }
  }

  // Scan inwards from Top
  let topEdge = 0;
  for (let y = 0; y < centerY; y++) {
    let darkCount = 0;
    for (let x = centerX - 100; x <= centerX + 100; x++) {
      if (getBrightness(x, y) < threshold) darkCount++;
    }
    if (darkCount > 150) {
      topEdge = y;
      break;
    }
  }

  // Scan inwards from Bottom
  let bottomEdge = height - 1;
  for (let y = height - 1; y > centerY; y--) {
    let darkCount = 0;
    for (let x = centerX - 100; x <= centerX + 100; x++) {
      if (getBrightness(x, y) < threshold) darkCount++;
    }
    if (darkCount > 150) {
      bottomEdge = y;
      break;
    }
  }

  console.log(`Edges: Left=${leftEdge}, Right=${rightEdge}, Top=${topEdge}, Bottom=${bottomEdge}`);
  console.log(`Square size: Width=${rightEdge - leftEdge}, Height=${bottomEdge - topEdge}`);
}

findEdges().catch(console.error);
