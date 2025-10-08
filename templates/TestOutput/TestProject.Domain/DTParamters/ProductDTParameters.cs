using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Domain.DTParamters
{
    public class ProductDTParameters : DTParameters
    {
        public int Id { get; set; } = 0;
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; } = 0;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}
