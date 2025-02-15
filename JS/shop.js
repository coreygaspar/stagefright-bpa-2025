let cartCount = 0;
let display = document.getElementById("cartCounter");

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let c of ca) {
        c = c.trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return "";
}

// Add global locks for spam click prevention
let addToCartLock = false;
let checkOutLock = false;
// Add global lock for buildCart spam prevention
let buildCartLock = false;

// New global for collapse timeout management
let collapseTimeout = null;

function AddToCart(index) {
    cartCount += 1;

    let productElem = document.querySelectorAll('.card')[index];
    let productName = productElem.querySelector('span').innerHTML;
    let priceText = productElem.querySelector('.price').innerText.trim();
    let price = parseFloat(priceText.replace('$', '')).toFixed(2);

    let cartItems = getCookie("cartItems");
    let cartArray = cartItems ? cartItems.split(',') : [];
    cartArray.push(`${productName} ${price}`);

    document.cookie = `cartItems=${cartArray.join(',')}; path=/; max-age=${7 * 24 * 60 * 60}`;
    buildCart();
    // Expand cart immediately and reset collapse timer
    expandCart();
    if(collapseTimeout) clearTimeout(collapseTimeout);
    collapseTimeout = setTimeout(() => { collapseCart(); }, 2000);
}

function updateCartItem(key, newCount) {
    let [productName, price] = key.split('_');
    let cartItems = getCookie("cartItems");
    let cartArray = cartItems ? cartItems.split(',') : [];

    let indices = [];
    cartArray.forEach((item, index) => {
        let lastSpaceIndex = item.lastIndexOf(" ");
        let itemName = item.substring(0, lastSpaceIndex);
        let itemPrice = item.substring(lastSpaceIndex + 1);
        if (itemName === productName && itemPrice === price) {
            indices.push(index);
        }
    });

    let oldCount = indices.length;
    let newCartArray = [];

    if (newCount <= oldCount) {
        let keepCount = 0;
        cartArray.forEach(item => {
            let lastSpaceIndex = item.lastIndexOf(" ");
            let itemName = item.substring(0, lastSpaceIndex);
            let itemPrice = item.substring(lastSpaceIndex + 1);
            if (itemName === productName && itemPrice === price) {
                if (keepCount < newCount) {
                    newCartArray.push(item);
                    keepCount++;
                }
            } else {
                newCartArray.push(item);
            }
        });
    } else {
        let diff = newCount - oldCount;
        if (oldCount === 0) {
            newCartArray = cartArray.concat(Array(diff).fill(`${productName} ${price}`));
        } else {
            let lastIndex = indices[indices.length - 1];
            newCartArray = [
                ...cartArray.slice(0, lastIndex + 1),
                ...Array(diff).fill(`${productName} ${price}`),
                ...cartArray.slice(lastIndex + 1)
            ];
        }
    }

    document.cookie = `cartItems=${newCartArray.join(',')}; path=/; max-age=${7 * 24 * 60 * 60}`;
    buildCart();
}

function toggleCart() {
    const cart = document.getElementById("cart");
    // Use computed style to determine if the cart is currently visible
    const computedStyle = window.getComputedStyle(cart);
    if (computedStyle.display === "none" || computedStyle.visibility === "hidden") {
        expandCart();
    } else {
        collapseCart();
    }
}

function expandCart(){
    const cart = document.getElementById("cart");
    if(cart.style.display !== "flex" || cart.style.visibility !== "visible"){
        cart.style.display = "flex";
        cart.style.visibility = "visible";
        // Use desktop animation for larger screens, mobile for screens <= 767px
        const animName = (window.innerWidth <= 767) ? "mobileSlideIn" : "desktopSlideIn";
        cart.style.animation = animName + " 500ms ease-in-out";
        setTimeout(() => { cart.style.animation = ""; }, 500);
    }
}

function collapseCart(){
    const cart = document.getElementById("cart");
    if(cart.style.display === "flex" && cart.style.visibility === "visible"){
        const animName = (window.innerWidth <= 767) ? "mobileSlideOut" : "desktopSlideOut";
        cart.style.animation = animName + " 500ms ease-in-out forwards";
        setTimeout(() => { 
            cart.style.animation = "";
            cart.style.display = "none";
            cart.style.visibility = "hidden";
        }, 500);
    }
}

