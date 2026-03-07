namespace Relevantz.ProgressPulse.Common.DTOs.Response;

public class GoalDetailResponse
{
    public int GoalId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public List<GoalLogDetail> Logs { get; set; } = new();
}

public class GoalLogDetail
{
    public int WeeklyLogId { get; set; }
    public string LogTitle { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public List<string> ManagerComments { get; set; } = new();
}