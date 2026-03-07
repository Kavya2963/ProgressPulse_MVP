using NUnit.Framework;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Relevantz.ProgressPulse.Api.Controllers;
using Relevantz.ProgressPulse.Core.IService;
using Relevantz.ProgressPulse.Common.DTOs.Request;
using Relevantz.ProgressPulse.Common.DTOs.Response;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Relevantz.ProgressPulse.Core.Tests;

public class ManagerControllerTests
{
    private Mock<IManagerService> _managerServiceMock;
    private Mock<ICommentService> _commentServiceMock;
    private ManagerController _controller;

    [SetUp]
    public void Setup()
    {
        _managerServiceMock = new Mock<IManagerService>();
        _commentServiceMock = new Mock<ICommentService>();

        _controller = new ManagerController(
            _managerServiceMock.Object,
            _commentServiceMock.Object);

        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1")
        }, "mock"));

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }

    [Test]
    public async Task GetTeamLogs_ReturnsOk()
    {
        var filter = new ManagerLogFilterRequest();

        _managerServiceMock
            .Setup(x => x.GetFilteredTeamLogsAsync(It.IsAny<int>(), filter))
            .ReturnsAsync(new object());

        var result = await _controller.GetTeamLogs(filter);

        Assert.That(result, Is.TypeOf<OkObjectResult>());
    }

    [Test]
    public async Task AddComment_ReturnsOk()
    {
        var request = new AddCommentRequest
        {
            WeeklyLogId = 1,
            Comment = "Good work"
        };

        _commentServiceMock
            .Setup(x => x.AddCommentAsync(It.IsAny<int>(), request))
            .Returns(Task.CompletedTask);

        var result = await _controller.AddComment(request);

        Assert.That(result, Is.TypeOf<OkObjectResult>());
    }

    [Test]
    public async Task GetDashboard_ReturnsOk()
    {
        _managerServiceMock
            .Setup(x => x.GetDashboardSummaryAsync(It.IsAny<int>()))
            .ReturnsAsync(new ManagerDashboardResponse());

        var result = await _controller.GetDashboard();

        Assert.That(result, Is.TypeOf<OkObjectResult>());
    }

    [Test]
    public async Task GetEmployeeSummary_ReturnsOk()
    {
        _managerServiceMock
            .Setup(x => x.GetEmployeeSummaryAsync(It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(new EmployeeSummaryResponse());

        var result = await _controller.GetEmployeeSummary(1);

        Assert.That(result, Is.TypeOf<OkObjectResult>());
    }

    [Test]
    public async Task GetAppraisalReport_ReturnsOk()
    {
        _managerServiceMock
            .Setup(x => x.GetAppraisalReportAsync(It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(new AppraisalReportResponse());

        var result = await _controller.GetAppraisalReport(1);

        Assert.That(result, Is.TypeOf<OkObjectResult>());
    }

    [Test]
    public async Task GetMyEmployees_ReturnsOk()
    {
        _managerServiceMock
            .Setup(x => x.GetMyEmployeesAsync(It.IsAny<int>()))
            .ReturnsAsync(new List<EmployeeListResponse>());

        var result = await _controller.GetMyEmployees();

        Assert.That(result, Is.TypeOf<OkObjectResult>());
    }

    [Test]
    public async Task GetWeeklyDigest_ReturnsOk()
    {
        _managerServiceMock
            .Setup(x => x.GetWeeklyDigestAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<System.DateTime>()))
            .ReturnsAsync(new List<WeeklyDigestResponse>());

        var result = await _controller.GetWeeklyDigest(1, null);

        Assert.That(result, Is.TypeOf<OkObjectResult>());
    }
}