namespace finacc.DTOs;

public class UserResponse
{
    public required int Id { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? RoleName { get; set; }
    public string? OrganizationName { get; set; }
}