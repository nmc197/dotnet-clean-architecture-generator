using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TestProject.Shared.Entities;

namespace TestProject.Application.Interfaces
{
    public interface IFileUploadService : IServiceBase<int, CreateFileUploadDto, UpdateFileUploadDto, FileUploadDTParameters>
    {
        // Add custom methods here if needed
    }
}
