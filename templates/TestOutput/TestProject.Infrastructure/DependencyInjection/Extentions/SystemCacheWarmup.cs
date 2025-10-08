using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace TestProject.Infrastructure.DependencyInjection.Extentions
{
    public static class SystemCacheWarmup
    {
        public static void Warmup(IMemoryCache cache, ILogger logger)
        {
            // Seed frequently used cache entries here if needed.
        }
    }
}


