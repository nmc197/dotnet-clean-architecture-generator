using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.FolderUploads
{
    public class FolderUploadListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public string FolderName { get; set; } = null!;
        public string FolderPath { get; set; } = null!;
        public int CreatedBy { get; set; } = 0;
    }
}
