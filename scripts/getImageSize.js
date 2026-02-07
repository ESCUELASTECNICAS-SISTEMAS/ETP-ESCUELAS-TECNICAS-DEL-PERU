const fs = require('fs');

function getJpegSize(buffer) {
  let i = 0;
  if (buffer.readUInt16BE(0) !== 0xFFD8) return null;
  i += 2;
  while (i < buffer.length) {
    if (buffer[i] !== 0xFF) return null;
    let marker = buffer[i + 1];
    i += 2;
    // Skip padding FFs
    while (marker === 0xFF) {
      marker = buffer[i];
      i += 1;
    }
    // SOF0 (0xC0), SOF2 (0xC2) contain size
    if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2 || marker === 0xC3 || marker === 0xC5 || marker === 0xC6 || marker === 0xC7 || marker === 0xC9 || marker === 0xCA || marker === 0xCB || marker === 0xCD || marker === 0xCE || marker === 0xCF) {
      const blockLength = buffer.readUInt16BE(i);
      const height = buffer.readUInt16BE(i + 3);
      const width = buffer.readUInt16BE(i + 5);
      return { width, height };
    } else {
      const blockLength = buffer.readUInt16BE(i);
      i += blockLength;
    }
  }
  return null;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node getImageSize.js <image1.jpg> [image2.jpg ...]');
  process.exit(1);
}

args.forEach(path => {
  try {
    const buf = fs.readFileSync(path);
    const size = getJpegSize(buf);
    if (size) {
      console.log(`${path}: ${size.width} x ${size.height}`);
    } else {
      console.log(`${path}: unknown or not a JPEG`);
    }
  } catch (err) {
    console.log(`${path}: error - ${err.message}`);
  }
});
