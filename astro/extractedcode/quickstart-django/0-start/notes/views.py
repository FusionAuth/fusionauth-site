from pathlib import Path

from django.shortcuts import redirect
from django.template import RequestContext, Template
from django.http import HttpResponse

TARGET_FILE = Path(__file__).resolve().parent.parent / 'note.txt'

# Ensure the file exists so we don't crash
if not TARGET_FILE.exists():
    TARGET_FILE.write_text('Hello! Edit this text.')

# Simple HTML UI
PAGE = Template('''
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
        {% csrf_token %}
        <textarea name="content">{{ content }}</textarea>
        <br>
        <button type="submit">Save Changes</button>
    </form>
</body>
</html>
''')


def home(request):
    context = RequestContext(request, {'filename': TARGET_FILE.name, 'content': TARGET_FILE.read_text()})
    return HttpResponse(PAGE.render(context))


def save(request):
    TARGET_FILE.write_text(request.POST['content'])
    return redirect('/')  # Refresh the page to show updated content
