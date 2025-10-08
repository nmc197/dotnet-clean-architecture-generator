using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.Entities
{
    public class FolderUpload : EntityCommonBase<int>
    {
        public string FolderName { get; set; } = null!;
        public string FolderPath { get; set; } = null!;
        public int CreatedBy { get; set; } = 0;
    }
}
