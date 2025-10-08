using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.UserNotifications
{
    public class UpdateUserNotificationDto : CreateUserNotificationDto
    {
        public int Id { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
