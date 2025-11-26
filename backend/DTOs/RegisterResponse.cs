namespace finacc.DTOs;


public class RegisterResponse
{
    public required bool Success { get; set; }
    public required string Message { get; set; }
    public UserDto? UserDto { get; set; }
}
