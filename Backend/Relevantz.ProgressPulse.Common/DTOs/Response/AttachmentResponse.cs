namespace Relevantz.ProgressPulse.Common.DTOs.Response;

public class AttachmentResponse
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
}