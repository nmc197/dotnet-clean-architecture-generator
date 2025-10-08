using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.DTParamters
{
    public class UserNotificationDTParameters : DTParameters
    {
        public int UserId { get; set; } = 0;
        public int NotificationId { get; set; } = 0;
        public DateTime? ReadAt { get; set; } = DateTime.Now;
    }
}
