using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Entities
{
    public class Permission : EntityCommonBase<int>
    {
        public string Code { get; set; } = null!;
        public string Color { get; set; } = null!;
        public int SortOrder { get; set; } = 0;
    }
}
