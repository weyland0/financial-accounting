using finacc.Models;

namespace finacc.Application.Invites.Data;

public class AcceptInviteData
{
    public required Invite Invite { get; set; }
    public required User User { get; set; }
}
