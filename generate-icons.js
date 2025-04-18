// Скрипт для генерации простых иконок для PWA
const fs = require('fs');
const { createCanvas } = require('canvas');

// Размеры иконок для генерации
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Основной цвет из нашего приложения
const iconBgColor = '#4A90E2';
const textColor = '#FFFFFF';

// Генерация иконок
iconSizes.forEach(size => {
    // Создаем канвас указанного размера
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Рисуем фон
    ctx.fillStyle = iconBgColor;
    ctx.fillRect(0, 0, size, size);
    
    // Рисуем круг в центре
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Рисуем галочку внутри круга
    ctx.fillStyle = iconBgColor;
    ctx.beginPath();
    const checkSize = size / 4;
    const centerX = size / 2;
    const centerY = size / 2;
    ctx.moveTo(centerX - checkSize / 2, centerY);
    ctx.lineTo(centerX - checkSize / 4, centerY + checkSize / 2);
    ctx.lineTo(centerX + checkSize / 2, centerY - checkSize / 2);
    ctx.lineWidth = size / 15;
    ctx.strokeStyle = iconBgColor;
    ctx.stroke();
    
    // Отображаем размер иконки (только для больших иконок)
    if (size >= 128) {
        ctx.fillStyle = textColor;
        ctx.font = `bold ${size / 10}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${size}px`, size / 2, size - size / 15);
    }
    
    // Сохраняем иконку в файл
    const buffer = canvas.toBuffer('image/png');
    const iconPath = `./images/icons/icon-${size}x${size}.png`;
    
    // Записываем файл
    fs.writeFileSync(iconPath, buffer);
    console.log(`Создана иконка: ${iconPath}`);
});

console.log('Все иконки успешно созданы!'); 