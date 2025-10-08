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
    [Route("api/v{version:apiVersion}/notification-types")]
    [ApiController]
    public class NotificationTypeController : BaseController,
        IBaseController<int, CreateNotificationTypeDto, UpdateNotificationTypeDto, NotificationTypeDTParameters>
    {
        private readonly INotificationTypeService _notificationTypeService;
        
        public NotificationTypeController(INotificationTypeService notificationTypeService)
        {
            _notificationTypeService = notificationTypeService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.NOTIFICATIONTYPE, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateNotificationTypeDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _notificationTypeService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _notificationTypeService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.NOTIFICATIONTYPE, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _notificationTypeService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _notificationTypeService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.NOTIFICATIONTYPE, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] NotificationTypeDTParameters parameters)
        {
            var data = await _notificationTypeService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.NOTIFICATIONTYPE, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _notificationTypeService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.NOTIFICATIONTYPE, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateNotificationTypeDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _notificationTypeService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateNotificationTypeDto> objs)
        {
            var result = await _notificationTypeService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
