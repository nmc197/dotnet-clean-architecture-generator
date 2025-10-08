using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TestProject.Storage.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FileController : ControllerBase
    {
        [HttpPost("upload")]
        [RequestSizeLimit(52428800)] // 50 MB
        public async Task<IActionResult> Upload(IFormFile file, CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            return Ok(new { fileName = file?.FileName, size = file?.Length ?? 0 });
        }

        [HttpPost("folder")]
        public IActionResult CreateFolder([FromBody] object request)
        {
            return Ok(new { created = true });
        }
    }
}


