using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Entities
{
    public class UserSession : EntityCommonBase<int>
    {
        public int UserId { get; set; } = 0;
        public string AccessTokenJti { get; set; } = null!;
        public string RefreshTokenJti { get; set; } = null!;
        public bool IsRevoked { get; set; } = false;
        public DateTime ExpiresAt { get; set; } = DateTime.Now;
    }
}
