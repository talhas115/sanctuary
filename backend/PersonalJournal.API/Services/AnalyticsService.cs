using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using PersonalJournal.API.DTOs.Analytics;
using PersonalJournal.API.Repositories;

namespace PersonalJournal.API.Services
{
    public interface IAnalyticsService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync(Guid userId);
        Task<HeatmapDto> GetHeatmapAsync(Guid userId, int year, int month);
    }

    public class AnalyticsService : IAnalyticsService
    {
        private readonly IEntryRepository _entryRepository;

        public AnalyticsService(IEntryRepository entryRepository)
        {
            _entryRepository = entryRepository;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(Guid userId)
        {
            var entries = await _entryRepository.GetAllByUserIdAsync(userId);
            
            var totalEntries = entries.Count;
            var totalWords = entries.Sum(e => CalculateWordCount(e.Content));

            // Top Tags
            var topTags = entries
                .SelectMany(e => e.EntryTags)
                .GroupBy(et => et.Tag.Name)
                .Select(g => new TagCountDto { Tag = g.Key, Count = g.Count() })
                .OrderByDescending(t => t.Count)
                .Take(5)
                .ToList();

            // Streak Logic (Based on Date field, UTC)
            var dates = entries.Select(e => e.Date.Date).Distinct().OrderBy(d => d).ToList();
            
            int currentStreak = 0;
            int longestStreak = 0;
            int tempStreak = 0;
            DateTime? previousDate = null;

            foreach (var date in dates)
            {
                if (previousDate == null || (date - previousDate.Value).TotalDays == 1)
                {
                    tempStreak++;
                }
                else
                {
                    tempStreak = 1;
                }

                if (tempStreak > longestStreak)
                {
                    longestStreak = tempStreak;
                }

                previousDate = date;
            }

            // Current streak logic (if last entry was today or yesterday)
            if (dates.Any())
            {
                var lastDate = dates.Last();
                var today = DateTime.UtcNow.Date;
                if ((today - lastDate).TotalDays <= 1)
                {
                    currentStreak = tempStreak;
                }
            }

            return new DashboardStatsDto
            {
                TotalEntries = totalEntries,
                TotalWords = totalWords,
                CurrentStreak = currentStreak,
                LongestStreak = longestStreak,
                TopTags = topTags
            };
        }

        public async Task<HeatmapDto> GetHeatmapAsync(Guid userId, int year, int month)
        {
            var entries = await _entryRepository.GetCalendarAsync(userId, year, month);
            
            var counts = entries
                .GroupBy(e => e.Date.Date)
                .ToDictionary(g => g.Key.ToString("yyyy-MM-dd"), g => g.Count());

            return new HeatmapDto { CountsByDate = counts };
        }

        private int CalculateWordCount(string content)
        {
            if (string.IsNullOrWhiteSpace(content)) return 0;
            var textOnly = Regex.Replace(content, "<.*?>", string.Empty);
            return textOnly.Split(new[] { ' ', '\r', '\n', '\t' }, StringSplitOptions.RemoveEmptyEntries).Length;
        }
    }
}
