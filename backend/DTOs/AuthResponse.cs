using System.Text.Json.Serialization;

namespace finacc.DTOs;


public class AuthResponse
{
    public required string Token { get; set; }

    [JsonIgnore] // Не отправляем refresh token клиенту, он уходит в HttpOnly cookie
    public string? RefreshToken { get; set; }

    public UserDto? UserDto { get; set; }
}
