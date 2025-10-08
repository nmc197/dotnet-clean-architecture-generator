using TestProject.Domain.Abstractions.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestProject.Domain.Abstractions
{
    public abstract class EntityCommonBase<Tkey> : EntityAuditBase<Tkey>, IEntityCommonBase
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}
