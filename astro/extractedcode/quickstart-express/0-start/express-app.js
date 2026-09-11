const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const TARGET_FILE = path.join(__dirname, 'note.txt');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Ensure the file exists so we don't crash
if (!fs.existsSync(TARGET_FILE)) {
    fs.writeFileSync(TARGET_FILE, 'Hello! Edit this text.', 'utf8');
}

app.get('/', (req, res) => {
    const content = fs.readFileSync(TARGET_FILE, 'utf8');

    // Simple HTML UI
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Text Editor</title>
            <style>
                body { font-family: sans-serif; margin: 40px; line-height: 1.6; }
                textarea { width: 100%; height: 300px; padding: 10px; margin-bottom: 10px; }
                button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
                button:hover { background: #0056b3; }
            </style>
        </head>
        <body>
            <h1>Edit: ${path.basename(TARGET_FILE)}</h1>
            <form method="POST" action="/save">
                <textarea name="content">${content}</textarea>
                <br>
                <button type="submit">Save Changes</button>
            </form>
        </body>
        </html>
    `;
    res.send(html);
});

app.post('/save', (req, res) => {
    const newContent = req.body.content;
    fs.writeFileSync(TARGET_FILE, newContent, 'utf8');
    res.redirect('/'); // Refresh the page to show updated content
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
