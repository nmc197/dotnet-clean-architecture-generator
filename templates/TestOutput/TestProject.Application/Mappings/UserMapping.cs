using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class UserMapping
    {
        public static User ToEntity(this CreateUserDto dto)
        {
            return new User
            {
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                Address = dto.Address,
                ProvinceId = dto.ProvinceId,
                DistrictId = dto.DistrictId,
                WardId = dto.WardId,
                UserStatusId = dto.UserStatusId,
                IsEmailVerified = dto.IsEmailVerified,
                IsPhoneVerified = dto.IsPhoneVerified,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static User ToEntity(this UpdateUserDto dto, User existData)
        {
            existData.Email = dto.Email;
            existData.PhoneNumber = dto.PhoneNumber;
            existData.FirstName = dto.FirstName;
            existData.LastName = dto.LastName;
            existData.DateOfBirth = dto.DateOfBirth;
            existData.Gender = dto.Gender;
            existData.Address = dto.Address;
            existData.ProvinceId = dto.ProvinceId;
            existData.DistrictId = dto.DistrictId;
            existData.WardId = dto.WardId;
            existData.UserStatusId = dto.UserStatusId;
            existData.IsEmailVerified = dto.IsEmailVerified;
            existData.IsPhoneVerified = dto.IsPhoneVerified;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
