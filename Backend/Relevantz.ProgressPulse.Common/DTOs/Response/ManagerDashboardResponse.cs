namespace Relevantz.ProgressPulse.Common.DTOs.Response;

public class ManagerDashboardResponse
{
    public int TotalEmployees { get; set; }
    public int LogsSubmittedThisWeek { get; set; }
    public int PendingLogsThisWeek { get; set; }
    public int TotalCommentsGiven { get; set; }
    public string? MostActiveEmployee { get; set; }
}