function buildCart() {
    // Prevent spam clicking buildCart
    if (buildCartLock) return;
    buildCartLock = true;
    setTimeout(() => { buildCartLock = false; }, 500);
    
    let cartVisible = false;
    let cartItems = getCookie("cartItems");
    const cart = document.getElementById("cart");
    cart.innerHTML = `<span class="cart-title"> Cart </span>`;
    
    if (!cartItems) {
        cart.style.display = "flex";
        cart.style.flexDirection = "column";
        cart.style.alignItems = "center";
        cart.style.justifyContent = "center";
        cart.innerHTML = `<span class="empty-cart">Cart is empty.</span>`;
        return;
    }
    
    let cartArray = cartItems.split(',');
    let itemCounts = {};
    let orderedKeys = [];
    
    cartArray.forEach(item => {
        let lastSpaceIndex = item.lastIndexOf(" ");
        let productName = item.substring(0, lastSpaceIndex);
        let price = item.substring(lastSpaceIndex + 1);
        let key = productName + "_" + price;
        
        if (itemCounts[key]) {
            itemCounts[key].count += 1;
        } else {
            itemCounts[key] = { productName, price, count: 1 };
            orderedKeys.push(key);
        }
    });

    const cartItemsContainer = document.createElement('div');
    cartItemsContainer.className = 'cart-items';

    orderedKeys.forEach(key => {
        let { productName, price, count } = itemCounts[key];
        let numericPrice = parseFloat(price);
        let totalPrice = numericPrice * count;

        let template = `<div class="cart-child" data-key="${key}">
            <input type="number" class="cart-quantity" data-key="${key}" value="${count}" min="1" max="99">
            <span>${productName}</span>
            <span class="cartPrice">$${totalPrice.toFixed(2)}</span>
            <button onclick="removeItem('${key}')"><i class="fa fa-times"></i></button>
        </div>`;
        cartItemsContainer.innerHTML += template;
    });

    cart.appendChild(cartItemsContainer);

    let total = 0;
    orderedKeys.forEach(key => {
        let { price, count } = itemCounts[key];
        total += parseFloat(price) * count;
    });
    cart.innerHTML += `<div class="subtotal">
        <span>Subtotal: </span>
        <span class="cartPrice">$${total.toFixed(2)}</span>
    </div>
    <button class="checkoutbtn" id="checkoutBtn" onclick="checkOut()">Check Out</button>`;
}

function checkOut() {
    // Prevent spam clicking checkOut
    
    let cartItems = getCookie("cartItems");
    if (!cartItems) {
        return;
    }
    let cartArray = cartItems.split(',');
    let total = 0;
    cartArray.forEach(item => {
        let lastSpaceIndex = item.lastIndexOf(" ");
        let price = parseFloat(item.substring(lastSpaceIndex + 1));
        total += price;
    });

    let cartContainer = document.body;
    let modal = document.createElement('div');
    modal.id = 'paypal-checkout-modal';
    Object.assign(modal.style, {
         position: 'fixed',
         top: '0',
         left: '0',
         width: '100vw',
         height: '100vh',
         display: 'flex',
         justifyContent: 'center',
         alignItems: 'center',
         backgroundColor: 'rgba(0,0,0,0.5)'
    });

    // Create container element for checkout content
    let container = document.createElement('div');
    Object.assign(container.style, {
         background: '#fff',
         padding: '20px',
         borderRadius: '8px',
         width: '400px',
         textAlign: 'center'
    });

    let checkoutCloseBtn = document.createElement('button');
    checkoutCloseBtn.id = 'checkout-closeBtn';
    checkoutCloseBtn.innerHTML = '<i class="fa fa-times"></i>';
    Object.assign(checkoutCloseBtn.style, {
         position: 'fixed',
         top: '1rem',
         right: '1rem',
         fontSize: '2rem',
         padding: '0',
         background: 'transparent',
         border: 'none',
         color: 'var(--green)',
         cursor: 'pointer'
    });
    // Added event listener to close the modal when button clicked
    checkoutCloseBtn.addEventListener('click', () => {
         cartContainer.removeChild(modal);
    });
    container.appendChild(checkoutCloseBtn);

    // Create new container for PayPal Buttons (fixes missing element error)
    let paypalContainer = document.createElement('div');
    paypalContainer.id = 'paypal-checkout-container';
    container.appendChild(paypalContainer);

    modal.appendChild(container);
    cartContainer.appendChild(modal);

    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: { value: total.toFixed(2) }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                document.cookie = "cartItems=; path=/; max-age=0";
                buildCart();
                cartContainer.removeChild(modal);
                window.location.href = "/thankyou.html";
            });
        },
        onCancel: function(data) {
            cartContainer.removeChild(modal);
        },
        onError: function(err) {
            console.error('PayPal Checkout error', err);
            cartContainer.removeChild(modal);
        }
    }).render('#paypal-checkout-container');
}

function removeItem(key) {
    if(collapseTimeout) clearTimeout(collapseTimeout); // Prevent collapse during removal
    updateCartItem(key, 0);
}

document.getElementById("cart").addEventListener("change", (e) => {
    if (e.target.classList.contains("cart-quantity")) {
        let newCount = parseInt(e.target.value);
        let key = e.target.getAttribute("data-key");
        updateCartItem(key, newCount);
    }
});

// Collapse cart if click is detected outside it (with exception for Buy buttons)
document.addEventListener("click", function(e){
    const cart = document.getElementById("cart");
    // Check if cart is open and click is not within cart, mobile-cart, buildCart trigger, or buy button (AddToCart)
    if( cart.style.display === "flex" && 
       !e.target.closest("#cart") && 
       !e.target.closest("#checkout-closeBtn") && 
       !e.target.closest("#mobile-cart") && 
       !e.target.closest("button[onclick*='buildCart']") &&
       !e.target.closest("button[onclick*='toggleCart']") &&
       !e.target.closest("button[onclick*='AddToCart']") ){
        collapseCart();
    }
});

function toggleMenu() {
    const menu = document.querySelector('.mobile-menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'flex';
    } else {
        menu.style.display = 'none';
    }
}

function openDrop(index) {
    const drops = document.querySelectorAll('.m-drop');
    drops.forEach((drop, i) => {
        if (i === index) {
            drop.style.display = drop.style.display === 'flex' ? 'none' : 'flex';
        } else {
            drop.style.display = 'none';
        }
    });
}

document.getElementById('menubtn').addEventListener('click', toggleMenu);
document.getElementById('closebtn').addEventListener('click', toggleMenu);

buildCart();