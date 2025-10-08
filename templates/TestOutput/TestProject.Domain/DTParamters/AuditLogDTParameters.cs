using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.DTParamters
{
    public class AuditLogDTParameters : DTParameters
    {
        public int UserId { get; set; } = 0;
        public string EntityName { get; set; } = null!;
        public int EntityId { get; set; } = 0;
        public string Action { get; set; } = null!;
        public string OldValues { get; set; } = null!;
        public string NewValues { get; set; } = null!;
    }
}
