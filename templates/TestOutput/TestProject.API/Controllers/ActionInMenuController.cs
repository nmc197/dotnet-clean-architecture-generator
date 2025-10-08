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
    [Route("api/v{version:apiVersion}/action-in-menus")]
    [ApiController]
    public class ActionInMenuController : BaseController,
        IBaseController<int, CreateActionInMenuDto, UpdateActionInMenuDto, ActionInMenuDTParameters>
    {
        private readonly IActionInMenuService _actionInMenuService;
        
        public ActionInMenuController(IActionInMenuService actionInMenuService)
        {
            _actionInMenuService = actionInMenuService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.ACTIONINMENU, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateActionInMenuDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _actionInMenuService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _actionInMenuService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.ACTIONINMENU, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _actionInMenuService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _actionInMenuService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.ACTIONINMENU, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] ActionInMenuDTParameters parameters)
        {
            var data = await _actionInMenuService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.ACTIONINMENU, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _actionInMenuService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.ACTIONINMENU, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateActionInMenuDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _actionInMenuService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateActionInMenuDto> objs)
        {
            var result = await _actionInMenuService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
