console.log('script loaded');
document.addEventListener('DOMContentLoaded', function() {
  (function() {
    const CART_STORAGE_KEY = 'fashionFutureCart';

    // DOM-элементы корзины
    const cartIcon = document.getElementById('cartIconBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartPanel = document.getElementById('cartPanel');
    const closeCart = document.getElementById('closeCart');
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!cartIcon || !cartOverlay || !cartPanel) return;

    let cart = [];

    function loadCart() {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      cart = stored ? JSON.parse(stored) : [];
      renderCart();
    }

    function saveCart() {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
      });
    }

    function renderCart() {
      if (!cartItemsDiv || !cartTotalSpan) return;

      if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        cartTotalSpan.textContent = '0 ₽';
        return;
      }

      let html = '';
      let totalSum = 0;
      cart.forEach(item => {
        totalSum += item.price * item.quantity;
        html += `
          <div class="cart-item" data-cartid="${item.cartId}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='../img/t-shirt.jpg'">
            <div class="cart-item-info">
              <div class="cart-item-title">${escapeHtml(item.name)}</div>
              <div class="cart-item-size">Размер: ${escapeHtml(item.size)}</div>
              <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
              <div class="cart-item-actions">
                <button class="decrease-qty">−</button>
                <span>${item.quantity}</span>
                <button class="increase-qty">+</button>
                <span class="remove-item" title="Удалить">🗑️</span>
              </div>
            </div>
          </div>
        `;
      });
      cartItemsDiv.innerHTML = html;
      cartTotalSpan.textContent = `${totalSum.toLocaleString()} ₽`;

      document.querySelectorAll('.decrease-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cartItemDiv = e.target.closest('.cart-item');
          if (cartItemDiv) updateQuantity(cartItemDiv.dataset.cartid, -1);
        });
      });
      document.querySelectorAll('.increase-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cartItemDiv = e.target.closest('.cart-item');
          if (cartItemDiv) updateQuantity(cartItemDiv.dataset.cartid, 1);
        });
      });
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cartItemDiv = e.target.closest('.cart-item');
          if (cartItemDiv) removeItem(cartItemDiv.dataset.cartid);
        });
      });
    }

    function addToCart(product) {
      const cartId = `${product.id}_${product.size}`;
      const existing = cart.find(item => item.cartId === cartId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...product, cartId, quantity: 1 });
      }
      saveCart();
      renderCart();
    }

    function updateQuantity(cartId, delta) {
      const index = cart.findIndex(item => item.cartId === cartId);
      if (index === -1) return;
      const newQuantity = cart[index].quantity + delta;
      if (newQuantity > 0) {
        cart[index].quantity = newQuantity;
      } else {
        cart.splice(index, 1);
      }
      saveCart();
      renderCart();
    }

    function removeItem(cartId) {
      cart = cart.filter(item => item.cartId !== cartId);
      saveCart();
      renderCart();
    }

    function openCart() {
      cartOverlay.classList.add('active');
      cartPanel.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeCartPanel() {
      cartOverlay.classList.remove('active');
      cartPanel.classList.remove('active');
      document.body.style.overflow = '';
    }

    cartIcon.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartPanel);
    cartOverlay.addEventListener('click', closeCartPanel);

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
          alert('Ваша корзина пуста');
          return;
        }
        alert('Спасибо за заказ! (демонстрация) Мы свяжемся с вами.');
        cart = [];
        saveCart();
        renderCart();
        closeCartPanel();
      });
    }

    // Обработчик выбора размера (для страницы товара)
    const sizeBadges = document.querySelectorAll('.size-badge');
    sizeBadges.forEach(badge => {
      badge.addEventListener('click', function() {
        sizeBadges.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });

    // Глобальный обработчик для кнопок добавления в корзину
    document.body.addEventListener('click', (e) => {
      // Ищем кнопку по одному из возможных классов
      const addBtn = e.target.closest('.add-to-cart, .add-to-cart-btn');
      if (!addBtn) return;
      e.preventDefault();

      let product = null;

      // 1. Если кнопка находится внутри .description-section (страница товара)
      const productContainer = addBtn.closest('.description-section');
      if (productContainer) {
        const id = productContainer.dataset.id;
        const nameEl = productContainer.querySelector('.product-title');
        const name = nameEl ? nameEl.innerText.trim() : 'Товар';
        const priceEl = productContainer.querySelector('.price');
        let price = 0;
        if (priceEl) {
          const priceText = priceEl.innerText.replace(/[^0-9]/g, '');
          price = parseInt(priceText, 10);
        }
        const mainImg = document.getElementById('main-img');
        const image = mainImg ? mainImg.src : '../img/t-shirt.jpg';
        const activeSize = productContainer.querySelector('.size-badge.active');
        const size = activeSize ? activeSize.innerText.trim() : 'M';

        if (id && !isNaN(price) && price > 0) {
          product = { id, name, price, image, size };
        }
      }
      // 2. Иначе – если кнопка внутри .product (каталог)
      else {
        const productCard = addBtn.closest('.product');
        if (productCard) {
          const id = productCard.dataset.id;
          const name = productCard.dataset.name;
          const price = parseInt(productCard.dataset.price, 10);
          const image = productCard.dataset.image;
          // Если размер не выбран, ставим по умолчанию "M"
          const size = 'M';

          if (id && name && !isNaN(price) && price > 0 && image) {
            product = { id, name, price, image, size };
          }
        }
      }

      if (!product) {
        console.warn('Не удалось собрать данные товара', addBtn);
        return;
      }

      addToCart(product);

      // Визуальный фидбек
      const originalText = addBtn.innerText;
      addBtn.innerText = '✓ Добавлено';
      setTimeout(() => { addBtn.innerText = originalText; }, 800);
    });

    loadCart();
  })();
});

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