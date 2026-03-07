namespace Relevantz.ProgressPulse.Common.DTOs.Response;

public class ProfileResponse
{
    public int    Id        { get; set; }
    public string Name      { get; set; } = string.Empty;
    public string Email     { get; set; } = string.Empty;
    public string Role      { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
