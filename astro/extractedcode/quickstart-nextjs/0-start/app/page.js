import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { revalidatePath } from 'next/cache';

const TARGET_FILE = 'note.txt';

async function save(formData) {
  'use server';
  writeFileSync(TARGET_FILE, formData.get('content'));
  revalidatePath('/'); // Refresh the page to show updated content
}

export default function Home() {
  // Ensure the file exists so we don't crash
  if (!existsSync(TARGET_FILE)) writeFileSync(TARGET_FILE, 'Hello! Edit this text.');
  const content = readFileSync(TARGET_FILE, 'utf8');

  return (
    <>
      <h1>Edit: {TARGET_FILE}</h1>
      <form action={save}>
        <textarea name="content" key={content} defaultValue={content} style={{ width: '100%', height: 300, padding: 10 }} />
        <br />
        <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none' }}>Save Changes</button>
      </form>
    </>
  );
}
