namespace Relevantz.ProgressPulse.Common.DTOs.Request;

public class AddCommentRequest
{
    public int WeeklyLogId { get; set; }
    public string Comment { get; set; } = string.Empty;
}