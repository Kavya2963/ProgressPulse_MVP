using FluentValidation;
using Relevantz.ProgressPulse.Common.DTOs.Request;

namespace Relevantz.ProgressPulse.Common.Validators;

public class CreateWeeklyLogRequestValidator : AbstractValidator<CreateWeeklyLogRequest>
{
    public CreateWeeklyLogRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(100).WithMessage("Title cannot exceed 100 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");

        RuleFor(x => x.Impact)
            .NotEmpty().WithMessage("Impact is required");

        RuleFor(x => x.GoalIds)
    .NotEmpty().WithMessage("At least one goal must be selected");
    }
}