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
    [Route("api/v{version:apiVersion}/roles")]
    [ApiController]
    public class RoleController : BaseController,
        IBaseController<int, CreateRoleDto, UpdateRoleDto, RoleDTParameters>
    {
        private readonly IRoleService _roleService;
        
        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.ROLE, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateRoleDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _roleService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _roleService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.ROLE, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _roleService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _roleService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.ROLE, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] RoleDTParameters parameters)
        {
            var data = await _roleService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.ROLE, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _roleService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.ROLE, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateRoleDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _roleService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateRoleDto> objs)
        {
            var result = await _roleService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
