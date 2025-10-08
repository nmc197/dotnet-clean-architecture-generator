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
    [Route("api/v{version:apiVersion}/menus")]
    [ApiController]
    public class MenuController : BaseController,
        IBaseController<int, CreateMenuDto, UpdateMenuDto, MenuDTParameters>
    {
        private readonly IMenuService _menuService;
        
        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.MENU, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateMenuDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _menuService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _menuService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.MENU, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _menuService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _menuService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.MENU, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] MenuDTParameters parameters)
        {
            var data = await _menuService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.MENU, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _menuService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.MENU, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateMenuDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _menuService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateMenuDto> objs)
        {
            var result = await _menuService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
