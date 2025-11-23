/* Search Modal Functionality */

export function initSearchModal() {
  const searchBtn = document.getElementById("open-search-modal");
  const searchModal = document.getElementById("search-modal");

  if (searchBtn && searchModal) {
    searchBtn.addEventListener("click", () => {
      searchModal.open();
    });
  }
}

// Auto-initialize
document.addEventListener("DOMContentLoaded", () => {
  initSearchModal();
});
