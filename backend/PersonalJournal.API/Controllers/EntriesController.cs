using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalJournal.API.DTOs.Entries;
using PersonalJournal.API.Services;

namespace PersonalJournal.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EntriesController : ControllerBase
    {
        private readonly IEntryService _entryService;

        public EntriesController(IEntryService entryService)
        {
            _entryService = entryService;
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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserId();
            var entries = await _entryService.GetAllEntriesAsync(userId);
            return Ok(entries);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q = "", [FromQuery] string? tag = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            var userId = GetUserId();
            var entries = await _entryService.SearchEntriesAsync(userId, q, tag, startDate, endDate);
            return Ok(entries);
        }

        [HttpGet("calendar")]
        public async Task<IActionResult> Calendar([FromQuery] int year, [FromQuery] int month)
        {
            var userId = GetUserId();
            var entries = await _entryService.GetCalendarAsync(userId, year, month);
            return Ok(entries);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var entry = await _entryService.GetEntryAsync(id, userId);
                return Ok(entry);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEntryDto request)
        {
            var userId = GetUserId();
            var entry = await _entryService.CreateEntryAsync(userId, request);
            return CreatedAtAction(nameof(Get), new { id = entry.Id }, entry);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEntryDto request)
        {
            try
            {
                var userId = GetUserId();
                var entry = await _entryService.UpdateEntryAsync(id, userId, request);
                return Ok(entry);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var userId = GetUserId();
                await _entryService.DeleteEntryAsync(id, userId);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }
    }
}
