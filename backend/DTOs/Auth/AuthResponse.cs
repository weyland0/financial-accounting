using System.Text.Json.Serialization;

namespace finacc.DTOs.Auth;


public class AuthResponse
{
    public required string Token { get; set; }

    [JsonIgnore] // Не отправляем refresh token клиенту, он уходит в HttpOnly cookie
    public string? RefreshToken { get; set; }

    public required int Id { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public int? RoleId { get; set; } = null;
    public int? OrganizationId { get; set; } = null;
    public string? RoleName { get; set; }
}
