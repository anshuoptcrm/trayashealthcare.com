// Product Buy Page JS: Handles cart and UI interactions

document.addEventListener('DOMContentLoaded', function() {
    // Sample product data (replace with real data or fetch from server)
    const products = [
        {
            id: 1,
            name: 'MoxyLune-Kid',
            image: 'images/Products/Moxylune Kid Forte.png',
            price: 120,
            desc: 'Antibiotic syrup for kids. 60ml.'
        },
        {
            id: 2,
            name: 'MoxyLune CV 625',
            image: 'images/Products/Moxylune CV 625.png',
            price: 250,
            desc: 'Broad spectrum antibiotic. 10 tablets.'
        },
        {
            id: 3,
            name: 'Luclo P',
            image: 'images/Products/Luclo p.png',
            price: 90,
            desc: 'Pain relief tablets. 10 tablets.'
        }
        // Add more products as needed
    ];

    const productGrid = document.getElementById('product-grid');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const cartModalBody = document.getElementById('cart-modal-body');
    const cartModalTotal = document.getElementById('cart-modal-total');
    const cartModalCheckout = document.getElementById('cart-modal-checkout');
    let cart = [];

    // Render products
    function renderProducts() {
        productGrid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card wow fadeInUp';
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="desc">${product.desc}</p>
                    <div class="product-price">₹${product.price}</div>
                    <button class="btn-add-cart" data-id="${product.id}"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    // Add to cart
    productGrid.addEventListener('click', function(e) {
        if (e.target.closest('.btn-add-cart')) {
            const id = parseInt(e.target.closest('.btn-add-cart').dataset.id);
            const product = products.find(p => p.id === id);
            const cartItem = cart.find(item => item.id === id);
            if (cartItem) {
                cartItem.qty += 1;
            } else {
                cart.push({ ...product, qty: 1 });
            }
            updateCartCount();
            showCartModal();
        }
    });

    // Update cart count
    function updateCartCount() {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    }

    // Show cart modal with editable qty and checkout form
    let checkoutMode = false;
    function showCartModal() {
        cartModalBody.innerHTML = '';
        let total = 0;
        if (cart.length === 0) {
            cartModalBody.innerHTML = '<p>Your cart is empty.</p>';
            cartModalCheckout.style.display = 'none';
        } else if (!checkoutMode) {
            cart.forEach(item => {
                total += item.price * item.qty;
                const row = document.createElement('div');
                row.className = 'cart-item-row';
                row.innerHTML = `
                    <span>${item.name}</span>
                    <span>
                        <button class="btn-qty" data-id="${item.id}" data-action="decr" style="margin-right:4px;">-</button>
                        <input type="number" min="1" value="${item.qty}" data-id="${item.id}" class="cart-qty-input" style="width:38px;text-align:center;">
                        <button class="btn-qty" data-id="${item.id}" data-action="incr" style="margin-left:4px;">+</button>
                    </span>
                    <span>₹${item.price * item.qty}</span>
                    <button class="btn-remove-item" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
                `;
                cartModalBody.appendChild(row);
            });
            cartModalCheckout.textContent = 'Checkout';
            cartModalCheckout.style.display = 'block';
        } else {
            // Show address/email form
            cartModalBody.innerHTML = `
                <form id="order-form">
                    <div style="margin-bottom:10px;">
                        <label><b>Full Name</b></label><br>
                        <input type="text" name="name" required style="width:100%;padding:6px;">
                    </div>
                    <div style="margin-bottom:10px;">
                        <label><b>Address</b></label><br>
                        <textarea name="address" required style="width:100%;padding:6px;min-height:60px;"></textarea>
                    </div>
                    <div style="margin-bottom:10px;">
                        <label><b>Email</b></label><br>
                        <input type="email" name="email" required style="width:100%;padding:6px;">
                    </div>
                    <button type="submit" class="cart-modal-checkout" style="margin-top:8px;">Place Order</button>
                </form>
            `;
            cartModalCheckout.style.display = 'none';
        }
        cartModalTotal.textContent = 'Total: ₹' + total;
        cartModal.style.display = 'block';
    }

    // Cart modal events: remove, qty change, checkout form
    cartModalBody.addEventListener('click', function(e) {
        // Remove item
        if (e.target.closest('.btn-remove-item')) {
            const id = parseInt(e.target.closest('.btn-remove-item').dataset.id);
            cart = cart.filter(item => item.id !== id);
            updateCartCount();
            showCartModal();
        }
        // Qty increment/decrement
        if (e.target.classList.contains('btn-qty')) {
            const id = parseInt(e.target.dataset.id);
            const action = e.target.dataset.action;
            const item = cart.find(i => i.id === id);
            if (item) {
                if (action === 'incr') item.qty++;
                if (action === 'decr' && item.qty > 1) item.qty--;
                updateCartCount();
                showCartModal();
            }
        }
    });
    // Qty input direct edit
    cartModalBody.addEventListener('input', function(e) {
        if (e.target.classList.contains('cart-qty-input')) {
            const id = parseInt(e.target.dataset.id);
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            const item = cart.find(i => i.id === id);
            if (item) {
                item.qty = val;
                updateCartCount();
            }
        }
    });
    // Handle order form submit
    cartModalBody.addEventListener('submit', function(e) {
        if (e.target.id === 'order-form') {
            e.preventDefault();
            const form = e.target;
            const order = {
                name: form.name.value,
                address: form.address.value,
                email: form.email.value,
                cart: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price }))
            };
            // Send order to backend (AJAX)
            fetch('sendorder.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            })
            .then(res => res.ok ? res.text() : Promise.reject(res.status))
            .then(() => {
                cartModalBody.innerHTML = '<div style="text-align:center;padding:30px 0;"><i class="fa-solid fa-circle-check" style="color:#25D366;font-size:2.5rem;"></i><br><b>Order successfully placed!</b></div>';
                cart = [];
                updateCartCount();
                checkoutMode = false;
            })
            .catch(() => {
                cartModalBody.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:20px 0;">Failed to send order. Please try again.</div>';
            });
        }
    });

    // Close modal on outside click
    cartModal.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Checkout button: show address/email form
    cartModalCheckout.addEventListener('click', function() {
        checkoutMode = true;
        showCartModal();
    });

    // Cart icon click
    document.getElementById('cart-icon').addEventListener('click', function() {
        checkoutMode = false;
        showCartModal();
    });

    // Initial render
    renderProducts();
    updateCartCount();
});
