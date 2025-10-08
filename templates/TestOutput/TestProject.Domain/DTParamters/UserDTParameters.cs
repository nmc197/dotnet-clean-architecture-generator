using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.DTParamters
{
    public class UserDTParameters : DTParameters
    {
        public string Email { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public DateTime? DateOfBirth { get; set; } = DateTime.Now;
        public string Gender { get; set; } = null!;
        public string Address { get; set; } = null!;
        public int ProvinceId { get; set; } = 0;
        public int DistrictId { get; set; } = 0;
        public int WardId { get; set; } = 0;
        public int UserStatusId { get; set; } = 0;
    }
}
