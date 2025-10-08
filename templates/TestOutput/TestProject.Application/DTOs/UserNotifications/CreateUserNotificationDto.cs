using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.UserNotifications
{
    public class CreateUserNotificationDto
    {
        public int UserId { get; set; } = 0;
        public int NotificationId { get; set; } = 0;
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; } = DateTime.Now;
        public int? CreatedBy { get; set; }
    }
}
