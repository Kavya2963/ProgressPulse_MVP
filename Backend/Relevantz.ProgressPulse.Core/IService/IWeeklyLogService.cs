using Relevantz.ProgressPulse.Core.IService;
using Relevantz.ProgressPulse.Common.DTOs.Response;
using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Relevantz.ProgressPulse.Core.IService;

public interface IWeeklyLogService
{
    Task<List<WeeklyLogResponse>> GetUserLogsAsync(int userId, int? goalId);
    Task<List<LogCommentResponse>> GetLogCommentsAsync(int userId, int logId);
Task<int> CreateWeeklyLogAsync(int userId, CreateWeeklyLogRequest request);



}