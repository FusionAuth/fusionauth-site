import { redirect } from "react-router";
import { authenticator } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
import type { Route } from "./+types/auth.callback";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await authenticator.authenticate("FusionAuth", request);

  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  session.set("user", user);

  throw redirect("/account", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
}
