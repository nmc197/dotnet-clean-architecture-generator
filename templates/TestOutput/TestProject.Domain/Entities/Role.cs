using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Entities
{
    public class Role : EntityCommonBase<int>
    {
        public string Code { get; set; } = null!;
        public string Color { get; set; } = null!;
        public int SortOrder { get; set; } = 0;
        [JsonIgnore]
        public virtual ICollection<UserRole>  { get; set; } = new List<UserRole>();
        [JsonIgnore]
        public virtual ICollection<ActionInMenu>  { get; set; } = new List<ActionInMenu>();
    }
}
