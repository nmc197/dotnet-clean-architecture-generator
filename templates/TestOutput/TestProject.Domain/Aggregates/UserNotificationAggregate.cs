using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Aggregates
{
    public class UserNotificationAggregate
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? LastModifiedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public int UserId { get; set; } = 0;
        public int NotificationId { get; set; } = 0;
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; } = DateTime.Now;
    }
}
