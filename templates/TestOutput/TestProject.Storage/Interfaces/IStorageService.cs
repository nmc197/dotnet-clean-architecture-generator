using Microsoft.AspNetCore.Http;

namespace TestProject.Storage.Interfaces
{
    public interface IStorageService
    {
        Task<string> UploadAsync(IFormFile file, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(string path, CancellationToken cancellationToken = default);
        Task<bool> CreateFolderAsync(string path, CancellationToken cancellationToken = default);
    }
}


