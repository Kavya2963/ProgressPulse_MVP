namespace Relevantz.ProgressPulse.Common.DTOs.Request;

public class ManagerLogFilterRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? GoalId { get; set; }
    public string? EmployeeName { get; set; }

    // Pagination
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}