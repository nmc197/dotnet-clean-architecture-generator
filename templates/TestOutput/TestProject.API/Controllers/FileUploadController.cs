using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TestProject.Shared.Entities;

namespace TestProject.API.Controllers
{
    [Authorize]
    [ApiVersion(1)]
    [Route("api/v{version:apiVersion}/file-uploads")]
    [ApiController]
    public class FileUploadController : BaseController,
        IBaseController<int, CreateFileUploadDto, UpdateFileUploadDto, FileUploadDTParameters>
    {
        private readonly IFileUploadService _fileUploadService;
        
        public FileUploadController(IFileUploadService fileUploadService)
        {
            _fileUploadService = fileUploadService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.FILEUPLOAD, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateFileUploadDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _fileUploadService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _fileUploadService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.FILEUPLOAD, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _fileUploadService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _fileUploadService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.FILEUPLOAD, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] FileUploadDTParameters parameters)
        {
            var data = await _fileUploadService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.FILEUPLOAD, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _fileUploadService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.FILEUPLOAD, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateFileUploadDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _fileUploadService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateFileUploadDto> objs)
        {
            var result = await _fileUploadService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
