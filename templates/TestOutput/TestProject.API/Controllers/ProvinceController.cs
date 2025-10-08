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
    [Route("api/v{version:apiVersion}/provinces")]
    [ApiController]
    public class ProvinceController : BaseController,
        IBaseController<int, CreateProvinceDto, UpdateProvinceDto, ProvinceDTParameters>
    {
        private readonly IProvinceService _provinceService;
        
        public ProvinceController(IProvinceService provinceService)
        {
            _provinceService = provinceService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.PROVINCE, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateProvinceDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _provinceService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _provinceService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.PROVINCE, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _provinceService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _provinceService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.PROVINCE, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] ProvinceDTParameters parameters)
        {
            var data = await _provinceService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.PROVINCE, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _provinceService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.PROVINCE, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateProvinceDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _provinceService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateProvinceDto> objs)
        {
            var result = await _provinceService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
