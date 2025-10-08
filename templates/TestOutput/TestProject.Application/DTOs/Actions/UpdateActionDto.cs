using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.Actions
{
    public class UpdateActionDto : CreateActionDto
    {
        public int Id { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
