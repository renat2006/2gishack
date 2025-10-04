const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const createPlaceholderSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size / 8}" fill="#ffffff" text-anchor="middle" dy=".3em">
    2GIS
  </text>
  <text x="50%" y="65%" font-family="Arial" font-size="${size / 12}" fill="#ffffff" text-anchor="middle" dy=".3em">
    ${size}x${size}
  </text>
</svg>
`;

console.log('📱 Генерация placeholder иконок для PWA...\n');

sizes.forEach((size) => {
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, createPlaceholderSVG(size));
  console.log(`✓ Создан ${filename}`);
});

console.log('\n✅ Все placeholder иконки созданы!');
console.log('\n⚠️  ВАЖНО: Замените SVG placeholder на настоящие PNG иконки перед production деплоем.');
console.log('Используйте инструменты:');
console.log('- https://github.com/elegantapp/pwa-asset-generator');
console.log('- https://realfavicongenerator.net/');


