using TestProject.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TestProject.Application.Validators
{
    public class UserVerificationTokenValidator : AbstractValidator<CreateUserVerificationTokenDto>
    {
        public UserVerificationTokenValidator()
        {
                RuleFor(x &#x3D;&gt; x.UserId).GreaterThan(0).WithMessage(&quot;{PropertyName} must be greater than 0.&quot;)
                RuleFor(x &#x3D;&gt; x.Token).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.Token).MaximumLength(200).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
                RuleFor(x &#x3D;&gt; x.TokenType).NotEmpty().WithMessage(&quot;{PropertyName} is required.&quot;)
                RuleFor(x &#x3D;&gt; x.TokenType).MaximumLength(20).WithMessage(&quot;{PropertyName} must not exceed {MaxLength} characters.&quot;)
        }
    }
}
