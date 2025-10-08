using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Entities
{
    public class User : EntityCommonBase<int>
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
        public bool IsEmailVerified { get; set; } = false;
        public bool IsPhoneVerified { get; set; } = false;
        [JsonIgnore]
        public virtual ICollection<Order>  { get; set; } = new List<Order>();
        [JsonIgnore]
        public virtual ICollection<UserRole>  { get; set; } = new List<UserRole>();
        [JsonIgnore]
        public virtual ICollection<UserSession>  { get; set; } = new List<UserSession>();
        [JsonIgnore]
        public virtual ICollection<UserDevice>  { get; set; } = new List<UserDevice>();
        [JsonIgnore]
        public virtual ICollection<UserVerificationToken>  { get; set; } = new List<UserVerificationToken>();
        [JsonIgnore]
        public virtual ICollection<UserNotification>  { get; set; } = new List<UserNotification>();
    }
}
