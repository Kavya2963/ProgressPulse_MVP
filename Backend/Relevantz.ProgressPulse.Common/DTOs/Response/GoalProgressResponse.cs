namespace Relevantz.ProgressPulse.Common.DTOs.Response;

public class GoalProgressResponse
{
    public int GoalId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int LogsLinked { get; set; }
    public double CompletionPercentage { get; set; }
}