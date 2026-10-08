using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Channels;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Pages
{
    [Authorize]
    public class MakeChangeModel : PageModel
    {
        public string Message { get; private set; } = "";
        public bool Error { get; private set; } = false;
        public string Amount { get; set; } = "0.00";

        public void OnGet()
        {
        }

        public void OnPost(string amount)
        {
            MakeChange(amount);
        }

        public void MakeChange(string amount)
        {
            try
            {
                Amount = amount;

                decimal remainingamount = Convert.ToDecimal(amount);

                Message = "We can make change for";

                var coins = new[] { // ordered
                    new { name = "quarters", nominal   = 0.25m },
                    new { name = "dimes", nominal      = 0.10m },
                    new { name = "nickels", nominal    = 0.05m },
                    new { name = "pennies", nominal   = 0.01m }
                };

                foreach (var coin in coins)
                {
                    int count = (int)(remainingamount / coin.nominal);
                    remainingamount -= count * coin.nominal;

                    Message += $" {count} {coin.name}";
                }

                Message += "!";

            }
            catch (Exception ex)
            {
                Message = @$"There was a problem converting the amount submitted. {ex.Message}";
            }
        }
    }
}
