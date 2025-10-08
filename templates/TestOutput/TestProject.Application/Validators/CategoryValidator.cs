using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Validators
{
    public class CategoryValidator : AbstractValidator<CreateCategoryDto>
    {
        public CategoryValidator()
        {
                RuleFor(x &#x3D;&gt; x.Name).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
        }
    }
}
