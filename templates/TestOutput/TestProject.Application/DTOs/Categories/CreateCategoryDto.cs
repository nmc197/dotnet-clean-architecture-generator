using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.Categories
{
    public class CreateCategoryDto
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;
        public int? CreatedBy { get; set; }
    }
}
