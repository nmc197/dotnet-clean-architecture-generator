using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Mappings
{
    public static class UserDeviceMapping
    {
        public static UserDevice ToEntity(this CreateUserDeviceDto dto)
        {
            return new UserDevice
            {
                UserId = dto.UserId,
                DeviceId = dto.DeviceId,
                DeviceName = dto.DeviceName,
                DeviceType = dto.DeviceType,
                IsActive = dto.IsActive,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
        }

        public static UserDevice ToEntity(this UpdateUserDeviceDto dto, UserDevice existData)
        {
            existData.UserId = dto.UserId;
            existData.DeviceId = dto.DeviceId;
            existData.DeviceName = dto.DeviceName;
            existData.DeviceType = dto.DeviceType;
            existData.IsActive = dto.IsActive;
            existData.UpdatedBy = dto.UpdatedBy;
            existData.LastModifiedDate = DateTime.Now;
            return existData;
        }
    }
}
