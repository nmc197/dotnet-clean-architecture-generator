using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class FolderUploadMapping
    {
        public static FolderUpload ToEntity(this CreateFolderUploadDto dto)
        {
            return new FolderUpload
            {
                FolderName = dto.FolderName,
                FolderPath = dto.FolderPath,
                CreatedBy = dto.CreatedBy,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static FolderUpload ToEntity(this UpdateFolderUploadDto dto, FolderUpload existData)
        {
            existData.FolderName = dto.FolderName;
            existData.FolderPath = dto.FolderPath;
            existData.CreatedBy = dto.CreatedBy;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
