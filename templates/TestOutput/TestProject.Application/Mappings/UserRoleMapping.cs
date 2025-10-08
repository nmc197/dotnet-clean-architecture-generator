using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class UserRoleMapping
    {
        public static UserRole ToEntity(this CreateUserRoleDto dto)
        {
            return new UserRole
            {
                UserId = dto.UserId,
                RoleId = dto.RoleId,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static UserRole ToEntity(this UpdateUserRoleDto dto, UserRole existData)
        {
            existData.UserId = dto.UserId;
            existData.RoleId = dto.RoleId;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
