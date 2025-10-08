using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestProject.Domain.Abstractions
{
    public interface IUnitOfWork : IAsyncDisposable
    {
        Task<int> CommitAsync();
    }
}
