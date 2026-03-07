namespace Relevantz.ProgressPulse.Common.DTOs.Request;

public class UpdateGoalRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
}