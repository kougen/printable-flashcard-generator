let activeRow = null;

document.addEventListener("click", (event) => {
    const row = event.target.closest("tr");
    if (row && row.dataset.rowId) {
        document.querySelectorAll("tr").forEach(r => r.classList.remove("bg-gray-200"));
        row.classList.add("bg-gray-200");
        activeRow = row;
    }
});

document.addEventListener("paste", async (event) => {
    if (!activeRow) return;

    const clipboardItems = event.clipboardData.items;
    for (const item of clipboardItems) {
        if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            const dt = new DataTransfer();
            dt.items.add(file);

            const fileInput = activeRow.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.files = dt.files;
            }
        }
    }
});