using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.ProgressPulse.Core.IService;
using System.Security.Claims;
using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Api.Helpers; 


namespace Relevantz.ProgressPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Manager")]
public class ManagerController : ControllerBase
{
    private readonly IManagerService _service;
    private readonly ICommentService _commentService;

    public ManagerController(
        IManagerService service,
        ICommentService commentService)
    {
        _service = service;
        _commentService = commentService;
    }

    [HttpGet("team-logs")]
    public async Task<IActionResult> GetTeamLogs(
        [FromQuery] ManagerLogFilterRequest filter)
    {
        var managerId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await _service
            .GetFilteredTeamLogsAsync(managerId, filter);

        return Ok(result);
    }

    [HttpPost("comment")]
    public async Task<IActionResult> AddComment(
        [FromBody] AddCommentRequest request)
    {
        var managerId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        await _commentService
            .AddCommentAsync(managerId, request);

        return Ok("Comment added successfully");
    }
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var managerId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await _service
            .GetDashboardSummaryAsync(managerId);

        return Ok(result);
    }
    [HttpGet("employee-summary/{employeeId}")]
    public async Task<IActionResult> GetEmployeeSummary(int employeeId)
    {
        var managerId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await _service
            .GetEmployeeSummaryAsync(managerId, employeeId);

        return Ok(result);
    }
    [HttpGet("appraisal-report/{employeeId}")]
    public async Task<IActionResult> GetAppraisalReport(int employeeId)
    {
        var managerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await _service
            .GetAppraisalReportAsync(managerId, employeeId);

        return Ok(result);
    }
    [HttpGet("my-employees")]
    public async Task<IActionResult> GetMyEmployees()
    {
        var managerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _service.GetMyEmployeesAsync(managerId);
        return Ok(result);
    }
    [HttpGet("weekly-digest")]
public async Task<IActionResult> GetWeeklyDigest(
    [FromQuery] int employeeId,
    [FromQuery] DateTime? weekStart)
{
    var managerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var start = weekStart?.Date ?? DateTime.UtcNow.StartOfWeek();
    var result = await _service.GetWeeklyDigestAsync(managerId, employeeId, start);
    return Ok(result);
}



}