namespace Relevantz.ProgressPulse.Common.Entities;

public class PPWeeklyLog
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Impact { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }

    public ICollection<PPLogAttachment> Attachments { get; set; } = new List<PPLogAttachment>();
    public ICollection<PPLogGoalMapping> LogGoalMappings { get; set; }
    = new List<PPLogGoalMapping>();
    public ICollection<PPLogComment> LogComments { get; set; } = new List<PPLogComment>();
}