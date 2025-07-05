const SERVER_URL = "http://192.168.1.6";

const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const progressDiv = document.getElementById("progress");

let renameState = {};

getDirectoryItems();

fileInput.addEventListener("change", uploadFile);

async function getDirectoryItems() {
  const res = await fetch(`${SERVER_URL}/`);
  const files = await res.json();

  fileList.innerHTML = "";
  files.forEach((item) => {
    const div = document.createElement("div");
    div.className = "file-item";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = item;
    div.appendChild(nameSpan);

    // Open link
    const openLink = document.createElement("a");
    openLink.href = `${SERVER_URL}/${item}?action=open`;
    openLink.textContent = "Open";
    openLink.target = "_blank";
    div.appendChild(openLink);

    // Download link
    const downloadLink = document.createElement("a");
    downloadLink.href = `${SERVER_URL}/${item}?action=download`;
    downloadLink.textContent = "Download";
    div.appendChild(downloadLink);

    // Rename button
    const renameButton = document.createElement("button");
    renameButton.textContent = "Rename";
    renameButton.addEventListener("click", () => enableRename(item, div));
    div.appendChild(renameButton);

    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => handleDelete(item));
    div.appendChild(deleteButton);

    fileList.appendChild(div);
  });
}

function uploadFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${SERVER_URL}/`, true);
  xhr.setRequestHeader("filename", file.name);

  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const percent = ((e.loaded / e.total) * 100).toFixed(2);
      progressDiv.textContent = `Progress: ${percent}%`;
    }
  });

  xhr.addEventListener("load", () => {
    console.log(xhr.response);
    progressDiv.textContent = "Upload complete";
    getDirectoryItems();
  });

  xhr.send(file);
}

async function handleDelete(filename) {
  await fetch(`${SERVER_URL}/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });
  getDirectoryItems();
}

function enableRename(oldFilename, container) {
  container.innerHTML = "";

  const input = document.createElement("input");
  input.type = "text";
  input.value = oldFilename;
  container.appendChild(input);

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", () => saveRename(oldFilename, input.value));
  container.appendChild(saveButton);

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", getDirectoryItems);
  container.appendChild(cancelButton);
}

async function saveRename(oldFilename, newFilename) {
  if (!newFilename) return;
  await fetch(`${SERVER_URL}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldFilename, newFilename }),
  });
  getDirectoryItems();
}