import { redirect } from 'next/navigation';
import { CLIENT_ID, FUSIONAUTH_URL, getSession } from '../../auth';

export async function GET() {
  // Clear the local session
  const session = await getSession();
  session.destroy();

  // Redirect to FusionAuth to clear the SSO session
  redirect(`${FUSIONAUTH_URL}/oauth2/logout?` + new URLSearchParams({
    client_id: CLIENT_ID,
    post_logout_redirect_uri: 'http://localhost:3000/login',
  }));
}
