using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class UserStatusMapping
    {
        public static UserStatus ToEntity(this CreateUserStatusDto dto)
        {
            return new UserStatus
            {
                Code = dto.Code,
                Color = dto.Color,
                SortOrder = dto.SortOrder,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static UserStatus ToEntity(this UpdateUserStatusDto dto, UserStatus existData)
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
