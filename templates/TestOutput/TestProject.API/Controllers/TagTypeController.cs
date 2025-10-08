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
    [Route("api/v{version:apiVersion}/tag-types")]
    [ApiController]
    public class TagTypeController : BaseController,
        IBaseController<int, CreateTagTypeDto, UpdateTagTypeDto, TagTypeDTParameters>
    {
        private readonly ITagTypeService _tagTypeService;
        
        public TagTypeController(ITagTypeService tagTypeService)
        {
            _tagTypeService = tagTypeService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.TAGTYPE, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateTagTypeDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _tagTypeService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _tagTypeService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.TAGTYPE, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _tagTypeService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _tagTypeService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.TAGTYPE, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] TagTypeDTParameters parameters)
        {
            var data = await _tagTypeService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.TAGTYPE, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _tagTypeService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.TAGTYPE, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateTagTypeDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _tagTypeService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateTagTypeDto> objs)
        {
            var result = await _tagTypeService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
