document.addEventListener("DOMContentLoaded", () => {
  // Feature 1: Message Seller Redirect
  const msgBtn = document.getElementById("btn-message-shop");
  const urlParams = new URLSearchParams(window.location.search);
  const paramShop = urlParams.get("shop") || "Electro dz";

  if (msgBtn) {
    msgBtn.addEventListener("click", () => {
      window.location.href = `conversation.html?shop=${encodeURIComponent(paramShop)}`;
    });
  }

  // Feature 2: Follow / Followed Toggle
  const followBtn = document.getElementById("btn-follow");
  if (followBtn) {
    followBtn.addEventListener("click", () => {
      const isFollowed = followBtn.classList.contains("followed");
      if (isFollowed) {
        followBtn.classList.remove("followed");
        followBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Follow`;
      } else {
        followBtn.classList.add("followed");
        followBtn.innerHTML = `Followed`;
      }
    });
  }

  // Feature 3: Rating Dropdown Menu
  const ratingTrigger = document.getElementById("rating-stat-trigger");
  const ratingDropdown = document.getElementById("rating-dropdown");
  const ratingVal = document.getElementById("rating-val");
  const stars = ratingDropdown ? ratingDropdown.querySelectorAll(".star-opt") : [];

  if (ratingTrigger && ratingDropdown) {
    ratingTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      ratingDropdown.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!ratingTrigger.contains(e.target)) {
        ratingDropdown.classList.remove("active");
      }
    });

    stars.forEach((star) => {
      star.addEventListener("mouseenter", () => {
        const val = parseInt(star.getAttribute("data-rating"));
        stars.forEach((s, idx) => {
          if (idx < val) s.classList.add("hovered");
          else s.classList.remove("hovered");
        });
      });

      star.addEventListener("mouseleave", () => {
        stars.forEach((s) => s.classList.remove("hovered"));
      });

      star.addEventListener("click", (e) => {
        e.stopPropagation();
        const chosenRating = star.getAttribute("data-rating");
        if (ratingVal) ratingVal.textContent = parseFloat(chosenRating).toFixed(1);

        stars.forEach((s, idx) => {
          if (idx < parseInt(chosenRating)) s.classList.add("selected");
          else s.classList.remove("selected");
        });

        ratingDropdown.classList.remove("active");
      });
    });
  }
});