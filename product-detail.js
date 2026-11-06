document.addEventListener("DOMContentLoaded", () => {
  // 1. Read URL Query Parameters (if coming from product list)
  const urlParams = new URLSearchParams(window.location.search);
  const paramTitle = urlParams.get("title");
  const paramPrice = urlParams.get("price");
  const paramImage = urlParams.get("image");
  const paramShop = urlParams.get("shop");

  // 2. Map DOM Elements
  const titleEl = document.getElementById("detail-title");
  const priceEl = document.getElementById("detail-price");
  const imageEl = document.getElementById("detail-image");
  const thumbMainEl = document.getElementById("thumb-main");
  const sellerNameEl = document.getElementById("detail-seller-name");
  const sellerLogoEl = document.getElementById("detail-seller-logo");
  const sellerProfileLink = document.getElementById("seller-profile-link");
  const pageTitleEl = document.getElementById("page-title");
  const moreHeadingEl = document.getElementById("more-heading");
  const messageBtn = document.getElementById("btn-message-seller");
  const favBtn = document.getElementById("fav-btn");

  // 3. Extract Current Product Context
  const currentProduct = {
    title: paramTitle ? decodeURIComponent(paramTitle) : (titleEl ? titleEl.textContent : "Wireless Headphones"),
    price: paramPrice ? decodeURIComponent(paramPrice) : (priceEl ? priceEl.textContent : "3,500 DA"),
    image: paramImage ? decodeURIComponent(paramImage) : (imageEl ? imageEl.getAttribute("src") : "headphones.jpg"),
    shop: paramShop ? decodeURIComponent(paramShop) : (sellerNameEl ? sellerNameEl.textContent : "Electro dz")
  };

  // Update UI components dynamically
  if (titleEl) titleEl.textContent = currentProduct.title;
  if (pageTitleEl) pageTitleEl.textContent = `Ryft — ${currentProduct.title}`;
  if (priceEl) priceEl.textContent = currentProduct.price;
  
  if (imageEl) {
    imageEl.src = currentProduct.image;
    imageEl.alt = currentProduct.title;
  }
  if (thumbMainEl) thumbMainEl.src = currentProduct.image;

  // Update Shop Display & Logos dynamically
  if (sellerNameEl) sellerNameEl.textContent = currentProduct.shop;
  if (moreHeadingEl) moreHeadingEl.textContent = `More from ${currentProduct.shop}`;
  
  if (sellerLogoEl) {
    const cleanShopName = currentProduct.shop.toLowerCase().replace(/\s+/g, "");
    if (cleanShopName.includes("electro")) {
      sellerLogoEl.src = "electrologo.jpg";
    } else if (cleanShopName.includes("shoe") || cleanShopName.includes("kicks")) {
      sellerLogoEl.src = "shoeslogo.jpg";
    } else if (cleanShopName.includes("fashion") || cleanShopName.includes("wear") || cleanShopName.includes("woman")) {
      sellerLogoEl.src = "clotheslogo.jpg";
    } else if (cleanShopName.includes("beauty") || cleanShopName.includes("makeup")) {
      sellerLogoEl.src = "makeuplogo.jpg";
    } else {
      sellerLogoEl.src = "default-store.jpg";
    }
  }

  if (sellerProfileLink) {
    sellerProfileLink.href = `shop-profile.html?shop=${encodeURIComponent(currentProduct.shop)}`;
  }

  // BULLETPROOF MESSAGE BUTTON CLICK HANDLER
  if (messageBtn) {
    messageBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Stop default link behavior
      
      // Grab active text directly from screen elements at the moment of clicking
      const activeTitle = document.getElementById("detail-title")?.textContent || currentProduct.title;
      const activePrice = document.getElementById("detail-price")?.textContent || currentProduct.price;
      const activeImage = document.getElementById("detail-image")?.getAttribute("src") || currentProduct.image;
      const activeShop = document.getElementById("detail-seller-name")?.textContent || currentProduct.shop;

      // Build precise URL
      const targetUrl = `conversation.html?title=${encodeURIComponent(activeTitle)}&price=${encodeURIComponent(activePrice)}&image=${encodeURIComponent(activeImage)}&shop=${encodeURIComponent(activeShop)}`;
      
      window.location.href = targetUrl;
    });
  }

  // ==========================================
  // HEART / FAVORITING LOGIC
  // ==========================================
  if (favBtn) {
    let savedProducts = JSON.parse(localStorage.getItem("savedProducts")) || [];
    const isAlreadySaved = savedProducts.some(item => item.title === currentProduct.title);
    const icon = favBtn.querySelector("i");

    if (isAlreadySaved) {
      favBtn.classList.add("active");
      if (icon) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
      }
    }

    favBtn.addEventListener("click", () => {
      savedProducts = JSON.parse(localStorage.getItem("savedProducts")) || [];
      const index = savedProducts.findIndex(item => item.title === currentProduct.title);

      if (index > -1) {
        savedProducts.splice(index, 1);
        favBtn.classList.remove("active");
        if (icon) {
          icon.classList.remove("fa-solid");
          icon.classList.add("fa-regular");
        }
      } else {
        savedProducts.push(currentProduct);
        favBtn.classList.add("active");
        if (icon) {
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid");
        }
      }

      localStorage.setItem("savedProducts", JSON.stringify(savedProducts));
    });
  }

  // ==========================================
  // REVIEW POSTING LOGIC
  // ==========================================
  const reviewForm = document.getElementById("review-form");
  const reviewTextInput = document.getElementById("review-text");
  const reviewsList = document.getElementById("reviews-list");
  const reviewStorageKey = `reviews_${currentProduct.title.replace(/\s+/g, "_")}`;

  function renderReviews() {
    if (!reviewsList) return;
    const reviews = JSON.parse(localStorage.getItem(reviewStorageKey)) || [];
    
    if (reviews.length === 0) {
      reviewsList.innerHTML = `<p class="no-reviews" style="font-size: 0.85rem; color: #888;">No reviews yet. Be the first to review!</p>`;
      return;
    }

    reviewsList.innerHTML = reviews.map(r => `
      <div class="review-item" style="padding: 8px 0; border-bottom: 1px solid #eee;">
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600;">
          <span>${r.author}</span>
          <span style="color: #aaa; font-weight: 400;">${r.date}</span>
        </div>
        <p style="margin: 4px 0 0 0; font-size: 0.88rem; color: #333;">${escapeHTML(r.text)}</p>
      </div>
    `).join("");
  }

  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = reviewTextInput.value.trim();
      if (!text) return;

      const newReview = {
        author: "You",
        text: text,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
      };

      const reviews = JSON.parse(localStorage.getItem(reviewStorageKey)) || [];
      reviews.unshift(newReview);
      localStorage.setItem(reviewStorageKey, JSON.stringify(reviews));

      reviewTextInput.value = "";
      renderReviews();
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  renderReviews();
});