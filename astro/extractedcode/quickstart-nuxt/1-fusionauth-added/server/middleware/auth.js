// require authentication to access everything except the login routes
const PUBLIC_PATHS = ['/login', '/oauth-callback'];

export default defineEventHandler(async (event) => {
  if (PUBLIC_PATHS.includes(getRequestURL(event).pathname)) return;

  const session = await getUserSession(event);
  if (!session.data.user) return sendRedirect(event, '/login');
});
