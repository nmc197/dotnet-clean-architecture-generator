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
    [Route("api/v{version:apiVersion}/permissions")]
    [ApiController]
    public class PermissionController : BaseController,
        IBaseController<int, CreatePermissionDto, UpdatePermissionDto, PermissionDTParameters>
    {
        private readonly IPermissionService _permissionService;
        
        public PermissionController(IPermissionService permissionService)
        {
            _permissionService = permissionService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.PERMISSION, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreatePermissionDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _permissionService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _permissionService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.PERMISSION, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _permissionService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _permissionService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.PERMISSION, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] PermissionDTParameters parameters)
        {
            var data = await _permissionService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.PERMISSION, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _permissionService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.PERMISSION, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdatePermissionDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _permissionService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdatePermissionDto> objs)
        {
            var result = await _permissionService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
