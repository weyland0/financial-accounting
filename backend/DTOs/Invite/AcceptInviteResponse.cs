namespace finacc.DTOs.Invite;

public class AcceptInviteResponse
{
    public int RoleId { get; set; }
    public int OrganizationId { get; set; }
    public string AccessToken { get; set; } = "";
    public string RefreshToken { get; set; } = "";
}
