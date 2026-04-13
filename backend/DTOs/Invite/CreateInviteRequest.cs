namespace finacc.DTOs.Invite;

        
public class CreateInviteRequest
{
    public required int OrganizationId { get; set; }
    public required int RoleId { get; set; }
    public int DaysToExpired { get; set; }
}
