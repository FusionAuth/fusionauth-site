'use client';

import { useEffect, useState } from 'react';

var coins = {
  quarters: 0.25,
  dimes: 0.1,
  nickels: 0.05,
  pennies: 0.01,
};

export default function MakeChangeForm() {
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(0);
  useEffect(() => {
    setMessage('');
    setAmount(0);
  }, []);

  const onMakeChange = (event: any) => {
    event.preventDefault();

    try {
      setMessage('We can make change for');

      let remainingAmount = amount;
      for (const [name, nominal] of Object.entries(coins)) {
        let count = Math.floor(remainingAmount / nominal);
        remainingAmount =
          Math.ceil((remainingAmount - count * nominal) * 100) / 100;

        setMessage((m) => `${m} ${count} ${name}`);
      }
      setMessage((m) => `${m}!`);
    } catch (ex: any) {
      setMessage(
        `There was a problem converting the amount submitted. ${ex.message}`
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
