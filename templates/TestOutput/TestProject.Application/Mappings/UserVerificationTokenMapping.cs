using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class UserVerificationTokenMapping
    {
        public static UserVerificationToken ToEntity(this CreateUserVerificationTokenDto dto)
        {
            return new UserVerificationToken
            {
                UserId = dto.UserId,
                Token = dto.Token,
                TokenType = dto.TokenType,
                ExpiresAt = dto.ExpiresAt,
                IsUsed = dto.IsUsed,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static UserVerificationToken ToEntity(this UpdateUserVerificationTokenDto dto, UserVerificationToken existData)
        {
            existData.UserId = dto.UserId;
            existData.Token = dto.Token;
            existData.TokenType = dto.TokenType;
            existData.ExpiresAt = dto.ExpiresAt;
            existData.IsUsed = dto.IsUsed;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
