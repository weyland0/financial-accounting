namespace finacc.DTOs;


public class UserDto
{
    public required int Id { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public int? RoleId { get; set; } = null;
    public int? CompanyId { get; set; } = null;
}
