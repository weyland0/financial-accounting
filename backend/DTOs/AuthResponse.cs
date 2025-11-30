namespace finacc.DTOs;


public class AuthResponse
{
    public required string Token { get; set; }
    public required string RefreshToken { get; set; }
    public UserDto? UserDto { get; set; }
}
