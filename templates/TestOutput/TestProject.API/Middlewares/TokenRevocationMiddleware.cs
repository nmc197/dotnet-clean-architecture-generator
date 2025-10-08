using TestProject.Application.Constants;
using TestProject.Application.Interfaces;
using TestProject.Infrastructure.Persistence;
using TestProject.Infrastructure.Services;
using TestProject.Shared.Constants;
using TestProject.Shared.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.IdentityModel.Tokens.Jwt;

namespace TestProject.API.Middlewares
{
    public class TokenRevocationMiddleware
    {
        private readonly RequestDelegate _next;

        public TokenRevocationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, TestProjectContext dbContext, ITokenProviderService tokenProviderService)
        {
            var accessToken = context.Request.Headers["Authorization"]
            .FirstOrDefault()?.Split(" ").Last();

            if (!string.IsNullOrEmpty(accessToken))
            {
                JwtSecurityToken? token = null;

                try
                {
                    token = tokenProviderService.ParseToken(accessToken);
                }
                catch
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    var apiResponse = ApiResponse.Unauthorized(
                        ErrorMessagesConstants.GetMessage(ApiCodeConstants.Auth.InvalidToken), ApiCodeConstants.Auth.InvalidToken);
                    await context.Response.WriteAsJsonAsync(apiResponse);
                    return;
                }

                var jti = token?.Claims.FirstOrDefault(c => c.Type == ClaimNames.JTI)?.Value;

                if (!string.IsNullOrEmpty(jti))
                {
                    var isRevoked = await dbContext.UserSessions
                        .AnyAsync(r => r.AccessTokenJti == jti && r.IsRevoked);

                    if (isRevoked)
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        var apiResponse = ApiResponse.Unauthorized(
                            ErrorMessagesConstants.GetMessage(ApiCodeConstants.Auth.TokenRevoked), ApiCodeConstants.Auth.TokenRevoked);
                        await context.Response.WriteAsJsonAsync(apiResponse);
                        return;
                    }
                }
            }

            await _next(context);
        }
    }

    public static class TokenRevocationMiddlewareExtensions
    {
        public static IApplicationBuilder UseTokenRevocation(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TokenRevocationMiddleware>();
        }
    }
}


