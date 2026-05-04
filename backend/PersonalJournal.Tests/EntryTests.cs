using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using PersonalJournal.API.DTOs.Entries;
using PersonalJournal.API.Models;
using PersonalJournal.API.Repositories;
using PersonalJournal.API.Services;
using Xunit;

namespace PersonalJournal.Tests
{
    public class EntryTests
    {
        private readonly Mock<IEntryRepository> _entryRepoMock;
        private readonly EntryService _entryService;

        public EntryTests()
        {
            _entryRepoMock = new Mock<IEntryRepository>();
            _entryService = new EntryService(_entryRepoMock.Object);
        }

        [Fact]
        public async Task CreateEntry_WithValidData_ReturnsEntryResponse()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var request = new CreateEntryDto
            {
                Title = "Test Title",
                Content = "<p>Hello world!</p>",
                Visibility = "private",
                Date = DateTime.UtcNow,
                Tags = new List<string> { "test", "journal" }
            };

            _entryRepoMock.Setup(r => r.GetOrCreateTagAsync(It.IsAny<string>()))
                .ReturnsAsync((string name) => new Tag { Name = name });
            _entryRepoMock.Setup(r => r.AddAsync(It.IsAny<Entry>())).Returns(Task.CompletedTask);
            _entryRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            // Act
            var response = await _entryService.CreateEntryAsync(userId, request);

            // Assert
            Assert.NotNull(response);
            Assert.Equal(request.Title, response.Title);
            Assert.Equal(2, response.WordCount); // "Hello world!" -> 2 words
            Assert.Contains("test", response.Tags);
            _entryRepoMock.Verify(r => r.AddAsync(It.IsAny<Entry>()), Times.Once);
        }

        [Fact]
        public async Task UpdateEntry_WithValidOwner_UpdatesData()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var entryId = Guid.NewGuid();
            var existingEntry = new Entry
            {
                Id = entryId,
                UserId = userId,
                Title = "Old Title",
                Content = "Old content",
                Visibility = "private",
                Date = DateTime.UtcNow
            };

            var updateRequest = new UpdateEntryDto
            {
                Title = "New Title",
                Content = "New content",
                Visibility = "public",
                Date = DateTime.UtcNow
            };

            _entryRepoMock.Setup(r => r.GetByIdAsync(entryId)).ReturnsAsync(existingEntry);
            _entryRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Entry>())).Returns(Task.CompletedTask);

            // Act
            var response = await _entryService.UpdateEntryAsync(entryId, userId, updateRequest);

            // Assert
            Assert.Equal("New Title", response.Title);
            Assert.Equal("public", response.Visibility);
            _entryRepoMock.Verify(r => r.UpdateAsync(It.Is<Entry>(e => e.Title == "New Title")), Times.Once);
        }

        [Fact]
        public async Task UpdateEntry_WithInvalidOwner_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var entryId = Guid.NewGuid();
            var existingEntry = new Entry
            {
                Id = entryId,
                UserId = Guid.NewGuid(), // Different user
                Title = "Old Title"
            };

            _entryRepoMock.Setup(r => r.GetByIdAsync(entryId)).ReturnsAsync(existingEntry);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
                _entryService.UpdateEntryAsync(entryId, Guid.NewGuid(), new UpdateEntryDto()));
        }

        [Fact]
        public async Task DeleteEntry_WithValidOwner_CallsDelete()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var entryId = Guid.NewGuid();
            var existingEntry = new Entry
            {
                Id = entryId,
                UserId = userId
            };

            _entryRepoMock.Setup(r => r.GetByIdAsync(entryId)).ReturnsAsync(existingEntry);

            // Act
            await _entryService.DeleteEntryAsync(entryId, userId);

            // Assert
            _entryRepoMock.Verify(r => r.DeleteAsync(existingEntry), Times.Once);
        }
    }
}
