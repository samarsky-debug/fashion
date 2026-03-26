document.addEventListener('DOMContentLoaded', function() {
    const mainImage = document.getElementById('main-img');
    const thumbnails = document.querySelectorAll('.thumbnails img');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Если уже идёт анимация — игнорируем повторный клик
            if (mainImage.classList.contains('fade-out')) return;

            const newSrc = this.src;

            // Добавляем класс, который запускает исчезновение
            mainImage.classList.add('fade-out');

            // Ждём окончания анимации (0.3с), затем меняем src и убираем класс
            setTimeout(() => {
                mainImage.src = newSrc;
                mainImage.classList.remove('fade-out');
            }, 300); // должно совпадать с transition-duration

            // Обновляем активный класс миниатюр
            thumbnails.forEach(thumb => thumb.classList.remove('active'));
            this.classList.add('active');
        });
    });
});