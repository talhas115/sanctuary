using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalJournal.API.Services;

namespace PersonalJournal.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token.");
            }
            return userId;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var userId = GetUserId();
            var stats = await _analyticsService.GetDashboardStatsAsync(userId);
            return Ok(stats);
        }

        [HttpGet("streak")]
        public async Task<IActionResult> GetStreak()
        {
            var userId = GetUserId();
            var stats = await _analyticsService.GetDashboardStatsAsync(userId);
            return Ok(new { streak = stats.CurrentStreak });
        }

        [HttpGet("heatmap")]
        public async Task<IActionResult> GetHeatmap([FromQuery] int? year, [FromQuery] int? month)
        {
            var userId = GetUserId();
            var now = DateTime.UtcNow;
            var heatmap = await _analyticsService.GetHeatmapAsync(userId, year ?? now.Year, month ?? now.Month);
            return Ok(heatmap);
        }
    }
}
