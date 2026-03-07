namespace Relevantz.ProgressPulse.Common.Entities;

public class PPGoal
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Not Started";
    public int ProgressPercentage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string CreatedBy { get; set; } = "employee"; 
    public int? AssignedByManagerId { get; set; }       
    public string? Category { get; set; }               
    public string? Priority { get; set; }               
    public DateTime? DueDate { get; set; }

    public int TargetCount { get; set; } = 4;
    public User? User { get; set; }
    public ICollection<PPLogGoalMapping> LogGoalMappings { get; set; }
        = new List<PPLogGoalMapping>();
}
