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
    [Route("api/v{version:apiVersion}/wards")]
    [ApiController]
    public class WardController : BaseController,
        IBaseController<int, CreateWardDto, UpdateWardDto, WardDTParameters>
    {
        private readonly IWardService _wardService;
        
        public WardController(IWardService wardService)
        {
            _wardService = wardService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.WARD, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateWardDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _wardService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _wardService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.WARD, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _wardService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _wardService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.WARD, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] WardDTParameters parameters)
        {
            var data = await _wardService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.WARD, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _wardService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.WARD, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateWardDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _wardService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateWardDto> objs)
        {
            var result = await _wardService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
