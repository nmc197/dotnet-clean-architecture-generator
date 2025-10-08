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
    [Route("api/v{version:apiVersion}/user-sessions")]
    [ApiController]
    public class UserSessionController : BaseController,
        IBaseController<int, CreateUserSessionDto, UpdateUserSessionDto, UserSessionDTParameters>
    {
        private readonly IUserSessionService _userSessionService;
        
        public UserSessionController(IUserSessionService userSessionService)
        {
            _userSessionService = userSessionService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.USERSESSION, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateUserSessionDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _userSessionService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _userSessionService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.USERSESSION, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _userSessionService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _userSessionService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.USERSESSION, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] UserSessionDTParameters parameters)
        {
            var data = await _userSessionService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.USERSESSION, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _userSessionService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.USERSESSION, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateUserSessionDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _userSessionService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateUserSessionDto> objs)
        {
            var result = await _userSessionService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
