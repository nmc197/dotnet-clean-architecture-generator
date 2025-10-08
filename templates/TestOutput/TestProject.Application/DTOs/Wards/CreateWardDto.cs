using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.Wards
{
    public class CreateWardDto
    {
        public int DistrictId { get; set; } = 0;
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int SortOrder { get; set; } = 0;
        public int? CreatedBy { get; set; }
    }
}
