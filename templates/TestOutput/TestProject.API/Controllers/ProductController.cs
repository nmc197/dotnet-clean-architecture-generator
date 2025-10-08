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
    [Route("api/v{version:apiVersion}/products")]
    [ApiController]
    public class ProductController : BaseController,
        IBaseController<int, CreateProductDto, UpdateProductDto, ProductDTParameters>
    {
        private readonly IProductService _productService;
        
        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.PRODUCT, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateProductDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _productService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _productService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.PRODUCT, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _productService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _productService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.PRODUCT, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] ProductDTParameters parameters)
        {
            var data = await _productService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.PRODUCT, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _productService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.PRODUCT, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateProductDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _productService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateProductDto> objs)
        {
            var result = await _productService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
