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
    [Route("api/v{version:apiVersion}/user-notifications")]
    [ApiController]
    public class UserNotificationController : BaseController,
        IBaseController<int, CreateUserNotificationDto, UpdateUserNotificationDto, UserNotificationDTParameters>
    {
        private readonly IUserNotificationService _userNotificationService;
        
        public UserNotificationController(IUserNotificationService userNotificationService)
        {
            _userNotificationService = userNotificationService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.USERNOTIFICATION, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateUserNotificationDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _userNotificationService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _userNotificationService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.USERNOTIFICATION, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _userNotificationService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _userNotificationService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.USERNOTIFICATION, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] UserNotificationDTParameters parameters)
        {
            var data = await _userNotificationService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.USERNOTIFICATION, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _userNotificationService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.USERNOTIFICATION, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateUserNotificationDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _userNotificationService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateUserNotificationDto> objs)
        {
            var result = await _userNotificationService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
