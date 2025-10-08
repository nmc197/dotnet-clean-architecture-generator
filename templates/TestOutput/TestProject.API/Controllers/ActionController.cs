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
    [Route("api/v{version:apiVersion}/actions")]
    [ApiController]
    public class ActionController : BaseController,
        IBaseController<int, CreateActionDto, UpdateActionDto, ActionDTParameters>
    {
        private readonly IActionService _actionService;
        
        public ActionController(IActionService actionService)
        {
            _actionService = actionService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.ACTION, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateActionDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _actionService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _actionService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.ACTION, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _actionService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _actionService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.ACTION, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] ActionDTParameters parameters)
        {
            var data = await _actionService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.ACTION, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _actionService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.ACTION, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateActionDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _actionService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateActionDto> objs)
        {
            var result = await _actionService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
