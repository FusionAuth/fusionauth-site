function makeChange(event) {
    event.preventDefault();
    const amount = document.querySelector('#total').value;
    const totalCents = Math.round(parseFloat(amount) * 100);
    const totalString = isNaN(totalCents) ? '' : (totalCents / 100).toFixed(2);
    const nickels = Math.floor(totalCents / 5);
    const nickelsString = nickels.toLocaleString();
    const pennies = totalCents - nickels * 5;
    const penniesString = pennies.toLocaleString();
    const hasError = !/^(\d+(\.\d*)?|\.\d+)$/.test(amount);
    let message = 'Invalid or missing amount';
    let css = 'error-message';
    if (!hasError) {
      message = 'We can make change for ' + totalString + ' with ' + nickelsString + ' nickels and ' + penniesString + ' pennies!';
      css = 'change-message';
    }
    document.querySelector('#status').innerHTML = message;
    document.querySelector('#status').className = css;
  }