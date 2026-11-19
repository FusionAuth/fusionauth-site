export default defineEventHandler(async (event) => {
  // Clear the local session
  const session = await getUserSession(event);
  await session.clear();

  // Redirect to FusionAuth to clear the SSO session
  return sendRedirect(event, `${FUSIONAUTH_URL}/oauth2/logout?` + new URLSearchParams({
    client_id: CLIENT_ID,
    post_logout_redirect_uri: 'http://localhost:3000/login',
  }));
});
