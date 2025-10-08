using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Interfaces.Repositories
{
    public interface IUserRepository : IRepositoryBase<User, int>
    {
        Task<DTResult<UserAggregate>> GetPagedAsync(UserDTParameters parameters);
    }
}
