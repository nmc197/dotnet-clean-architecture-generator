using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.ActionInMenus
{
    public class ActionInMenuDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? LastModifiedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public int ActionId { get; set; } = 0;
        public int MenuId { get; set; } = 0;
        public int RoleId { get; set; } = 0;
    }
}
