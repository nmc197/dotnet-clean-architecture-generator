using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Entities
{
    public class UserNotification : EntityCommonBase<int>
    {
        public int UserId { get; set; } = 0;
        public int NotificationId { get; set; } = 0;
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; } = DateTime.Now;
    }
}
