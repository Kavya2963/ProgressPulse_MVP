using System.ComponentModel.DataAnnotations.Schema;

namespace Relevantz.ProgressPulse.Common.Entities;

public class PPLogComment
{
    public int Id { get; set; }

    public int WeeklyLogId { get; set; }
    [ForeignKey(nameof(WeeklyLogId))]
    public PPWeeklyLog? WeeklyLog { get; set; }

    public int ManagerId { get; set; }
    public User? Manager { get; set; }

    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}