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

            change.Nickels = Convert.ToInt32(Math.Floor(total / 0.05));
            change.Pennies = Convert.ToInt32(Math.Round((total - 0.05 * change.Nickels) / 0.01));
            return change;
        }
    }
}


