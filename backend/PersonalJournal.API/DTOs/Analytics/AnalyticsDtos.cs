using System;
using System.Collections.Generic;

namespace PersonalJournal.API.DTOs.Analytics
{
    public class DashboardStatsDto
    {
        public int TotalEntries { get; set; }
        public int TotalWords { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public List<TagCountDto> TopTags { get; set; } = new List<TagCountDto>();
    }

    public class TagCountDto
    {
        public string Tag { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class HeatmapDto
    {
        public Dictionary<string, int> CountsByDate { get; set; } = new Dictionary<string, int>();
    }
}
