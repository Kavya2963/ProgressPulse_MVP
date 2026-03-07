using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Core.IService;
using System.Security.Claims;

namespace Relevantz.ProgressPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Employee")]
public class GoalController : ControllerBase
{
    private readonly IGoalService _service;

    public GoalController(IGoalService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateGoalRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        await _service.CreateGoalAsync(userId, request);

        return Ok("Goal created successfully");
    }

    [HttpGet]
    public async Task<IActionResult> GetMyGoals()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var goals = await _service.GetUserGoalsAsync(userId);

        return Ok(goals);
    }

   [HttpPut("{goalId}")]
public async Task<IActionResult> Update(int goalId, [FromBody] UpdateGoalRequest request)
{
    var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    await _service.UpdateGoalAsync(userId, goalId, request);
    return Ok("Goal updated successfully");
}

    [HttpGet("progress")]
    public async Task<IActionResult> GetGoalProgress()
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await _service.GetGoalProgressAsync(userId);

        return Ok(result);
    }
    [HttpGet("{goalId}/details")]
    public async Task<IActionResult> GetGoalDetails(int goalId)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await _service.GetGoalDetailsAsync(userId, goalId);

        return Ok(result);
    }
    [HttpPatch("{goalId}/progress")]
    public async Task<IActionResult> UpdateProgress(int goalId, [FromBody] UpdateProgressRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _service.UpdateProgressAsync(userId, goalId, request.ProgressPercentage);
        return Ok("Progress updated");
    }


}