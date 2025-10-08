using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TestProject.Shared.Entities;

namespace TestProject.Application.DTOs.FileUploads
{
    public class CreateFileUploadDto
    {
        public string FileName { get; set; } = null!;
        public string OriginalFileName { get; set; } = null!;
        public string FilePath { get; set; } = null!;
        public long FileSize { get; set; } = 0;
        public string MimeType { get; set; } = null!;
        public string FileExtension { get; set; } = null!;
        public int UploadedBy { get; set; } = 0;
        public int? CreatedBy { get; set; }
    }
}
