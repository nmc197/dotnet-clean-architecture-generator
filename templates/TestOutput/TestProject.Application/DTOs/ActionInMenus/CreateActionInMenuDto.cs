using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.ActionInMenus
{
    public class CreateActionInMenuDto
    {
        public int ActionId { get; set; } = 0;
        public int MenuId { get; set; } = 0;
        public int RoleId { get; set; } = 0;
        public int? CreatedBy { get; set; }
    }
}
