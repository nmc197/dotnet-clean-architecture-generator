using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace TestProject.Shared.Services
{
    public class MemoryCacheService : ICacheService
    {
        private readonly IMemoryCache _cache;
        public MemoryCacheService(IMemoryCache cache) { _cache = cache; }
        public T? Get<T>(string key) => _cache.TryGetValue(key, out T value) ? value : default;
        public void Set<T>(string key, T value, int seconds = 300) => _cache.Set(key, value, System.TimeSpan.FromSeconds(seconds));
        public void Remove(string key) => _cache.Remove(key);
    }

    public class SerializeService : ISerializeService
    {
        public string Serialize<T>(T obj) => JsonSerializer.Serialize(obj);
        public T? Deserialize<T>(string json) => JsonSerializer.Deserialize<T>(json);
    }

    public class ScheduledJobService : IScheduledJobService
    {
        public void Schedule(string key, System.Action action, System.TimeSpan delay)
        {
            _ = Task.Run(async () => { await Task.Delay(delay); action(); });
        }
    }
}


