using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PersonalJournal.API.DTOs.Auth;
using PersonalJournal.API.Models;
using PersonalJournal.API.Repositories;
using BCrypt.Net;

namespace PersonalJournal.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request);
        Task ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request);
    }

    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            if (await _userRepository.EmailExistsAsync(request.Email))
            {
                throw new InvalidOperationException("Email already exists.");
            }

            var user = new User
            {
                Email = request.Email,
                DisplayName = request.DisplayName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            return new AuthResponseDto { Email = user.Email, Token = token, DisplayName = user.DisplayName, DefaultEncryption = user.DefaultEncryption };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);
            
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid credentials.");
            }

            var token = GenerateJwtToken(user);

            return new AuthResponseDto { Email = user.Email, Token = token, DisplayName = user.DisplayName, DefaultEncryption = user.DefaultEncryption };
        }

        public async Task UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new InvalidOperationException("User not found.");

            if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
            {
                if (await _userRepository.EmailExistsAsync(request.Email))
                {
                    throw new InvalidOperationException("Email already exists.");
                }
                user.Email = request.Email;
            }

            if (!string.IsNullOrEmpty(request.DisplayName))
            {
                user.DisplayName = request.DisplayName;
            }
            
            if (request.DefaultEncryption.HasValue)
            {
                user.DefaultEncryption = request.DefaultEncryption.Value;
            }

            await _userRepository.SaveChangesAsync();
        }

        public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new InvalidOperationException("User not found.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _userRepository.SaveChangesAsync();
        }

        private string GenerateJwtToken(User user)
        {
            var secret = _configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret missing.");
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secret));
            
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            
            var expirationMinutes = int.Parse(_configuration["JwtSettings:ExpirationInMinutes"] ?? "1440");

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
