namespace finacc.DTOs;


public class InviteResponse
{
    public required int Id { get; set; }
    public required string Token { get; set; }
    public required string OrganizationName { get; set; }
    public required string RoleName { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime CreatedAt { get; set; }
}


public class InviteAcceptResponse
{
    public int RoleId { get; set; }
    public int OrganizationId { get; set; }
}