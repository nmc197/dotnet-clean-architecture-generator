using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.DTParamters
{
    public class UserDeviceDTParameters : DTParameters
    {
        public int UserId { get; set; } = 0;
        public string DeviceId { get; set; } = null!;
        public string DeviceName { get; set; } = null!;
        public string DeviceType { get; set; } = null!;
    }
}
