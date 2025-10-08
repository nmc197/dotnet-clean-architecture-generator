using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TestProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PermissonController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            // Note: Intentional name based on original spelling
            return Ok(new [] { "View", "Edit", "Delete" });
        }
    }
}


