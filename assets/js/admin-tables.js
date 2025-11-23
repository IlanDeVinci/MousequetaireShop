(function () {
  function initAdminTables() {
    const containers = document.querySelectorAll(".admin-table-container");
    containers.forEach((container) => {
      const table = container.querySelector("table.admin-table");
      if (!table) return;

      // Insert toolbar (search + clear)
      if (!container.querySelector(".admin-table-toolbar")) {
        const toolbar = document.createElement("div");
        toolbar.className = "admin-table-toolbar";
        toolbar.innerHTML = `<input type="search" class="admin-search" placeholder="Rechercher..." aria-label="Rechercher" /><button type="button" class="admin-clear-search" style="display:none;">Effacer</button>`;
        container.insertBefore(toolbar, container.firstChild);

        const input = toolbar.querySelector(".admin-search");
        const clearBtn = toolbar.querySelector(".admin-clear-search");

        input.addEventListener("input", () => {
          const q = input.value.trim().toLowerCase();
          filterTable(table, q);
          clearBtn.style.display = q ? "inline-block" : "none";
        });

        clearBtn.addEventListener("click", () => {
          input.value = "";
          input.dispatchEvent(new Event("input"));
        });
      }

      // Add sorting on headers (skip Actions/empty headers)
      const headers = Array.from(table.querySelectorAll("thead th"));
      let idColumnIndex = -1;
      headers.forEach((th, index) => {
        const label = th.textContent.trim().toLowerCase();
        if (label === "" || label === "actions" || label === "action") return;

        // Track ID column for default sort
        if (label === "id" || label === "order id") {
          idColumnIndex = index;
        }

        th.classList.add("sortable-header");
        th.dataset.colIndex = index;
        th.addEventListener("click", () => {
          const current = th.dataset.sort || "none";
          // toggle
          const next = current === "asc" ? "desc" : "asc";
          // clear other headers
          headers.forEach((h) => {
            delete h.dataset.sort;
            h.classList.remove("sort-asc", "sort-desc");
          });
          th.dataset.sort = next;
          th.classList.add(next === "asc" ? "sort-asc" : "sort-desc");
          sortTableByColumn(table, index, next === "asc");
        });
      });

      // Default sort by ID column ascending on page load
      if (idColumnIndex >= 0) {
        const idHeader = headers[idColumnIndex];
        idHeader.dataset.sort = "asc";
        idHeader.classList.add("sort-asc");
        sortTableByColumn(table, idColumnIndex, true);
      }
    });
  }

  function filterTable(table, query) {
    const rows = Array.from(table.tBodies[0].rows);
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? "" : "none";
    });
  }

  function sortTableByColumn(table, columnIndex, asc = true) {
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.querySelectorAll("tr"));
    // Keep rows that are visible only; we will reorder visible ones and append hidden ones after
    const visible = rows.filter((r) => r.style.display !== "none");
    const hidden = rows.filter((r) => r.style.display === "none");

    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });

    visible.sort((a, b) => {
      const aCell = a.children[columnIndex]
        ? a.children[columnIndex].textContent.trim()
        : "";
      const bCell = b.children[columnIndex]
        ? b.children[columnIndex].textContent.trim()
        : "";
      return asc
        ? collator.compare(aCell, bCell)
        : collator.compare(bCell, aCell);
    });

    // Append sorted visible rows first, then hidden rows (preserve hidden)
    visible.concat(hidden).forEach((r) => tbody.appendChild(r));
  }

  document.addEventListener("DOMContentLoaded", initAdminTables);
})();
