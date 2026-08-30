function renderCategoryPage(categoryName) {
  document.addEventListener("DOMContentLoaded", () => {
    const defaultProducts = [
      { id: 101, title: "Wireless Headphones", price: "3500 DA", category: "Electronics", image: "headphones.jpg", shop: "Electro dz" },
      { id: 102, title: "Casual Hoodie", price: "4200 DA", category: "Clothes", image: "hoodie.jpg", shop: "thewoman_dz" },
      { id: 103, title: "Running Sneakers", price: "6800 DA", category: "Shoes", image: "sneakers.jpg", shop: "the_shoe_dz" },
      { id: 104, title: "Lipstick Set", price: "1800 DA", category: "Beauty", image: "lipstick.jpg", shop: "makeup_dz" },
      { id: 105, title: "USB-C Cable", price: "800 DA", category: "Electronics", image: "usb-cable.jpg", shop: "Electro dz" },
      { id: 106, title: "Leather Wallet", price: "2200 DA", category: "Accessories", image: "wallet.jpg", shop: "Electro dz" }
    ];

    const userListings = JSON.parse(localStorage.getItem("ryft_seller_listings") || "[]").map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      category: item.category || "Electronics",
      image: item.images && item.images.length ? item.images[0] : "headphones.jpg",
      shop: "Electro dz"
    }));

    const allProducts = [...userListings, ...defaultProducts];
    const categoryProducts = allProducts.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());
    let savedItems = JSON.parse(localStorage.getItem("ryft_saved_items") || "[]");

    const grid = document.getElementById("category-grid");
    const searchInput = document.getElementById("cat-search-input");

    function render(items) {
      if (!items.length) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;"><p>No items available in ${categoryName} yet.</p></div>`;
        return;
      }

      grid.innerHTML = items.map(p => {
        const isSaved = savedItems.includes(p.id);
        const chatUrl = `conversation.html?title=${encodeURIComponent(p.title)}&price=${encodeURIComponent(p.price)}&image=${encodeURIComponent(p.image)}&shop=${encodeURIComponent(p.shop)}`;
        return `
          <div class="cat-product-card" data-id="${p.id}">
            <button class="save-heart-btn ${isSaved ? 'saved' : ''}" data-id="${p.id}">
              <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <img src="${p.image}" alt="${p.title}" class="cat-card-img" onclick="window.location.href='${chatUrl}'" style="cursor:pointer;">
            <div class="cat-card-body">
              <div class="cat-card-title">${p.title}</div>
              <div class="cat-card-price">${p.price}</div>
              <span class="cat-card-badge">${p.category}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        render(categoryProducts.filter(p => p.title.toLowerCase().includes(query)));
      });
    }

    grid.addEventListener("click", (e) => {
      const heartBtn = e.target.closest(".save-heart-btn");
      if (!heartBtn) return;
      const id = parseInt(heartBtn.getAttribute("data-id"));
      if (savedItems.includes(id)) {
        savedItems = savedItems.filter(item => item !== id);
      } else {
        savedItems.push(id);
      }
      localStorage.setItem("ryft_saved_items", JSON.stringify(savedItems));
      const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
      render(categoryProducts.filter(p => p.title.toLowerCase().includes(query)));
    });

    render(categoryProducts);
  });
}