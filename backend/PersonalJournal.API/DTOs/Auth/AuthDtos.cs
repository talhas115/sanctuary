using System.ComponentModel.DataAnnotations;

namespace PersonalJournal.API.DTOs.Auth
{
    public class RegisterRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string DisplayName { get; set; } = string.Empty;
    }

    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public bool DefaultEncryption { get; set; }
    }

    public class UpdateProfileRequestDto
    {
        [EmailAddress]
        public string? Email { get; set; }
        public string? DisplayName { get; set; }
        public bool? DefaultEncryption { get; set; }
    }

    public class ChangePasswordRequestDto
    {
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }
}
