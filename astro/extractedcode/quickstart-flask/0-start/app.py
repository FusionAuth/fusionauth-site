from pathlib import Path

from flask import Flask, redirect, render_template_string, request

app = Flask(__name__)
PORT = 3000
TARGET_FILE = Path(__file__).parent / 'note.txt'

# Ensure the file exists so we don't crash
if not TARGET_FILE.exists():
    TARGET_FILE.write_text('Hello! Edit this text.')

# Simple HTML UI
PAGE = '''
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
    <h1>Edit: {{ filename }}</h1>
    <form method="POST" action="/save">
        <textarea name="content">{{ content }}</textarea>
        <br>
        <button type="submit">Save Changes</button>
    </form>
</body>
</html>
'''


@app.get('/')
def home():
    return render_template_string(PAGE, filename=TARGET_FILE.name, content=TARGET_FILE.read_text())


@app.post('/save')
def save():
    TARGET_FILE.write_text(request.form['content'])
    return redirect('/')  # Refresh the page to show updated content


if __name__ == '__main__':
    app.run(port=PORT)
