using FluentValidation;
using Relevantz.ProgressPulse.Common.DTOs.Request;

namespace Relevantz.ProgressPulse.Common.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email format is invalid.")
            .MaximumLength(256).WithMessage("Email cannot exceed 256 characters.");

        // RuleFor(x => x.Password)
        //     .NotEmpty().WithMessage("Password is required.")
        //     .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
        //     .MaximumLength(100).WithMessage("Password cannot exceed 100 characters.");

        // Stronger policy (optional)
        // RuleFor(x => x.Password)
        //     .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
        //     .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
        //     .Matches(@"\d").WithMessage("Password must contain at least one digit.")
        //     .Matches(@"[\W_]").WithMessage("Password must contain at least one special character.");
    }
}