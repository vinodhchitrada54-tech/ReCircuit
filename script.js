
/* ==========================================
   ReCircuit - JavaScript Functionality
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

  const browse = document.querySelector("#page-browse");
  const listingsGrid = document.querySelector(".results .grid");
  const searchForm = document.querySelector(".search");
  const searchInput = document.querySelector("#q");
  const sellForm = document.querySelector("#page-sell form");
  const compareBoxes = document.querySelectorAll(".cmp-box");

  // Notification message
  function showMessage(message, type = "success") {
    let toast = document.querySelector("#rc-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "rc-toast";
      toast.setAttribute("role", "status");

      Object.assign(toast.style, {
        position: "fixed",
        bottom: "25px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "14px 22px",
        borderRadius: "10px",
        color: "white",
        background: "#0f766e",
        zIndex: "9999",
        boxShadow: "0 5px 20px #0003",
        maxWidth: "90%",
        textAlign: "center"
      });

      document.body.appendChild(toast);
    }

    toast.style.background =
      type === "error" ? "#b91c1c" : "#0f766e";

    toast.textContent = message;
    toast.hidden = false;

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
      toast.hidden = true;
    }, 3000);
  }


  // ==========================================
  // 1. PRODUCT SEARCH
  // ==========================================

  function searchProducts() {
    if (!listingsGrid || !searchInput) return;

    const query = searchInput.value.toLowerCase().trim();

    const cards = listingsGrid.querySelectorAll(".card");

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();

      card.hidden = !text.includes(query);
    });

    updateCount();
  }

  if (searchForm) {
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      searchProducts();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", searchProducts);
  }


  // ==========================================
  // 2. FILTER COUNT
  // ==========================================

  function updateCount() {
    if (!listingsGrid) return;

    const cards = [...listingsGrid.querySelectorAll(".card")];

    const visibleCards = cards.filter(card => {
      return !card.hidden &&
        getComputedStyle(card).display !== "none";
    });

    const count = document.querySelector(".results-head .muted");

    if (count) {
      count.textContent =
        `${visibleCards.length} listing(s) found`;
    }
  }

  if (browse) {
    browse.querySelectorAll('input[type="radio"]')
      .forEach(input => {
        input.addEventListener("change", updateCount);
      });
  }


  // ==========================================
  // 3. PRODUCT COMPARISON
  // ==========================================

  function updateComparison() {
    const selected = document.querySelectorAll(
      ".cmp-box:checked"
    );

    if (selected.length > 4) {
      selected[selected.length - 1].checked = false;

      showMessage(
        "You can compare a maximum of 4 devices.",
        "error"
      );
    }

    const compareBar = document.querySelector(".cmp-bar");

    if (compareBar) {
      compareBar.textContent =
        `Compare ${document.querySelectorAll(".cmp-box:checked").length} selected devices ↓`;
    }

    updateCount();
  }

  compareBoxes.forEach(box => {
    box.addEventListener("change", updateComparison);
  });


  // ==========================================
  // 4. CLOSE PRODUCT POPUPS
  // ==========================================

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      const modal = document.querySelector(".modal:target");

      if (modal) {
        location.hash = "listings";
      }
    }
  });


  // ==========================================
  // 5. BUYER ENQUIRY FORM
  // ==========================================

  document.querySelectorAll(".enq").forEach(form => {

    form.addEventListener("submit", event => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const formData = new FormData(form);

      const buyerName = formData.get("buyer_name");
      const email = formData.get("buyer_email");
      const phone = formData.get("buyer_phone");

      if (!/^[0-9]{10}$/.test(phone)) {
        showMessage(
          "Please enter a valid 10-digit phone number.",
          "error"
        );
        return;
      }

      // Demo mode: no server is connected.
      showMessage(
        `Thank you ${buyerName}! Your enquiry has been prepared.`
      );

      form.reset();

      location.hash = "listings";
    });

  });


  // ==========================================
  // 6. SELL DEVICE FORM
  // ==========================================

  function getPriceCategory(price) {
    if (price < 15000) return "low";
    if (price <= 40000) return "mid";
    return "high";
  }

  function getCategoryIcon(category) {
    const icons = {
      phones: "📱",
      laptops: "💻",
      audio: "🎧",
      cameras: "📷",
      wearables: "⌚",
      gaming: "🎮",
      other: "📦"
    };

    return icons[category] || "📦";
  }

  function addListing(data) {
    if (!listingsGrid) return;

    const card = document.createElement("article");
    card.className = "card";

    card.dataset.cat = data.category;
    card.dataset.cond = data.condition;
    card.dataset.price = getPriceCategory(data.price);

    const icon = getCategoryIcon(data.category);

    const conditionLabel = {
      "like-new": "Like New",
      good: "Good",
      fair: "Fair"
    }[data.condition] || "Good";

    const badgeClass = {
      "like-new": "badge-like-new",
      good: "badge-good",
      fair: "badge-fair"
    }[data.condition] || "badge-good";

    const productId = "new-" + Date.now();

    card.innerHTML = `
      <a class="thumb" data-cat="${data.category}"
         href="#${productId}">
        <span aria-hidden="true">${icon}</span>
      </a>

      <div class="card-body">
        <div class="card-row">
          <span class="badge ${badgeClass}">
            ${conditionLabel}
          </span>
          <span class="muted small">${data.category}</span>
        </div>

        <h3>${escapeHTML(data.brand)} ${escapeHTML(data.model)}</h3>

        <ul class="chips">
          <li>${escapeHTML(data.storage || "Storage not specified")}</li>
          <li>${escapeHTML(data.ram || "RAM not specified")}</li>
          <li>New listing</li>
        </ul>

        <p class="price">₹${data.price.toLocaleString("en-IN")}</p>

        <p class="muted small">
          ${escapeHTML(data.seller)} · ${escapeHTML(data.city)}
        </p>
      </div>

      <div class="card-foot">
        <button class="btn btn-sm view-new-device" type="button">
          View details
        </button>
      </div>
    `;

    listingsGrid.prepend(card);

    card.querySelector(".view-new-device").addEventListener(
      "click",
      () => {
        showMessage(
          `${data.brand} ${data.model} - ${conditionLabel}, ₹${data.price.toLocaleString("en-IN")}. Contact the seller through your marketplace backend when connected.`
        );
      }
    );
  }


  // Safely display user-entered text in HTML
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }


  // Restore saved listings from this browser
  function loadSavedListings() {
    try {
      const saved = JSON.parse(
        localStorage.getItem("recircuit-listings") || "[]"
      );

      saved.forEach(addListing);
    } catch (error) {
      console.error("Could not load saved listings:", error);
    }
  }

  if (sellForm) {

    sellForm.addEventListener("submit", event => {
      event.preventDefault();

      if (!sellForm.reportValidity()) return;

      const formData = new FormData(sellForm);

      const photos = formData.getAll("photos")
        .filter(file => file.size > 0);

      if (photos.length > 6) {
        showMessage(
          "You can upload a maximum of 6 photos.",
          "error"
        );
        return;
      }

      const phone = formData.get("seller_phone");

      if (!/^[0-9]{10}$/.test(phone)) {
        showMessage(
          "Enter a valid 10-digit mobile number.",
          "error"
        );
        return;
      }

      const price = Number(formData.get("price"));

      const listing = {
        seller: formData.get("seller_name"),
        city: formData.get("seller_city"),
        category: formData.get("category"),
        brand: formData.get("brand"),
        model: formData.get("model"),
        storage: formData.get("storage"),
        ram: formData.get("ram"),
        condition: formData.get("condition"),
        price: price
      };

      try {
        const saved = JSON.parse(
          localStorage.getItem("recircuit-listings") || "[]"
        );

        saved.push(listing);

        localStorage.setItem(
          "recircuit-listings",
          JSON.stringify(saved)
        );

      } catch (error) {
        showMessage(
          "Could not save listing. Browser storage may be full.",
          "error"
        );
        return;
      }

      addListing(listing);

      sellForm.reset();

      showMessage(
        "Your device listing has been saved successfully!"
      );

      location.hash = "page-browse";

      updateCount();
    });

  }


  // Load existing locally saved listings
  loadSavedListings();

  updateCount();

  console.log("ReCircuit JavaScript loaded successfully!");

});
