namespace Relevantz.ProgressPulse.Common.Entities;

public class PPLogAttachment
{
    public int Id { get; set; }

    public int WeeklyLogId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string FilePath { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public PPWeeklyLog? WeeklyLog { get; set; }
}