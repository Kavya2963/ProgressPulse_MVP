using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Core.IService;
using System.Security.Claims;

namespace Relevantz.ProgressPulse.Api.Controllers;

[ApiController]
[Route("api/manager/goals")]
[Authorize(Roles = "Manager")]
public class ManagerGoalController : ControllerBase
{
    private readonly IGoalService _service;

    public ManagerGoalController(IGoalService service)
    {
        _service = service;
    }

    [HttpPost("assign")]
    public async Task<IActionResult> AssignGoal([FromBody] AssignGoalRequest request)
    {
        var managerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _service.AssignGoalAsync(managerId, request);
        return Ok("Goal assigned successfully");
    }

    [HttpGet("assigned")]
    public async Task<IActionResult> GetAssignedGoals()
    {
        var managerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var goals = await _service.GetAssignedGoalsAsync(managerId);
        return Ok(goals);
    }
}
