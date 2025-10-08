using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class NotificationTypeMapping
    {
        public static NotificationType ToEntity(this CreateNotificationTypeDto dto)
        {
            return new NotificationType
            {
                Code = dto.Code,
                Color = dto.Color,
                SortOrder = dto.SortOrder,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static NotificationType ToEntity(this UpdateNotificationTypeDto dto, NotificationType existData)
        {
            existData.Code = dto.Code;
            existData.Color = dto.Color;
            existData.SortOrder = dto.SortOrder;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
