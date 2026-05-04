using System;
using System.Threading.Tasks;
using Moq;
using PersonalJournal.API.Models;
using PersonalJournal.API.Repositories;
using PersonalJournal.API.Services;
using Xunit;

namespace PersonalJournal.Tests
{
    public class PublicAccessTests
    {
        private readonly Mock<IShareLinkRepository> _shareLinkRepoMock;
        private readonly Mock<IEntryRepository> _entryRepoMock;
        private readonly PublicService _publicService;

        public PublicAccessTests()
        {
            _shareLinkRepoMock = new Mock<IShareLinkRepository>();
            _entryRepoMock = new Mock<IEntryRepository>();
            _publicService = new PublicService(_shareLinkRepoMock.Object, _entryRepoMock.Object);
        }

        [Fact]
        public async Task GenerateShareLink_WithPrivateEntry_ThrowsInvalidOperationException()
        {
            // Arrange
            var entryId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var entry = new Entry { Id = entryId, UserId = userId, Visibility = "private" };

            _entryRepoMock.Setup(r => r.GetByIdAsync(entryId)).ReturnsAsync(entry);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _publicService.GenerateShareLinkAsync(entryId, userId));
        }

        [Fact]
        public async Task GetPublicEntry_WithValidLink_ReturnsPublicEntryDto()
        {
            // Arrange
            var publicUuid = Guid.NewGuid();
            var entry = new Entry { Title = "Public title", Content = "Public content", Visibility = "public" };
            var shareLink = new ShareLink { PublicUuid = publicUuid, Entry = entry };

            _shareLinkRepoMock.Setup(r => r.GetByUuidAsync(publicUuid)).ReturnsAsync(shareLink);

            // Act
            var result = await _publicService.GetPublicEntryAsync(publicUuid);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Public title", result.Title);
        }
    }
}
