using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TestProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login()
        {
            // TODO: Implement JWT login
            return Ok(new { token = "dummy-token" });
        }

        [HttpPost("refresh")]
        [Authorize]
        public IActionResult Refresh()
        {
            // TODO: Implement refresh token
            return Ok(new { token = "dummy-token" });
        }
    }
}


