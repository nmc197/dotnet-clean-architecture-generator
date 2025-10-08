using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Entities
{
    public class UserVerificationToken : EntityCommonBase<int>
    {
        public int UserId { get; set; } = 0;
        public string Token { get; set; } = null!;
        public string TokenType { get; set; } = null!;
        public DateTime ExpiresAt { get; set; } = DateTime.Now;
        public bool IsUsed { get; set; } = false;
    }
}
