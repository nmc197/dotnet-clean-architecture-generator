using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TestProject.Shared.Entities;

namespace TestProject.Application.Mappings
{
    public static class FileUploadMapping
    {
        public static FileUpload ToEntity(this CreateFileUploadDto dto)
        {
            return new FileUpload
            {
                FileName = dto.FileName,
                OriginalFileName = dto.OriginalFileName,
                FilePath = dto.FilePath,
                FileSize = dto.FileSize,
                MimeType = dto.MimeType,
                FileExtension = dto.FileExtension,
                UploadedBy = dto.UploadedBy,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static FileUpload ToEntity(this UpdateFileUploadDto dto, FileUpload existData)
        {
            existData.FileName = dto.FileName;
            existData.OriginalFileName = dto.OriginalFileName;
            existData.FilePath = dto.FilePath;
            existData.FileSize = dto.FileSize;
            existData.MimeType = dto.MimeType;
            existData.FileExtension = dto.FileExtension;
            existData.UploadedBy = dto.UploadedBy;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
