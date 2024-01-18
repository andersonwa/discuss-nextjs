'use client';

import { useSession } from 'next-auth/react';

export default function Profile() {
  const session = useSession();
  if (session.data?.user) {
    return <div>from client: user is signed in</div>;
  }

  return (
    <div>
      <p>from client: user is signed out</p>
    </div>
  );
}
