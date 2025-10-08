using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Entities
{
    public class ActivityLog : EntityCommonBase<int>
    {
        public int UserId { get; set; } = 0;
        public string Action { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string IpAddress { get; set; } = null!;
        public string UserAgent { get; set; } = null!;
    }
}
