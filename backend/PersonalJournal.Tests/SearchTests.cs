using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using PersonalJournal.API.Models;
using PersonalJournal.API.Repositories;
using PersonalJournal.API.Services;
using Xunit;

namespace PersonalJournal.Tests
{
    public class SearchTests
    {
        private readonly Mock<IEntryRepository> _entryRepoMock;
        private readonly EntryService _entryService;

        public SearchTests()
        {
            _entryRepoMock = new Mock<IEntryRepository>();
            _entryService = new EntryService(_entryRepoMock.Object);
        }

        [Fact]
        public async Task SearchEntries_ReturnsMappedDtos()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var entries = new List<Entry>
            {
                new Entry { Id = Guid.NewGuid(), Title = "Test 1", Content = "Content 1", UserId = userId },
                new Entry { Id = Guid.NewGuid(), Title = "Test 2", Content = "Content 2", UserId = userId }
            };

            _entryRepoMock.Setup(r => r.SearchAsync(userId, "Test", "journal", null, null))
                .ReturnsAsync(entries);

            // Act
            var result = await _entryService.SearchEntriesAsync(userId, "Test", "journal", null, null);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Equal("Test 1", result.First().Title);
        }

        [Fact]
        public async Task GetCalendar_ReturnsMappedDtos()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var entries = new List<Entry>
            {
                new Entry { Id = Guid.NewGuid(), Title = "Test 1", Content = "Content 1", UserId = userId, Date = new DateTime(2023, 10, 5) },
            };

            _entryRepoMock.Setup(r => r.GetCalendarAsync(userId, 2023, 10))
                .ReturnsAsync(entries);

            // Act
            var result = await _entryService.GetCalendarAsync(userId, 2023, 10);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal(new DateTime(2023, 10, 5), result.First().Date);
        }
    }
}
