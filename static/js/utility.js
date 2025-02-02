let activeRow = null;

document.getElementById('excludeImages').addEventListener('change', function() {
    document.getElementById('image-column').style.display = this.checked ? 'none' : '';
});

document.addEventListener("click", (event) => {
    const row = event.target.closest("tr");
    if (row && row.classList.contains("editable")) {
        activeRow = row;
        row.classList.add("bg-gray-200");
        document.querySelectorAll("tr.editable").forEach((r) => {
            if (r !== row) {
                r.classList.remove("bg-gray-200");
            }
        });
    }
});

document.addEventListener("paste", async (event) => {
    console.log("Paste event", event);
    if (!activeRow) {
        return;
    }

    const clipboardItems = event.clipboardData.items;
    console.log("Clipboard items", clipboardItems);
    for (const item of clipboardItems) {
        console.log("Clipboard item", item);
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