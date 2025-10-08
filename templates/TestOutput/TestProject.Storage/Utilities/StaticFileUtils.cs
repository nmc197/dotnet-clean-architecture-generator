using Microsoft.AspNetCore.StaticFiles;

namespace TestProject.Storage.Utilities
{
    public static class StaticFileUtils
    {
        private static readonly FileExtensionContentTypeProvider Provider = new();

        public static string GetContentType(string fileName)
        {
            if (Provider.TryGetContentType(fileName, out var contentType))
            {
                return contentType;
            }
            return "application/octet-stream";
        }
    }
}


