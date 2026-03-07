using FluentValidation;
using Relevantz.ProgressPulse.Common.DTOs.Request;

namespace Relevantz.ProgressPulse.Common.Validators;

public class UpdateProgressRequestValidator : AbstractValidator<UpdateProgressRequest>
{
    public UpdateProgressRequestValidator()
    {
        RuleFor(x => x.ProgressPercentage)
            .InclusiveBetween(0, 100)
            .WithMessage("ProgressPercentage must be between 0 and 100.");
    }
}