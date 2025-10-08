using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.DTParamters
{
    public class UserSessionDTParameters : DTParameters
    {
        public int UserId { get; set; } = 0;
        public string AccessTokenJti { get; set; } = null!;
        public string RefreshTokenJti { get; set; } = null!;
        public DateTime ExpiresAt { get; set; } = DateTime.Now;
    }
}
