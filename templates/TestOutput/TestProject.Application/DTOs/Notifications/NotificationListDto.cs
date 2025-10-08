using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.Notifications
{
    public class NotificationListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int NotificationCategoryId { get; set; } = 0;
        public int NotificationTypeId { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime? PublishedAt { get; set; } = DateTime.Now;
    }
}
