namespace finacc.DTOs;


public class InviteRequest
{
    public required int OrganizationId { get; set; }
    public required int RoleId { get; set; }
    public int DaysToExpired { get; set; }
}


public class InviteAcceptRequest
{
    public int UserId { get; set; }
}