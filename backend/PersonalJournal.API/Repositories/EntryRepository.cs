using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PersonalJournal.API.Data;
using PersonalJournal.API.Models;

namespace PersonalJournal.API.Repositories
{
    public interface IEntryRepository
    {
        Task<Entry?> GetByIdAsync(Guid id);
        Task<List<Entry>> GetAllByUserIdAsync(Guid userId);
        Task<List<Entry>> SearchAsync(Guid userId, string query, string? tag, DateTime? startDate, DateTime? endDate);
        Task<List<Entry>> GetCalendarAsync(Guid userId, int year, int month);
        Task AddAsync(Entry entry);
        Task UpdateAsync(Entry entry);
        Task DeleteAsync(Entry entry);
        Task<Tag> GetOrCreateTagAsync(string name);
        Task SaveChangesAsync();
    }

    public class EntryRepository : IEntryRepository
    {
        private readonly ApplicationDbContext _context;

        public EntryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Entry?> GetByIdAsync(Guid id)
        {
            return await _context.Entries
                .Include(e => e.EntryTags)
                .ThenInclude(et => et.Tag)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<List<Entry>> GetAllByUserIdAsync(Guid userId)
        {
            // KPI 13: Reverse chronological ordering
            return await _context.Entries
                .Include(e => e.EntryTags)
                .ThenInclude(et => et.Tag)
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.Date)
                .ThenByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Entry>> SearchAsync(Guid userId, string query, string? tag, DateTime? startDate, DateTime? endDate)
        {
            var q = _context.Entries
                .Include(e => e.EntryTags)
                .ThenInclude(et => et.Tag)
                .Where(e => e.UserId == userId); // No longer strictly excluding IsEncrypted

            if (!string.IsNullOrWhiteSpace(query))
            {
                q = q.Where(e => e.IsEncrypted || e.SearchVector.Matches(EF.Functions.WebSearchToTsQuery("english", query)));
            }

            if (!string.IsNullOrWhiteSpace(tag))
            {
                q = q.Where(e => e.EntryTags.Any(et => et.Tag.Name == tag.ToLower()));
            }

            if (startDate.HasValue)
            {
                q = q.Where(e => e.Date >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                q = q.Where(e => e.Date <= endDate.Value);
            }

            return await q
                .OrderByDescending(e => e.Date)
                .ThenByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Entry>> GetCalendarAsync(Guid userId, int year, int month)
        {
            var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            return await _context.Entries
                .Include(e => e.EntryTags)
                .ThenInclude(et => et.Tag)
                .Where(e => e.UserId == userId && e.Date >= startDate && e.Date <= endDate)
                .OrderByDescending(e => e.Date)
                .ThenByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(Entry entry)
        {
            await _context.Entries.AddAsync(entry);
        }

        public Task UpdateAsync(Entry entry)
        {
            _context.Entries.Update(entry);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Entry entry)
        {
            _context.Entries.Remove(entry);
            return Task.CompletedTask;
        }

        public async Task<Tag> GetOrCreateTagAsync(string name)
        {
            var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == name);
            if (tag == null)
            {
                tag = new Tag { Name = name };
                await _context.Tags.AddAsync(tag);
            }
            return tag;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
