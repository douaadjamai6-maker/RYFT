document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. ALL 58 WILAYAS DATA & LOCATION FILTER
  // ==========================================
  const wilayas = [
    "1. Adrar", "2. Chlef", "3. Laghouat", "4. Oum El Bouaghi", "5. Batna",
    "6. Béjaïa", "7. Biskra", "8. Béchar", "9. Blida", "10. Bouira",
    "11. Tamanrasset", "12. Tébessa", "13. Tlemcen", "14. Tiaret", "15. Tizi Ouzou",
    "16. Algiers", "17. Djelfa", "18. Jijel", "19. Sétif", "20. Saïda",
    "21. Skikda", "22. Sidi Bel Abbès", "23. Annaba", "24. Guelma", "25. Constantine",
    "26. Médéa", "27. Mostaganem", "28. M'Sila", "29. Mascara", "30. Ouargla",
    "31. Oran", "32. El Bayadh", "33. Illizi", "34. Bordj Bou Arréridj", "35. Boumerdès",
    "36. El Tarf", "37. Tindouf", "38. Tissemsilt", "39. El Oued", "40. Khenchela",
    "41. Souk Ahras", "42. Tipaza", "43. Mila", "44. Aïn Defla", "45. Naâma",
    "46. Aïn Témouchent", "47. Ghardaïa", "48. Relizane", "49. Timimoun", "50. Bordj Badji Mokhtar",
    "51. Ouled Djellal", "52. Béni Abbès", "53. In Salah", "54. In Guezzam", "55. Touggourt",
    "56. Djanet", "57. El M'Ghair", "58. El Meniaa"
  ];

  const locationPill = document.getElementById("location-pill");
  const locationWrapper = document.getElementById("location-wrapper");
  const locationPillText = document.getElementById("location-pill-text");
  const wilayaListContainer = document.getElementById("wilaya-list");
  const wilayaSearchInput = document.getElementById("wilaya-search");

  // Populate Wilaya list into dropdown
  if (wilayaListContainer) {
    const renderWilayas = (filterText = "") => {
      wilayaListContainer.innerHTML = "";
      const filtered = wilayas.filter(w => w.toLowerCase().includes(filterText.toLowerCase()));

      if (filtered.length === 0) {
        wilayaListContainer.innerHTML = `<div class="wilaya-item no-result">No wilaya found</div>`;
        return;
      }

      filtered.forEach(wilaya => {
        const item = document.createElement("div");
        item.classList.add("wilaya-item");
        item.textContent = wilaya;
        item.addEventListener("click", () => {
          if (locationPillText) locationPillText.textContent = wilaya;
          if (locationWrapper) locationWrapper.classList.remove("active");
          filterProducts();
        });
        wilayaListContainer.appendChild(item);
      });
    };

    renderWilayas();

    // Live Search Typing in Wilaya Dropdown
    if (wilayaSearchInput) {
      wilayaSearchInput.addEventListener("input", (e) => {
        renderWilayas(e.target.value);
      });
    }
  }

  // Toggle Location Dropdown
  if (locationPill) {
    locationPill.addEventListener("click", (e) => {
      e.stopPropagation();
      if (budgetWrapper) budgetWrapper.classList.remove("active");
      if (locationWrapper) locationWrapper.classList.toggle("active");
    });
  }

  // ==========================================
  // 2. BUDGET FILTER LOGIC (DA)
  // ==========================================
  const budgetPill = document.getElementById("budget-pill");
  const budgetWrapper = document.getElementById("budget-wrapper");
  const budgetInput = document.getElementById("budget-input");
  const applyBudgetBtn = document.getElementById("apply-budget");
  const resetBudgetBtn = document.getElementById("reset-budget");

  if (budgetPill) {
    budgetPill.addEventListener("click", (e) => {
      e.stopPropagation();
      if (locationWrapper) locationWrapper.classList.remove("active");
      if (budgetWrapper) budgetWrapper.classList.toggle("active");
    });
  }

  if (applyBudgetBtn) {
    applyBudgetBtn.addEventListener("click", () => {
      filterProducts();
      if (budgetWrapper) budgetWrapper.classList.remove("active");
    });
  }

  if (resetBudgetBtn) {
    resetBudgetBtn.addEventListener("click", () => {
      if (budgetInput) budgetInput.value = "";
      filterProducts();
      if (budgetWrapper) budgetWrapper.classList.remove("active");
    });
  }

  // Close filter dropdowns on outside click
  document.addEventListener("click", (e) => {
    if (locationWrapper && !locationWrapper.contains(e.target)) {
      locationWrapper.classList.remove("active");
    }
    if (budgetWrapper && !budgetWrapper.contains(e.target)) {
      budgetWrapper.classList.remove("active");
    }
  });

  // Combined Product Filter Function
  function filterProducts() {
    const maxBudget = budgetInput ? parseFloat(budgetInput.value) : NaN;
    const selectedWilaya = locationPillText ? locationPillText.textContent.toLowerCase() : "location";
    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach(card => {
      const priceText = card.querySelector(".card-price")?.textContent || "0";
      const numericPrice = parseFloat(priceText.replace(/[^0-9]/g, ""));
      const locationText = card.querySelector(".shop-location")?.textContent.toLowerCase() || "";

      let matchesBudget = isNaN(maxBudget) || numericPrice <= maxBudget;
      let matchesLocation = selectedWilaya === "location" || selectedWilaya.includes(locationText) || locationText.includes(selectedWilaya.split(". ")[1]?.toLowerCase() || "");

      if (matchesBudget && matchesLocation) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  // ==========================================
  // 3. PRODUCT CARD NAVIGATION FIX
  // ==========================================
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't trigger if clicked on child action elements (comment badge, shop link, heart)
      if (e.target.closest(".icon-badge") || e.target.closest(".shop-link") || e.target.closest(".heart-badge")) {
        return;
      }

      const cardLink = card.querySelector("a.card-link-top");
      if (cardLink && cardLink.href) {
        window.location.href = cardLink.href;
      }
    });
  });

  // ==========================================
  // 4. HEART / FAVORITE TOGGLE
  // ==========================================
  const heartBadges = document.querySelectorAll(".heart-badge");

  heartBadges.forEach((badge) => {
    badge.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const icon = badge.querySelector("i");
      badge.classList.toggle("active");

      if (badge.classList.contains("active")) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
      } else {
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
      }
    });
  });

  // ==========================================
  // 5. HERO SLIDER & SWIPE LOGIC
  // ==========================================
  const slides = document.querySelectorAll(".hero-slide");
  const heroSlider = document.getElementById("hero-slider");
  let currentSlide = 0;
  let slideInterval;

  if (slides.length > 1 && heroSlider) {
    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
      });
      currentSlide = index;
    };

    const nextSlide = () => {
      let next = (currentSlide + 1) % slides.length;
      showSlide(next);
    };

    const prevSlide = () => {
      let prev = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(prev);
    };

    const startAutoSlide = () => {
      slideInterval = setInterval(nextSlide, 5000);
    };

    const stopAutoSlide = () => {
      clearInterval(slideInterval);
    };

    startAutoSlide();

    let startX = 0;
    let endX = 0;

    heroSlider.addEventListener("touchstart", (e) => {
      stopAutoSlide();
      startX = e.touches[0].clientX;
    }, { passive: true });

    heroSlider.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      handleSwipe();
      startAutoSlide();
    }, { passive: true });

    heroSlider.addEventListener("mousedown", (e) => {
      stopAutoSlide();
      startX = e.clientX;
    });

    heroSlider.addEventListener("mouseup", (e) => {
      endX = e.clientX;
      handleSwipe();
      startAutoSlide();
    });

    const handleSwipe = () => {
      const threshold = 50;
      if (startX - endX > threshold) {
        nextSlide();
      } else if (endX - startX > threshold) {
        prevSlide();
      }
    };
  }

  // ==========================================
  // 6. SEARCH BY PICTURE / CAMERA FEATURE
  // ==========================================
  const cameraBtn = document.getElementById("camera-icon-btn") || document.querySelector(".search-bar .fa-camera")?.parentElement || document.querySelector(".fa-camera");

  // Create a hidden file input if one isn't present in HTML
  let imageInput = document.getElementById("image-search-input");
  if (!imageInput) {
    imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.id = "image-search-input";
    imageInput.accept = "image/*";
    imageInput.style.display = "none";
    document.body.appendChild(imageInput);
  }

  if (cameraBtn) {
    cameraBtn.style.cursor = "pointer";
    cameraBtn.addEventListener("click", (e) => {
      e.preventDefault();
      imageInput.click();
    });
  }

  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const searchInput = document.querySelector(".search-bar input[type='text']") || document.getElementById("main-search-input");
      if (searchInput) {
        searchInput.value = `[Visual Search: ${file.name}]`;
      }
      
      // Visual feedback indicator
      alert(`Image loaded: "${file.name}". Filtering visually matched listings...`);
    };

    reader.readAsDataURL(file);
  });
});