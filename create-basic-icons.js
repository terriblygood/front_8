// Простой скрипт для генерации базовых SVG-иконок
const fs = require('fs');
const path = require('path');

// Размеры иконок
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Создаем директорию, если она не существует
const iconsDir = path.join(__dirname, 'images', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log(`Создана директория: ${iconsDir}`);
}

// Генерация SVG-иконок для каждого размера
sizes.forEach(size => {
    // Генерация SVG разметки
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#4A90E2" />
    <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="white" />
    <path d="M${size/2-size/6},${size/2} L${size/2},${size/2+size/8} L${size/2+size/4},${size/2-size/4}" 
          stroke="#4A90E2" stroke-width="${size/15}" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    ${size >= 128 ? `<text x="${size/2}" y="${size-size/15}" 
          font-family="Arial" font-size="${size/10}" text-anchor="middle" fill="white">${size}px</text>` : ''}
</svg>`;

    // Сохраняем SVG в файл
    const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    fs.writeFileSync(filePath, svgContent);
    console.log(`Создана иконка SVG: ${filePath}`);
});

console.log("Все SVG-иконки успешно созданы!"); 