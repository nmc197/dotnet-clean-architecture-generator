using System.Net.Http.Headers;

namespace TestProject.Shared.Extensions
{
    public static class HttpClientExtensions
    {
        public static void SetBearerToken(this HttpClient http, string token)
        {
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }
    }
}


