function makeChange(event) {
    event.preventDefault();
    const amount = document.querySelector('#total').value;
    const total = Math.trunc(parseFloat(amount) * 100) / 100;
    const totalString = isNaN(total) ? '' : total.toFixed(2);
    const nickels = Math.floor(total / 0.05);
    const nickelsString = nickels.toLocaleString();
    const pennies = (total - 0.05 * nickels) / 0.01;
    const penniesString = Math.ceil(Math.trunc(pennies * 100) / 100).toLocaleString();
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