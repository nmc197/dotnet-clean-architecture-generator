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
    [Route("api/v{version:apiVersion}/user-statuses")]
    [ApiController]
    public class UserStatusController : BaseController,
        IBaseController<int, CreateUserStatusDto, UpdateUserStatusDto, UserStatusDTParameters>
    {
        private readonly IUserStatusService _userStatusService;
        
        public UserStatusController(IUserStatusService userStatusService)
        {
            _userStatusService = userStatusService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.USERSTATUS, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateUserStatusDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _userStatusService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _userStatusService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.USERSTATUS, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _userStatusService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _userStatusService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.USERSTATUS, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] UserStatusDTParameters parameters)
        {
            var data = await _userStatusService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.USERSTATUS, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _userStatusService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.USERSTATUS, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateUserStatusDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _userStatusService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateUserStatusDto> objs)
        {
            var result = await _userStatusService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
