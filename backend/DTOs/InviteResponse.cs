namespace finacc.DTOs;


public class InviteResponse
{
    public required int Id { get; set; }
    public required string Token { get; set; }
    public required int OrganizationId { get; set; }
    public required int RoleId { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime CreatedAt { get; set; }
}