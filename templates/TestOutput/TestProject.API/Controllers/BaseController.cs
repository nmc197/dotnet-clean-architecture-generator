using TestProject.Application.Constants;
using TestProject.Application.Interfaces;
using TestProject.Shared.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;

namespace TestProject.API.Controllers
{
    public abstract class BaseController : Controller
    {
        [NonAction]
        protected IActionResult BaseResult(ApiResponse apiResponse)
        {
            switch (apiResponse.Status)
            {
                case (int)HttpStatusCode.OK:
                    return Ok(apiResponse);
                case (int)HttpStatusCode.NotFound:
                    return NotFound(apiResponse);
                case (int)HttpStatusCode.Unauthorized:
                    return Unauthorized(apiResponse);
                case (int)HttpStatusCode.BadRequest:
                    return BadRequest(apiResponse);
                case (int)HttpStatusCode.UnprocessableEntity:
                    return UnprocessableEntity(apiResponse);
                case (int)HttpStatusCode.Forbidden:
                    return new ObjectResult(apiResponse)
                    {
                        StatusCode = (int)HttpStatusCode.Forbidden,
                    };
                default:
                    return new ObjectResult(apiResponse)
                    {
                        StatusCode = apiResponse.Status,
                    };
            }
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value != null)
                    .Where(x => x.Value.Errors.Count > 0)
                .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToList())
                    .Select(x => new FormErrorMessage
                    {
                        Field = x.Key,
                        Messages = x.Value
                    }).ToList();

                var apiResponse = ApiResponse.BadRequest(
                    ErrorMessagesConstants.GetMessage(ApiCodeConstants.Common.ValidationError), 
                    ApiCodeConstants.Common.ValidationError, 
                    errors);

                context.Result = BaseResult(apiResponse);
                return;
            }

            await next();
        }

        protected int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("UserId");
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        protected string GetCurrentUserEmail()
        {
            var emailClaim = User.FindFirst("Email");
            return emailClaim?.Value ?? string.Empty;
        }

        protected string GetCurrentUserRole()
        {
            var roleClaim = User.FindFirst("Role");
            return roleClaim?.Value ?? string.Empty;
        }
    }
}


