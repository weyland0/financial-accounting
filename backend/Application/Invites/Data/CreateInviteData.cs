using finacc.Models;

namespace finacc.Application.Invites.Data;

public class CreateInviteData
{
    public required Organization Organization { get; set; }
    public required Role Role { get; set; }
}