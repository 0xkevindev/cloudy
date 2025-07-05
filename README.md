## 🌥️ Cloudy - Vanilla File Server

**Cloudy** is a simple, clean file server built with **Vanilla Node.js** and a frontend using **HTML + JavaScript** (no frameworks). It allows users to:

* 📂 Upload files with progress tracking
* 📄 View and open files
* 📥 Download files
* ✏️ Rename files
* 🗑️ Delete files

---

## 📁 Project Structure

```
cloudy/
│
├── backend/           # Node.js server
│   ├── app.js         # Core HTTP server
│   └── storage/       # All uploaded files
│
├── client/            # Vanilla frontend
│   ├── index.html     # Main UI
│   ├── script.js      # JavaScript logic
│   └── style.css      # Dark-themed styling
│
├── README.md
```

---

## 🚀 Features

*  Pure Node.js HTTP server (no Express)
*  File upload with `Content-Length` progress
*  Cross-Origin support (CORS)
*  File listing and viewing
*  Rename/Delete operations via PATCH/DELETE
*  Built using only `fs`, `http`, and native browser APIs

---

## 🛠️ Installation

```bash
git clone https://github.com/0xkevindev/cloudy.git
cd cloudy/backend
mkdir storage
```

> The `storage/` folder is where uploaded files are saved. Make sure it exists before starting the server.

---

## ▶️ Running the Server

```bash
# Inside backend/
node app.js
```

The server will start on port `80`.

---

## 🌐 Running the Client

```bash
# Inside client/
# Use any static file server
python3 -m http.server

# Or with npm serve
npx serve
```

Visit:

```
http://localhost:8000
```

---

## 🧪 Supported API Endpoints

### `GET /`

Returns a list of all files.

### `POST /`

Uploads a file.
Requires header:

```http
filename: example.txt
```

### `GET /<filename>?action=open`

Opens the file in browser.

### `GET /<filename>?action=download`

Triggers file download.

### `PATCH /`

Renames a file.
Request body (JSON):

```json
{
  "oldFilename": "old.txt",
  "newFilename": "new.txt"
}
```

### `DELETE /delete`

Deletes a file.
Request body (JSON):

```json
{
  "filename": "file.txt"
}
```
