using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TestProject.Infrastructure.DependencyInjection.Extentions
{
    public static class ConfigureServices
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Example: services.AddDbContext<TestProjectContext>(options => options.UseSqlServer(configuration.GetConnectionString("Default")));
            return services;
        }
    }
}


