using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class AuditLogMapping
    {
        public static AuditLog ToEntity(this CreateAuditLogDto dto)
        {
            return new AuditLog
            {
                UserId = dto.UserId,
                EntityName = dto.EntityName,
                EntityId = dto.EntityId,
                Action = dto.Action,
                OldValues = dto.OldValues,
                NewValues = dto.NewValues,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static AuditLog ToEntity(this UpdateAuditLogDto dto, AuditLog existData)
        {
            existData.UserId = dto.UserId;
            existData.EntityName = dto.EntityName;
            existData.EntityId = dto.EntityId;
            existData.Action = dto.Action;
            existData.OldValues = dto.OldValues;
            existData.NewValues = dto.NewValues;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
