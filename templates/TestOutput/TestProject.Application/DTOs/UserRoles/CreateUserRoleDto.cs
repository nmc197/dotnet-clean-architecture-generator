using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.UserRoles
{
    public class CreateUserRoleDto
    {
        public int UserId { get; set; } = 0;
        public int RoleId { get; set; } = 0;
        public int? CreatedBy { get; set; }
    }
}
