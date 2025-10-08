using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.DTOs.UserSessions
{
    public class UserSessionListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UserId { get; set; } = 0;
        public string AccessTokenJti { get; set; } = null!;
        public string RefreshTokenJti { get; set; } = null!;
        public bool IsRevoked { get; set; } = false;
        public DateTime ExpiresAt { get; set; } = DateTime.Now;
    }
}
