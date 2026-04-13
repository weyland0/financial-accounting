using finacc.DataAccess;
using finacc.DTOs.Invite;
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

    public async Task<Result<AcceptInviteData>> Load(string token, AcceptInviteRequest request)
    {
        var user = await _context.Users.FindAsync(request.UserId);
        if (user is null)
        {
            return Result<AcceptInviteData>.Failure("Не удалось найти пользователя");
        }

        var invite = await _context.Invites.FirstOrDefaultAsync(inv => inv.Token.Equals(token));
        if (invite is null)
        {
            return Result<AcceptInviteData>.Failure("Не удалось найти приглашение по данной ссылке");
        }

        return Result<AcceptInviteData>.Success(new AcceptInviteData
        {
            Invite = invite,
            User = user
        });
    }
}