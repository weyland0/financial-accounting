using finacc.Models;
using finacc.Utility;

namespace finacc.Application.Invites.Domain;

public static class AcceptInvitePolicy
{
    public static Result CanAccept(Invite invite)
    {
        if (invite.IsRevoked)
        {
            return Result.Failure("Приглашение было отозвано");
        }

        if (DateTime.UtcNow > invite.ExpireTime)
        {
            return Result.Failure("Срок приглашения истек");
        }

        return Result.Success();
    }
}