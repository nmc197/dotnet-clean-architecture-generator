using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestProject.Domain.Abstractions
{
    public interface IUnitOfWorkContext<TContext> : IAsyncDisposable where TContext : DbContext
    {
        Task<int> CommitAsync();
    }
}
