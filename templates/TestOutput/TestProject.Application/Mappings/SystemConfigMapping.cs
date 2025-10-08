using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class SystemConfigMapping
    {
        public static SystemConfig ToEntity(this CreateSystemConfigDto dto)
        {
            return new SystemConfig
            {
                Key = dto.Key,
                Value = dto.Value,
                Description = dto.Description,
                IsActive = dto.IsActive,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static SystemConfig ToEntity(this UpdateSystemConfigDto dto, SystemConfig existData)
        {
            existData.Key = dto.Key;
            existData.Value = dto.Value;
            existData.Description = dto.Description;
            existData.IsActive = dto.IsActive;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
