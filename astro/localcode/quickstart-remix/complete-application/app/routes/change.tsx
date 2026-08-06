import { Link, redirect } from "react-router";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { sessionStorage } from "~/services/session.server";
import type { Route } from "./+types/change";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  const email = session.get("user");
  if (!email) throw redirect("/login");
  return email;
}

export default function Change({ loaderData }: Route.ComponentProps) {
  const email = loaderData as string;
  const [state, setState] = useState({error: false, hasChange: false, total: '', nickels: '', pennies: ''});

  function onTotalChange(e: ChangeEvent<HTMLInputElement>): void {
    setState({ ...state, total: e.target.value, hasChange: false });
  }

  function makeChange() {
    const newState = { error: false, hasChange: true, total: '', nickels: '', pennies: ''};
    newState.error = ! /^(\d+(\.\d*)?|\.\d+)$/.test(state.total);
    // Work in whole cents. Doing this arithmetic in floating point loses a cent
    // on values such as 0.29, because 0.29 * 100 is 28.999999999999996.
    const totalCents = Math.round(parseFloat(state.total) * 100);
    if (isNaN(totalCents)) {
      setState(newState);
      return;
    }
    newState.total = (totalCents / 100).toFixed(2);
    const nickels = Math.floor(totalCents / 5);
    newState.nickels = nickels.toLocaleString();
    newState.pennies = (totalCents - nickels * 5).toLocaleString();
    setState(newState);
  }

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
          <Link to="/account" className="menu-link inactive">Account</Link>
        </div>
      </div>

      <div style={{flex: '1'}}>
        <div className="column-container">
          <div className="app-container change-container">
            <h3>We Make Change</h3>

            { state.error && state.hasChange &&
              <div className="error-message"> Please enter a dollar amount </div>
            }

            { !state.hasChange &&
              <div className="error-message"><br/> </div>
            }

            { !state.error && state.hasChange &&
              <div className="change-message">
                We can make change for ${ state.total } with { state.nickels } nickels and { state.pennies } pennies!
              </div>
            }

            <div className="h-row">
              <form onSubmit={(e) => { e.preventDefault(); makeChange(); }} >
                <div className="change-label">Amount in USD: $</div>
                <input className="change-input" name="amount" value={state.total} onChange={onTotalChange} />
                <input className="change-submit" type="submit" value="Make Change" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
