namespace finacc.DTOs;


public class InviteRequest
{
    public required int OrganizationId { get; set; }
    public required int RoleId { get; set; }
    public bool IsRevoked { get; set; } = false;
}


public class InviteAcceptRequest
{
    public int UserId { get; set; }
}