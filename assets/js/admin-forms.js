// Admin forms JS: drag & drop, image deletion and banner preview
(function () {
  function initProductForm() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("images");
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener("click", () => fileInput.click());

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(
        eventName,
        () => dropZone.classList.add("dragover"),
        false
      );
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(
        eventName,
        () => dropZone.classList.remove("dragover"),
        false
      );
    });

    dropZone.addEventListener(
      "drop",
      (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files;
        updateDropZoneText(files.length);
      },
      false
    );

    fileInput.addEventListener("change", (e) =>
      updateDropZoneText(e.target.files.length)
    );

    function updateDropZoneText(count) {
      const textEl = dropZone.querySelector(".drop-zone-text");
      const iconEl = dropZone.querySelector(".drop-zone-icon");
      if (count > 0) {
        if (textEl)
          textEl.innerHTML = `<strong>${count} fichier(s) sélectionné(s)</strong><br>Soumettez le formulaire pour uploader`;
        if (iconEl) iconEl.textContent = "✅";
      }
    }
  }

  function initBannerForm() {
    const input = document.getElementById("banner_text");
    const preview = document.getElementById("preview");
    if (!input || !preview) return;
    input.addEventListener("input", (e) => {
      preview.textContent = e.target.value;
    });
  }

  // Delete image function for product form
  async function deleteImage(mediaId, csrfToken) {
    if (!confirm("Supprimer cette image ?")) return;

    const imageElement = document.querySelector(`[data-media-id="${mediaId}"]`);
    if (!imageElement) return;
    imageElement.classList.add("deleting");

    try {
      // Get template URL from container data attribute
      const container = document.getElementById("existing-images");
      const template = container?.dataset?.deleteUrlTemplate || "";
      const url = template.replace("__ID__", mediaId);

      const formData = new FormData();
      formData.append("_token", csrfToken);

      const response = await fetch(url, { method: "POST", body: formData });

      if (response.ok) {
        imageElement.style.transition = "all 0.3s";
        imageElement.style.transform = "scale(0)";
        imageElement.style.opacity = "0";
        setTimeout(() => {
          imageElement.remove();
          document.dispatchEvent(
            new CustomEvent("show-notification", {
              detail: { message: "Image supprimée avec succès!" },
            })
          );
        }, 300);
      } else {
        imageElement.classList.remove("deleting");
        alert("Erreur lors de la suppression de l'image");
      }
    } catch (error) {
      imageElement.classList.remove("deleting");
      console.error("Error:", error);
      alert("Erreur lors de la suppression de l'image");
    }
  }

  // Expose globally to keep existing inline calls working in templates
  window.deleteImage = deleteImage;

  document.addEventListener("DOMContentLoaded", () => {
    initProductForm();
    initBannerForm();
  });

  // Delegate click for image-delete buttons to keep templates free of inline JS
  document.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest(".image-delete-btn");
    if (!btn) return;
    const mediaId = btn.dataset.mediaId;
    const csrf = btn.dataset.csrf;
    if (mediaId) {
      deleteImage(mediaId, csrf);
    }
  });
})();
