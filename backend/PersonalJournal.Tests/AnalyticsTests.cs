using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using PersonalJournal.API.Models;
using PersonalJournal.API.Repositories;
using PersonalJournal.API.Services;
using Xunit;

namespace PersonalJournal.Tests
{
    public class AnalyticsTests
    {
        private readonly Mock<IEntryRepository> _entryRepoMock;
        private readonly AnalyticsService _analyticsService;

        public AnalyticsTests()
        {
            _entryRepoMock = new Mock<IEntryRepository>();
            _analyticsService = new AnalyticsService(_entryRepoMock.Object);
        }

        [Fact]
        public async Task GetDashboardStats_ReturnsCorrectStats()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var tag = new Tag { Name = "test" };
            var entries = new List<Entry>
            {
                new Entry 
                { 
                    Id = Guid.NewGuid(), Title = "Day 1", Content = "One two", 
                    Date = new DateTime(2023, 10, 1), UserId = userId,
                    EntryTags = new List<EntryTag> { new EntryTag { Tag = tag } }
                },
                new Entry 
                { 
                    Id = Guid.NewGuid(), Title = "Day 2", Content = "Three", 
                    Date = new DateTime(2023, 10, 2), UserId = userId,
                    EntryTags = new List<EntryTag> { new EntryTag { Tag = tag } }
                }
            };

            _entryRepoMock.Setup(r => r.GetAllByUserIdAsync(userId)).ReturnsAsync(entries);

            // Act
            var stats = await _analyticsService.GetDashboardStatsAsync(userId);

            // Assert
            Assert.Equal(2, stats.TotalEntries);
            Assert.Equal(3, stats.TotalWords);
            Assert.Equal(2, stats.LongestStreak);
            Assert.Single(stats.TopTags);
            Assert.Equal("test", stats.TopTags[0].Tag);
            Assert.Equal(2, stats.TopTags[0].Count);
        }
    }
}
