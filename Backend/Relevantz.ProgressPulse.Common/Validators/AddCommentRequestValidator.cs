using FluentValidation;
using Relevantz.ProgressPulse.Common.DTOs.Request;

namespace Relevantz.ProgressPulse.Common.Validators;

public class AddCommentRequestValidator : AbstractValidator<AddCommentRequest>
{
    public AddCommentRequestValidator()
    {
        RuleFor(x => x.WeeklyLogId)
            .GreaterThan(0).WithMessage("WeeklyLogId must be a positive integer.");

        RuleFor(x => x.Comment)
            .NotEmpty().WithMessage("Comment is required.")
            .MinimumLength(3).WithMessage("Comment must be at least 3 characters.")
            .MaximumLength(2000).WithMessage("Comment cannot exceed 2000 characters.");
    }
}