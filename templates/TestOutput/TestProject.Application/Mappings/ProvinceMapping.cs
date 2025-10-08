using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class ProvinceMapping
    {
        public static Province ToEntity(this CreateProvinceDto dto)
        {
            return new Province
            {
                Code = dto.Code,
                Name = dto.Name,
                SortOrder = dto.SortOrder,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static Province ToEntity(this UpdateProvinceDto dto, Province existData)
        {
            existData.Code = dto.Code;
            existData.Name = dto.Name;
            existData.SortOrder = dto.SortOrder;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
