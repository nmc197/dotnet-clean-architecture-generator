using Microsoft.EntityFrameworkCore;

namespace TestProject.Domain.Abstractions.Repositories
{
    public interface IRepositoryBaseDbContext<TContext> where TContext : DbContext
    {
        TContext DbContext { get; }
    }
}


