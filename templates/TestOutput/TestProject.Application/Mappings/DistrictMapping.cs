using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class DistrictMapping
    {
        public static District ToEntity(this CreateDistrictDto dto)
        {
            return new District
            {
                ProvinceId = dto.ProvinceId,
                Code = dto.Code,
                Name = dto.Name,
                SortOrder = dto.SortOrder,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static District ToEntity(this UpdateDistrictDto dto, District existData)
        {
            existData.ProvinceId = dto.ProvinceId;
            existData.Code = dto.Code;
            existData.Name = dto.Name;
            existData.SortOrder = dto.SortOrder;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
