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
    [Route("api/v{version:apiVersion}/categories")]
    [ApiController]
    public class CategoryController : BaseController,
        IBaseController<int, CreateCategoryDto, UpdateCategoryDto, CategoryDTParameters>
    {
        private readonly ICategoryService _categoryService;
        
        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.CATEGORY, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateCategoryDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _categoryService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _categoryService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.CATEGORY, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _categoryService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _categoryService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.CATEGORY, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] CategoryDTParameters parameters)
        {
            var data = await _categoryService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.CATEGORY, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _categoryService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.CATEGORY, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateCategoryDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _categoryService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateCategoryDto> objs)
        {
            var result = await _categoryService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
