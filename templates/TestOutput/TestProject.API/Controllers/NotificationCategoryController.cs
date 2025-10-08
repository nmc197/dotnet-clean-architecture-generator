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
    [Route("api/v{version:apiVersion}/notification-categories")]
    [ApiController]
    public class NotificationCategoryController : BaseController,
        IBaseController<int, CreateNotificationCategoryDto, UpdateNotificationCategoryDto, NotificationCategoryDTParameters>
    {
        private readonly INotificationCategoryService _notificationCategoryService;
        
        public NotificationCategoryController(INotificationCategoryService notificationCategoryService)
        {
            _notificationCategoryService = notificationCategoryService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.NOTIFICATIONCATEGORY, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateNotificationCategoryDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _notificationCategoryService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _notificationCategoryService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.NOTIFICATIONCATEGORY, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _notificationCategoryService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _notificationCategoryService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.NOTIFICATIONCATEGORY, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] NotificationCategoryDTParameters parameters)
        {
            var data = await _notificationCategoryService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.NOTIFICATIONCATEGORY, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _notificationCategoryService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.NOTIFICATIONCATEGORY, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateNotificationCategoryDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _notificationCategoryService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateNotificationCategoryDto> objs)
        {
            var result = await _notificationCategoryService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
