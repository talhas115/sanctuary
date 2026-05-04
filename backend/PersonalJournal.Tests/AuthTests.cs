using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Moq;
using PersonalJournal.API.DTOs.Auth;
using PersonalJournal.API.Models;
using PersonalJournal.API.Repositories;
using PersonalJournal.API.Services;
using Xunit;

namespace PersonalJournal.Tests
{
    public class AuthTests
    {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly AuthService _authService;

        public AuthTests()
        {
            _userRepoMock = new Mock<IUserRepository>();
            _configMock = new Mock<IConfiguration>();
            
            _configMock.Setup(c => c["JwtSettings:Secret"]).Returns("SuperSecretKeyForPersonalJournalAppNeedToBeLongEnough");
            _configMock.Setup(c => c["JwtSettings:Issuer"]).Returns("PersonalJournalApp");
            _configMock.Setup(c => c["JwtSettings:Audience"]).Returns("PersonalJournalUsers");
            _configMock.Setup(c => c["JwtSettings:ExpirationInMinutes"]).Returns("1440");

            _authService = new AuthService(_userRepoMock.Object, _configMock.Object);
        }

        [Fact]
        public async Task Register_WithValidData_ReturnsAuthResponse()
        {
            // Arrange
            var request = new RegisterRequestDto
            {
                Email = "test@example.com",
                Password = "Password123!"
            };

            _userRepoMock.Setup(r => r.EmailExistsAsync(request.Email)).ReturnsAsync(false);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
            _userRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            // Act
            var response = await _authService.RegisterAsync(request);

            // Assert
            Assert.NotNull(response);
            Assert.Equal(request.Email, response.Email);
            Assert.NotEmpty(response.Token);
            _userRepoMock.Verify(r => r.AddAsync(It.Is<User>(u => u.Email == request.Email)), Times.Once);
        }

        [Fact]
        public async Task Register_WithExistingEmail_ThrowsInvalidOperationException()
        {
            // Arrange
            var request = new RegisterRequestDto
            {
                Email = "existing@example.com",
                Password = "Password123!"
            };

            _userRepoMock.Setup(r => r.EmailExistsAsync(request.Email)).ReturnsAsync(true);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _authService.RegisterAsync(request));
        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsAuthResponse()
        {
            // Arrange
            var password = "Password123!";
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new User { Id = Guid.NewGuid(), Email = "test@example.com", PasswordHash = hashedPassword };
            
            var request = new LoginRequestDto
            {
                Email = "test@example.com",
                Password = password
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync(user);

            // Act
            var response = await _authService.LoginAsync(request);

            // Assert
            Assert.NotNull(response);
            Assert.Equal(request.Email, response.Email);
            Assert.NotEmpty(response.Token);
        }

        [Fact]
        public async Task Login_WithInvalidPassword_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var password = "Password123!";
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new User { Id = Guid.NewGuid(), Email = "test@example.com", PasswordHash = hashedPassword };
            
            var request = new LoginRequestDto
            {
                Email = "test@example.com",
                Password = "WrongPassword"
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync(user);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(request));
        }

        [Fact]
        public async Task Login_WithNonExistentEmail_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var request = new LoginRequestDto
            {
                Email = "notfound@example.com",
                Password = "Password123!"
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User?)null);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(request));
        }
    }
}
