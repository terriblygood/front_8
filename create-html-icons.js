// Генерация HTML-иконок для всех требуемых размеров
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

// Функция для создания HTML-иконки
function createHtmlIcon(size) {
    // Вычисляем размеры внутренних элементов относительно размера иконки
    const circleSize = Math.round(size / 3);
    const fontSize = Math.round(size / 4);
    const showSizeText = size >= 128;
    
    // Создаем HTML-разметку для иконки
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Иконка ${size}x${size}</title>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 0;
            width: ${size}px;
            height: ${size}px;
            background-color: #4A90E2;
            overflow: hidden;
            box-sizing: border-box;
        }
        .circle {
            width: ${circleSize}px;
            height: ${circleSize}px;
            background-color: white;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .check {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #4A90E2;
            font-size: ${fontSize}px;
            font-weight: bold;
            line-height: 1;
        }
        ${showSizeText ? `
        .size-text {
            position: absolute;
            bottom: ${Math.round(size/20)}px;
            left: 0;
            right: 0;
            text-align: center;
            color: white;
            font-family: Arial, sans-serif;
            font-size: ${Math.round(size/10)}px;
            font-weight: bold;
        }` : ''}
    </style>
</head>
<body>
    <div class="circle">
        <div class="check">✓</div>
    </div>
    ${showSizeText ? `<div class="size-text">${size}px</div>` : ''}
</body>
</html>`;

    // Сохраняем в файл
    const filePath = path.join(iconsDir, `icon-${size}x${size}.html`);
    fs.writeFileSync(filePath, htmlContent);
    console.log(`Создана HTML-иконка: ${filePath}`);
}

// Создаем иконки для всех размеров
sizes.forEach(size => {
    createHtmlIcon(size);
});

console.log("Все HTML-иконки успешно созданы!"); 