import { redirect } from "react-router";
import { sessionStorage } from "~/services/session.server";
import type { Route } from "./+types/logout";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));

  throw redirect("/", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}
