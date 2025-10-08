using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Interfaces.Repositories
{
    public interface IActionRepository : IRepositoryBase<Action, int>
    {
        Task<DTResult<ActionAggregate>> GetPagedAsync(ActionDTParameters parameters);
    }
}
