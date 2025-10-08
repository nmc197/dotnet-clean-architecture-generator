using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.API.Controllers
{
    [Authorize]
    [ApiVersion(1)]
    [Route("api/v{version:apiVersion}/folder-uploads")]
    [ApiController]
    public class FolderUploadController : BaseController,
        IBaseController<int, CreateFolderUploadDto, UpdateFolderUploadDto, FolderUploadDTParameters>
    {
        private readonly IFolderUploadService _folderUploadService;
        
        public FolderUploadController(IFolderUploadService folderUploadService)
        {
            _folderUploadService = folderUploadService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.FOLDERUPLOAD, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateFolderUploadDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _folderUploadService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _folderUploadService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.FOLDERUPLOAD, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _folderUploadService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _folderUploadService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.FOLDERUPLOAD, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] FolderUploadDTParameters parameters)
        {
            var data = await _folderUploadService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.FOLDERUPLOAD, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _folderUploadService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.FOLDERUPLOAD, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateFolderUploadDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _folderUploadService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateFolderUploadDto> objs)
        {
            var result = await _folderUploadService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
