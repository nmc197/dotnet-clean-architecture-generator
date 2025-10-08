using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class UserSessionMapping
    {
        public static UserSession ToEntity(this CreateUserSessionDto dto)
        {
            return new UserSession
            {
                UserId = dto.UserId,
                AccessTokenJti = dto.AccessTokenJti,
                RefreshTokenJti = dto.RefreshTokenJti,
                IsRevoked = dto.IsRevoked,
                ExpiresAt = dto.ExpiresAt,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static UserSession ToEntity(this UpdateUserSessionDto dto, UserSession existData)
        {
            existData.UserId = dto.UserId;
            existData.AccessTokenJti = dto.AccessTokenJti;
            existData.RefreshTokenJti = dto.RefreshTokenJti;
            existData.IsRevoked = dto.IsRevoked;
            existData.ExpiresAt = dto.ExpiresAt;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
