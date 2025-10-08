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
    [Route("api/v{version:apiVersion}/districts")]
    [ApiController]
    public class DistrictController : BaseController,
        IBaseController<int, CreateDistrictDto, UpdateDistrictDto, DistrictDTParameters>
    {
        private readonly IDistrictService _districtService;
        
        public DistrictController(IDistrictService districtService)
        {
            _districtService = districtService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.DISTRICT, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateDistrictDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _districtService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _districtService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.DISTRICT, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _districtService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _districtService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.DISTRICT, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] DistrictDTParameters parameters)
        {
            var data = await _districtService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.DISTRICT, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _districtService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.DISTRICT, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateDistrictDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _districtService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateDistrictDto> objs)
        {
            var result = await _districtService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
