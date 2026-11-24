import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession } from '../auth';

// set up a directory for multi-user files
const DATA_DIR = 'user_data';
mkdirSync(DATA_DIR, { recursive: true });

// require authentication to access
async function requireLogin() {
  const session = await getSession();
  if (!session.user) redirect('/login');
  return session.user;
}

// helper to get specific user file
function getUserFile(userId) {
  return `${DATA_DIR}/note-${userId}.txt`;
}

async function save(formData) {
  'use server';
  const user = await requireLogin();
  writeFileSync(getUserFile(user.id), formData.get('content'));
  revalidatePath('/'); // Refresh the page to show updated content
}

export default async function Home() {
  const user = await requireLogin();
  const targetFile = getUserFile(user.id);

  // Ensure the file exists so we don't crash
  if (!existsSync(targetFile)) writeFileSync(targetFile, `Hello ${user.name}!`);
  const content = readFileSync(targetFile, 'utf8');

  return (
    <>
      <a href="/logout" className="logout-btn" style={{ float: 'right', background: '#dc3545', color: 'white', padding: '8px 15px', textDecoration: 'none', borderRadius: 4 }}>Logout</a>
      <p style={{ float: 'right', marginRight: 20 }}>Welcome, {user.name}</p>
      <h1>Personal Note Editor</h1>
      <form action={save}>
        <textarea name="content" key={content} defaultValue={content} style={{ width: '100%', height: 300, padding: 10 }} />
        <br />
        <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none' }}>Save Changes</button>
      </form>
    </>
  );
}
