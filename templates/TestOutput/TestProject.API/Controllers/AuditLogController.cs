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
    [Route("api/v{version:apiVersion}/audit-logs")]
    [ApiController]
    public class AuditLogController : BaseController,
        IBaseController<int, CreateAuditLogDto, UpdateAuditLogDto, AuditLogDTParameters>
    {
        private readonly IAuditLogService _auditLogService;
        
        public AuditLogController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.AUDITLOG, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateAuditLogDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _auditLogService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _auditLogService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.AUDITLOG, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _auditLogService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _auditLogService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.AUDITLOG, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] AuditLogDTParameters parameters)
        {
            var data = await _auditLogService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.AUDITLOG, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _auditLogService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.AUDITLOG, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateAuditLogDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _auditLogService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateAuditLogDto> objs)
        {
            var result = await _auditLogService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
