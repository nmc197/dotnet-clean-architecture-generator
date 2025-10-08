using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Validators
{
    public class AuditLogValidator : AbstractValidator<CreateAuditLogDto>
    {
        public AuditLogValidator()
        {
                RuleFor(x &#x3D;&gt; x.EntityName).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.EntityName).MaximumLength(100).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
                RuleFor(x &#x3D;&gt; x.EntityId).GreaterThan(0).WithMessage(&quot;{PropertyName} must be greater than 0.&quot;)
                RuleFor(x &#x3D;&gt; x.Action).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.Action).MaximumLength(20).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
        }
    }
}
