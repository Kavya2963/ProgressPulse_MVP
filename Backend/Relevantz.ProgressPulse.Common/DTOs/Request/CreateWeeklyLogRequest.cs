namespace Relevantz.ProgressPulse.Common.DTOs.Request;

public class CreateWeeklyLogRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;

    public List<int> GoalIds { get; set; } = new();
}