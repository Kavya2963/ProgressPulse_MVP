using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Common.DTOs.Response;
using Relevantz.ProgressPulse.Core.IService;
namespace Relevantz.ProgressPulse.Core.IService;

public interface IManagerService
{
    Task<object> GetFilteredTeamLogsAsync(
        int managerId,
        ManagerLogFilterRequest filter);

    Task AddCommentAsync(int managerId, int weeklyLogId, string comment);
    Task<ManagerDashboardResponse> GetDashboardSummaryAsync(int managerId);
    Task<EmployeeSummaryResponse> GetEmployeeSummaryAsync(int managerId, int employeeId);
    Task<AppraisalReportResponse> GetAppraisalReportAsync(int managerId, int employeeId);
    Task<List<EmployeeListResponse>> GetMyEmployeesAsync(int managerId);
Task<List<WeeklyDigestResponse>> GetWeeklyDigestAsync(
    int managerId, int employeeId, DateTime weekStart);


}