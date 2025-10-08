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
    [Route("api/v{version:apiVersion}/activity-logs")]
    [ApiController]
    public class ActivityLogController : BaseController,
        IBaseController<int, CreateActivityLogDto, UpdateActivityLogDto, ActivityLogDTParameters>
    {
        private readonly IActivityLogService _activityLogService;
        
        public ActivityLogController(IActivityLogService activityLogService)
        {
            _activityLogService = activityLogService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.ACTIVITYLOG, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateActivityLogDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _activityLogService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _activityLogService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.ACTIVITYLOG, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _activityLogService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _activityLogService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.ACTIVITYLOG, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] ActivityLogDTParameters parameters)
        {
            var data = await _activityLogService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.ACTIVITYLOG, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _activityLogService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.ACTIVITYLOG, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateActivityLogDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _activityLogService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateActivityLogDto> objs)
        {
            var result = await _activityLogService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
