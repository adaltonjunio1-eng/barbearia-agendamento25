const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateIcon(size) {
  // Prioriza PNG, depois SVG
  const pngSrc = path.resolve(__dirname, '..', 'assets', 'logo', 'icon.png');
  const svgSrc = path.resolve(__dirname, '..', 'assets', 'logo', 'icon.svg');
  const src = fs.existsSync(pngSrc) ? pngSrc : svgSrc;
  
  const out = path.resolve(__dirname, '..', `icon-${size}.png`);
  const bg = { r: 47, g: 56, b: 64, alpha: 1 }; // dark background
  
  const sharpInstance = src.endsWith('.svg') 
    ? sharp(fs.readFileSync(src), { density: 384 })
    : sharp(src);
  
  await sharpInstance
    .resize(size, size, { fit: 'contain', background: bg })
    .flatten({ background: bg })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✓ Gerado ${path.basename(out)} de ${path.basename(src)}`);
}

(async () => {
  try {
    await generateIcon(192);
    await generateIcon(512);
    console.log('Ícones gerados com sucesso.');
  } catch (e) {
    console.error('Falha ao gerar ícones:', e);
    process.exit(1);
  }
})();
