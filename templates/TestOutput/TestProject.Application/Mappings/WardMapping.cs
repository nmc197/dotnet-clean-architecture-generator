using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class WardMapping
    {
        public static Ward ToEntity(this CreateWardDto dto)
        {
            return new Ward
            {
                DistrictId = dto.DistrictId,
                Code = dto.Code,
                Name = dto.Name,
                SortOrder = dto.SortOrder,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static Ward ToEntity(this UpdateWardDto dto, Ward existData)
        {
            existData.DistrictId = dto.DistrictId;
            existData.Code = dto.Code;
            existData.Name = dto.Name;
            existData.SortOrder = dto.SortOrder;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
