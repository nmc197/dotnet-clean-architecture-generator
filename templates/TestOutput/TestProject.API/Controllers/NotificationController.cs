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
    [Route("api/v{version:apiVersion}/notifications")]
    [ApiController]
    public class NotificationController : BaseController,
        IBaseController<int, CreateNotificationDto, UpdateNotificationDto, NotificationDTParameters>
    {
        private readonly INotificationService _notificationService;
        
        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.NOTIFICATION, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateNotificationDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _notificationService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _notificationService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.NOTIFICATION, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _notificationService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _notificationService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.NOTIFICATION, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] NotificationDTParameters parameters)
        {
            var data = await _notificationService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.NOTIFICATION, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _notificationService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.NOTIFICATION, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateNotificationDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _notificationService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateNotificationDto> objs)
        {
            var result = await _notificationService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
