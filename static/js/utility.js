let activeRow = null;

window.onload = function () {
    document.getElementById('exclude-images').addEventListener('change', function () {
        document.getElementById('image-header').style.display = this.checked ? 'none' : '';

        const imageInputs = document.querySelectorAll('.image-input');
        const imageCells = document.querySelectorAll('.image-cell');
        imageInputs.forEach((input) => {
            input.required = !this.checked;
        });
        imageCells.forEach((cell) => {
            cell.style.display = this.checked ? 'none' : '';
        });
    });

}

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