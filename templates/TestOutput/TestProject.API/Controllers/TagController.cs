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
    [Route("api/v{version:apiVersion}/tags")]
    [ApiController]
    public class TagController : BaseController,
        IBaseController<int, CreateTagDto, UpdateTagDto, TagDTParameters>
    {
        private readonly ITagService _tagService;
        
        public TagController(ITagService tagService)
        {
            _tagService = tagService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.TAG, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateTagDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _tagService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _tagService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.TAG, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _tagService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _tagService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.TAG, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] TagDTParameters parameters)
        {
            var data = await _tagService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.TAG, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _tagService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.TAG, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateTagDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _tagService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateTagDto> objs)
        {
            var result = await _tagService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
