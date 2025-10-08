using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Validators
{
    public class ActivityLogValidator : AbstractValidator<CreateActivityLogDto>
    {
        public ActivityLogValidator()
        {
                RuleFor(x &#x3D;&gt; x.Action).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.Action).MaximumLength(100).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
        }
    }
}
