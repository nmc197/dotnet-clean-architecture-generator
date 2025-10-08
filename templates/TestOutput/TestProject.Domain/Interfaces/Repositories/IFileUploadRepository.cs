using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TestProject.Shared.Entities;

namespace TestProject.Domain.Interfaces.Repositories
{
    public interface IFileUploadRepository : IRepositoryBase<FileUpload, int>
    {
        Task<DTResult<FileUploadAggregate>> GetPagedAsync(FileUploadDTParameters parameters);
    }
}
