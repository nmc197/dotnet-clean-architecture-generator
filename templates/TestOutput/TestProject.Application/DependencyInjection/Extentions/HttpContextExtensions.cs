using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace TestProject.Application.DependencyInjection.Extentions
{
    public static class HttpContextExtensions
    {
        public static IServiceCollection AddHttpContextAccessorIfMissing(this IServiceCollection services)
        {
            services.AddHttpContextAccessor();
            return services;
        }
    }
}


