using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class UserNotificationMapping
    {
        public static UserNotification ToEntity(this CreateUserNotificationDto dto)
        {
            return new UserNotification
            {
                UserId = dto.UserId,
                NotificationId = dto.NotificationId,
                IsRead = dto.IsRead,
                ReadAt = dto.ReadAt,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static UserNotification ToEntity(this UpdateUserNotificationDto dto, UserNotification existData)
        {
            existData.UserId = dto.UserId;
            existData.NotificationId = dto.NotificationId;
            existData.IsRead = dto.IsRead;
            existData.ReadAt = dto.ReadAt;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
