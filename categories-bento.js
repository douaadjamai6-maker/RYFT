document.addEventListener("DOMContentLoaded", () => {
  // Update shop counts dynamically from seller listings if available
  const listings = JSON.parse(localStorage.getItem("ryft_seller_listings") || "[]");
  
  if (listings.length > 0) {
    const counts = listings.reduce((acc, item) => {
      const cat = (item.category || "").toLowerCase();
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // Optional: add real-time dynamic shop count updates
    Object.keys(counts).forEach(cat => {
      const card = document.querySelector(`.card-${cat} .card-info p`);
      if (card) {
        const baseCount = parseInt(card.innerText) || 0;
        card.innerText = `${baseCount + counts[cat]} SHOPS`;
      }
    });
  }

  // See all categories click handler
  const seeAllBtn = document.getElementById("see-all-btn");
  seeAllBtn.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Showing all extended categories...");
  });
});
