import { authenticator } from "~/services/auth.server";
import type { Route } from "./+types/login";

export async function loader({ request }: Route.LoaderArgs) {
  return await authenticator.authenticate("FusionAuth", request);
}
