import { Link, redirect } from "react-router";
import { sessionStorage } from "~/services/session.server";
import type { Route } from "./+types/account";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  const email = session.get("user");
  if (!email) throw redirect("/login");
  return email;
}

export default function Account({ loaderData }: Route.ComponentProps) {
  const email = loaderData as string;
  return (
    <div id="page-container">
      <div id="page-header">
        <div id="logo-header">
          <img src="https://fusionauth.io/cdn/samplethemes/changebank/changebank.svg" />
          <div className="h-row">
            <p className="header-email">{email}</p>
            <Link to="/logout" className="button-lg">Logout</Link>
          </div>
        </div>

        <div id="menu-bar" className="menu-bar">
          <Link to="/change" className="menu-link inactive">Make Change</Link>
          <Link to="/account" className="menu-link">Account</Link>
        </div>
      </div>

      <div style={{flex: '1'}}>
        <div className="column-container">
          <div className="app-container">
            <h3>Your balance</h3>
            <div className="balance">$0.00</div>
          </div>
        </div>
      </div>
    </div>
  );
}
