'use client';

import { signIn, signOut } from 'next-auth/react';

export default function LoginButton({ session }: { session: any }) {
  if (session) {
    return (
      <>
        Status: Logged in as {session?.user?.email} <br />
        <button className="button-lg" onClick={() => signOut()}>
          Log out
        </button>
      </>
    );
  }
  return (
    <>
      <button className="button-lg" onClick={() => signIn()}>
        Log in
      </button>
    </>
  );
}
