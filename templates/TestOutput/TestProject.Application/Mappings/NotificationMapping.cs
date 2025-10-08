using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class NotificationMapping
    {
        public static Notification ToEntity(this CreateNotificationDto dto)
        {
            return new Notification
            {
                Title = dto.Title,
                Content = dto.Content,
                NotificationCategoryId = dto.NotificationCategoryId,
                NotificationTypeId = dto.NotificationTypeId,
                IsActive = dto.IsActive,
                PublishedAt = dto.PublishedAt,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static Notification ToEntity(this UpdateNotificationDto dto, Notification existData)
        {
            existData.Title = dto.Title;
            existData.Content = dto.Content;
            existData.NotificationCategoryId = dto.NotificationCategoryId;
            existData.NotificationTypeId = dto.NotificationTypeId;
            existData.IsActive = dto.IsActive;
            existData.PublishedAt = dto.PublishedAt;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
