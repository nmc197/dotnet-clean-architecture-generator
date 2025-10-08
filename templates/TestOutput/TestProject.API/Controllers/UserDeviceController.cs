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
    [Route("api/v{version:apiVersion}/user-devices")]
    [ApiController]
    public class UserDeviceController : BaseController,
        IBaseController<int, CreateUserDeviceDto, UpdateUserDeviceDto, UserDeviceDTParameters>
    {
        private readonly IUserDeviceService _userDeviceService;
        
        public UserDeviceController(IUserDeviceService userDeviceService)
        {
            _userDeviceService = userDeviceService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.USERDEVICE, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateUserDeviceDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _userDeviceService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _userDeviceService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.USERDEVICE, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _userDeviceService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _userDeviceService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.USERDEVICE, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] UserDeviceDTParameters parameters)
        {
            var data = await _userDeviceService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.USERDEVICE, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _userDeviceService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.USERDEVICE, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateUserDeviceDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _userDeviceService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateUserDeviceDto> objs)
        {
            var result = await _userDeviceService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
