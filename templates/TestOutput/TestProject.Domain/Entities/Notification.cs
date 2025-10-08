using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Entities
{
    public class Notification : EntityCommonBase<int>
    {
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int NotificationCategoryId { get; set; } = 0;
        public int NotificationTypeId { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime? PublishedAt { get; set; } = DateTime.Now;
        [JsonIgnore]
        public virtual ICollection<UserNotification>  { get; set; } = new List<UserNotification>();
    }
}
