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
    [Route("api/v{version:apiVersion}/user-verification-tokens")]
    [ApiController]
    public class UserVerificationTokenController : BaseController,
        IBaseController<int, CreateUserVerificationTokenDto, UpdateUserVerificationTokenDto, UserVerificationTokenDTParameters>
    {
        private readonly IUserVerificationTokenService _userVerificationTokenService;
        
        public UserVerificationTokenController(IUserVerificationTokenService userVerificationTokenService)
        {
            _userVerificationTokenService = userVerificationTokenService;
        }

        [HttpPost]
        [CustomAuthorize(Enums.Menu.USERVERIFICATIONTOKEN, Enums.Action.CREATE)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateUserVerificationTokenDto obj)
        {
            obj.CreatedBy = this.GetLoggedInUserId();
            var data = await _userVerificationTokenService.CreateAsync(obj);
            return BaseResult(data);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAsync()
        {
            var data = await _userVerificationTokenService.GetAllAsync();
            return BaseResult(data);
        }

        [HttpGet("{id}")]
        [CustomAuthorize(Enums.Menu.USERVERIFICATIONTOKEN, Enums.Action.READ)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var data = await _userVerificationTokenService.GetByIdAsync(id);
            return BaseResult(data);
        }

        [HttpPost("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedAsync([FromBody] SearchQuery query)
        {
            var data = await _userVerificationTokenService.GetPagedAsync(query);
            return BaseResult(data);
        }

        [HttpPost("paged-advanced")]
        [CustomAuthorize(Enums.Menu.USERVERIFICATIONTOKEN, Enums.Action.READ)]
        public async Task<IActionResult> GetPagedAsync([FromBody] UserVerificationTokenDTParameters parameters)
        {
            var data = await _userVerificationTokenService.GetPagedAsync(parameters);
            return BaseResult(data);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize(Enums.Menu.USERVERIFICATIONTOKEN, Enums.Action.DELETE)]
        public async Task<IActionResult> SoftDeleteAsync(int id)
        {
            var result = await _userVerificationTokenService.SoftDeleteAsync(id);
            return BaseResult(result);
        }

        [HttpPut]
        [CustomAuthorize(Enums.Menu.USERVERIFICATIONTOKEN, Enums.Action.UPDATE)]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateUserVerificationTokenDto obj)
        {
            obj.UpdatedBy = this.GetLoggedInUserId();
            var result = await _userVerificationTokenService.UpdateAsync(obj);
            return BaseResult(result);
        }

        [HttpPut("update-list")]
        public async Task<IActionResult> UpdateListAsync([FromBody] List<UpdateUserVerificationTokenDto> objs)
        {
            var result = await _userVerificationTokenService.UpdateListAsync(objs);
            return BaseResult(result);
        }
    }
}
