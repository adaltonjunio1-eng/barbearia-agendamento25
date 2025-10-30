const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateIcon(size) {
  const src = path.resolve(__dirname, '..', 'assets', 'logo', 'icon.svg');
  const out = path.resolve(__dirname, '..', `icon-${size}.png`);
  const svgBuffer = fs.readFileSync(src);
  const bg = { r: 15, g: 20, b: 25, alpha: 1 }; // #0f1419
  await sharp(svgBuffer, { density: 384 })
    .resize(size, size, { fit: 'contain', background: bg })
    .flatten({ background: bg }) // garante fundo sólido
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✓ Gerado ${path.basename(out)}`);
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
