import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession } from '../auth';

const TARGET_FILE = 'note.txt';

// require authentication to access
async function requireLogin() {
  const session = await getSession();
  if (!session.user) redirect('/login');
}

async function save(formData) {
  'use server';
  await requireLogin();
  writeFileSync(TARGET_FILE, formData.get('content'));
  revalidatePath('/'); // Refresh the page to show updated content
}

export default async function Home() {
  await requireLogin();

  // Ensure the file exists so we don't crash
  if (!existsSync(TARGET_FILE)) writeFileSync(TARGET_FILE, 'Hello! Edit this text.');
  const content = readFileSync(TARGET_FILE, 'utf8');

  return (
    <>
      <a href="/logout" className="logout-btn" style={{ float: 'right', background: '#dc3545', color: 'white', padding: '8px 15px', textDecoration: 'none', borderRadius: 4 }}>Logout</a>
      <h1>Edit: {TARGET_FILE}</h1>
      <form action={save}>
        <textarea name="content" key={content} defaultValue={content} style={{ width: '100%', height: 300, padding: 10 }} />
        <br />
        <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none' }}>Save Changes</button>
      </form>
    </>
  );
}
