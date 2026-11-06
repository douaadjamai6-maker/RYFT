
document.addEventListener("DOMContentLoaded", () => {
  // 1. Get the container where saved cards should appear
  const gridContainer = document.querySelector("#liked-products-grid");
  if (!gridContainer) return;

  // 2. Fetch the saved items array from browser storage
  const savedProducts = JSON.parse(localStorage.getItem("savedProducts")) || [];

  // 3. If no saved items exist, show an empty state message
  if (savedProducts.length === 0) {
    gridContainer.innerHTML = `<p class="empty-msg">You haven't saved any items yet.</p>`;
    return;
  }

  // 4. Generate the HTML for every saved product
  gridContainer.innerHTML = savedProducts.map(item => `
    <article class="product-card">
      <a href="product-detail.html" class="card-link-top">
        <div class="card-image">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="card-body">
          <p class="card-title">${item.title}</p>
          <p class="card-price">${item.price}</p>
        </div>
      </a>
      <div class="card-footer">
        <span class="shop-name">${item.shop}</span>
      </div>
    </article>
  `).join("");
});
