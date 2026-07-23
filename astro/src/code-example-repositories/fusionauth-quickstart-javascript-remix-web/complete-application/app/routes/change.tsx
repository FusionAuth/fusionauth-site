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
    const total = Math.trunc(parseFloat(state.total)*100)/100;
    newState.total = isNaN(total) ? '' : total.toFixed(2);
    const nickels = Math.floor(total / 0.05);
    newState.nickels = nickels.toLocaleString();
    const pennies = ((total - (0.05 * nickels)) / 0.01);
    newState.pennies = Math.ceil((Math.trunc(pennies*100)/100)).toLocaleString();
    newState.error = ! /^(\d+(\.\d*)?|\.\d+)$/.test(state.total);
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
