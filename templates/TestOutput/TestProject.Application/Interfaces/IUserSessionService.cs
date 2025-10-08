using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Interfaces
{
    public interface IUserSessionService : IServiceBase<int, CreateUserSessionDto, UpdateUserSessionDto, UserSessionDTParameters>
    {
        // Add custom methods here if needed
    }
}
