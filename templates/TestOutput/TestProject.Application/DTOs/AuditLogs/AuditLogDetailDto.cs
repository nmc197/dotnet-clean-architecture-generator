using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.AuditLogs
{
    public class AuditLogDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? LastModifiedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public int UserId { get; set; } = 0;
        public string EntityName { get; set; } = null!;
        public int EntityId { get; set; } = 0;
        public string Action { get; set; } = null!;
        public string OldValues { get; set; } = null!;
        public string NewValues { get; set; } = null!;
    }
}
