namespace Relevantz.ProgressPulse.Api.Helpers;

public static class DateExtensions
{
    public static DateTime StartOfWeek(this DateTime dt)
    {
        int diff = (7 + (dt.DayOfWeek - DayOfWeek.Monday)) % 7;
        return dt.AddDays(-diff).Date;
    }
}
