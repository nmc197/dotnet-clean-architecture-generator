using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Entities
{
    public class District : EntityCommonBase<int>
    {
        public int ProvinceId { get; set; } = 0;
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int SortOrder { get; set; } = 0;
        [JsonIgnore]
        public virtual ICollection<Ward>  { get; set; } = new List<Ward>();
        [JsonIgnore]
        public virtual ICollection<User>  { get; set; } = new List<User>();
    }
}
