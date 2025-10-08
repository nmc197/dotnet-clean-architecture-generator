using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class ActivityLogMapping
    {
        public static ActivityLog ToEntity(this CreateActivityLogDto dto)
        {
            return new ActivityLog
            {
                UserId = dto.UserId,
                Action = dto.Action,
                Description = dto.Description,
                IpAddress = dto.IpAddress,
                UserAgent = dto.UserAgent,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static ActivityLog ToEntity(this UpdateActivityLogDto dto, ActivityLog existData)
        {
            existData.UserId = dto.UserId;
            existData.Action = dto.Action;
            existData.Description = dto.Description;
            existData.IpAddress = dto.IpAddress;
            existData.UserAgent = dto.UserAgent;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
