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
    [Route("api/v{version:apiVersion}/user-roles")]
    [ApiController]
    public class UserRoleController : BaseController,
        IBaseController<int, CreateUserRoleDto, UpdateUserRoleDto, UserRoleDTParameters>
    {
        private readonly IUserRoleService _userRoleService;
        
        public UserRoleController(IUserRoleService userRoleService)
        {
            _userRoleService = userRoleService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.USERROLE, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateUserRoleDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _userRoleService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _userRoleService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.USERROLE, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _userRoleService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _userRoleService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.USERROLE, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] UserRoleDTParameters parameters)
        {
            var data = await _userRoleService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.USERROLE, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _userRoleService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.USERROLE, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateUserRoleDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _userRoleService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateUserRoleDto> objs)
        {
            var result = await _userRoleService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
