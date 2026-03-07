using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;  

[ApiController]
[Route("api/[controller]")]
[Authorize]
[EnableCors("AllowProgressPulse")]  

public class AIController : ControllerBase
{
    private readonly HttpClient _http;

    public AIController(IHttpClientFactory factory)
    {
        _http = factory.CreateClient("FastAPI");
    }

    [HttpPost("goal-summary")]
    public async Task<IActionResult> GoalSummary([FromBody] GoalSummaryRequest req)
    {
        var response = await _http.PostAsJsonAsync("/ai/goal-summary", new {
            goals = req.Goals,
            employee_name = req.EmployeeName
        });
        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, "AI service error");
        var result = await response.Content.ReadAsStringAsync();
        return Ok(result);
    }

    [HttpPost("weekly-digest")]
    public async Task<IActionResult> WeeklyDigest([FromBody] DigestRequest req)
    {
        var response = await _http.PostAsJsonAsync("/ai/weekly-digest", new {
            logs = req.Logs,
            employee_name = req.EmployeeName,
            week_start = req.WeekStart
        });
        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, "AI service error");
        var result = await response.Content.ReadAsStringAsync();
        return Ok(result);
    }

    [HttpPost("progress-insight")]
    public async Task<IActionResult> ProgressInsight([FromBody] ProgressRequest req)
    {
        var response = await _http.PostAsJsonAsync("/ai/progress-insight", new {
            goals = req.Goals,
            employee_name = req.EmployeeName
        });
        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, "AI service error");
        var result = await response.Content.ReadAsStringAsync();
        return Ok(result);
    }
}
