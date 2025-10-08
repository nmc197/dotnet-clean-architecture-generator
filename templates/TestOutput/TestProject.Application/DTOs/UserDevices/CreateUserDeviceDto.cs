using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.UserDevices
{
    public class CreateUserDeviceDto
    {
        public int UserId { get; set; } = 0;
        public string DeviceId { get; set; } = null!;
        public string DeviceName { get; set; } = null!;
        public string DeviceType { get; set; } = null!;
        public bool IsActive { get; set; } = true;
        public int? CreatedBy { get; set; }
    }
}
