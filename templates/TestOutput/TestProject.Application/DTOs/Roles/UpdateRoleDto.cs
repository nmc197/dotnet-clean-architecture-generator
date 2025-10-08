using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.Roles
{
    public class UpdateRoleDto : CreateRoleDto
    {
        public int Id { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
