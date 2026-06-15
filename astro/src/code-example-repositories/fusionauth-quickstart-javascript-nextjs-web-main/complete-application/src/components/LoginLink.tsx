'use client';

import { signIn } from 'next-auth/react';

export default function LoginButton({ session }: { session: any }) {
  return (
    <>
      <p>
        To get started,{' '}
        <a
          onClick={() => signIn()}
          style={{ textDecoration: 'underline', cursor: 'pointer' }}
        >
          log in or create a new account.
        </a>
      </p>
    </>
  );
}
