using finacc.DataAccess;
using finacc.Utility;
using Microsoft.EntityFrameworkCore;

namespace finacc.Application.Invites.Data;

public class AcceptInviteDataLoader
{
    private readonly ApplicationDbContext _context;

    public AcceptInviteDataLoader(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AcceptInviteData>> Load(string token, int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user is null)
        {
            return Result<AcceptInviteData>.Failure("Не удалось найти пользователя", 404);
        }

        var invite = await _context.Invites.FirstOrDefaultAsync(inv => inv.Token.Equals(token));
        if (invite is null)
        {
            return Result<AcceptInviteData>.Failure("Не удалось найти приглашение по данной ссылке", 404);
        }

        return Result<AcceptInviteData>.Success(new AcceptInviteData
        {
            Invite = invite,
            User = user
        });
    }
}