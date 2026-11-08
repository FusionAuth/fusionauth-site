'use client';

import { useState, type FormEvent } from 'react';

const coins = {
  quarters: 25,
  dimes: 10,
  nickels: 5,
  pennies: 1,
};

export default function MakeChangeForm() {
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(0);

  const onMakeChange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setMessage('We can make change for');

      let remainingCents = Math.round(amount * 100);
      for (const [name, nominal] of Object.entries(coins)) {
        const count = Math.floor(remainingCents / nominal);
        remainingCents = remainingCents - count * nominal;

        setMessage((m) => `${m} ${count} ${name}`);
      }
      setMessage((m) => `${m}!`);
    } catch (ex: unknown) {
      const errorMessage = ex instanceof Error ? ex.message : String(ex);
      setMessage(
        `There was a problem converting the amount submitted. ${errorMessage}`
      );
    }
  };

  return (
    <section>
      <div style={{ flex: '1' }}>
        <div className="column-container">
          <div className="app-container change-container">
            <h3>We Make Change</h3>
            <div className="change-message">{message}</div>
            <form onSubmit={onMakeChange}>
              <div className="h-row">
                <div className="change-label">Amount in USD: $</div>
                <input
                  className="change-input"
                  type="number"
                  step={0.01}
                  name="amount"
                  value={amount}
                  onChange={(e) => setAmount(+e.target.value)}
                />
                <input
                  className="change-submit"
                  type="submit"
                  value="Make Change"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
