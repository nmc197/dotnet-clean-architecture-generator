using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Interfaces
{
    public interface IProductService : IServiceBase<int, CreateProductDto, UpdateProductDto, ProductDTParameters>
    {
        // Add custom methods here if needed
    }
}
