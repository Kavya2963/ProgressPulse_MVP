namespace Relevantz.ProgressPulse.Common.Entities;

public class PPUserManagerMapping
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public User? Employee { get; set; }

    public int ManagerId { get; set; }
    public User? Manager { get; set; }

    public string Level { get; set; } = string.Empty; // L1 or L2
}