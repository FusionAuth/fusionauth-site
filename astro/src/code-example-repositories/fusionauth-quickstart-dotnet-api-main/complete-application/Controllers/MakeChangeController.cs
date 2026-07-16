using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MakeChangeController : ControllerBase
    {
        [HttpGet]
        [Authorize(Roles = "teller,customer")]
        public Change Get(double total)
        {
            var change = new Change();
            change.Total = total;

            var totalCents = Convert.ToInt32(Math.Round(total * 100));
            change.Nickels = totalCents / 5;
            change.Pennies = totalCents % 5;
            return change;
        }
    }
}


