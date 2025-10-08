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
    public class UpdateFileUploadDto : CreateFileUploadDto
    {
        public int Id { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
