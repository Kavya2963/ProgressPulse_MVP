using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Core.IService;
using System.Security.Claims;

namespace Relevantz.ProgressPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Employee")]
public class WeeklyLogController : ControllerBase
{
    private readonly IWeeklyLogService _service;

    public WeeklyLogController(IWeeklyLogService service)
    {
        _service = service;
    }

[HttpPost]
public async Task<IActionResult> Create(CreateWeeklyLogRequest request)
{
    var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var logId  = await _service.CreateWeeklyLogAsync(userId, request);
    return Ok(new { id = logId });  // ← return id not string
}


    [HttpGet]
    public async Task<IActionResult> GetMyLogs([FromQuery] int? goalId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var logs = await _service.GetUserLogsAsync(userId, goalId);

        return Ok(logs);
    }
[HttpGet("{logId}/comments")]
public async Task<IActionResult> GetComments(int logId)
{
    var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var comments = await _service.GetLogCommentsAsync(userId, logId);
    return Ok(comments);
}


}