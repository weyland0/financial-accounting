using finacc.DataAccess;
using finacc.DTOs.Invite;
using Microsoft.EntityFrameworkCore;
using finacc.Utility;

namespace finacc.Application.Invites.Queries;

public class GetInviteByTokenHandler
{
    private readonly ApplicationDbContext _context;

    public GetInviteByTokenHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<InviteResponse>> Handle(string inviteToken)
    {
        var invite = await _context.Invites.FirstOrDefaultAsync(inv => inv.Token.Equals(inviteToken));
        if (invite is null)
        {
            return Result<InviteResponse>.Failure("Ну удалось найти приглашение по данной ссылке");
        }

        var organization = await _context.Organizations.FindAsync(invite.OrganizationId);
        if (organization is null)
        {
            return Result<InviteResponse>.Failure("Организация с таким ID не найдена");
        }

        var role = await _context.Roles.FindAsync(invite.RoleId);
        if (role is null)
        {
            return Result<InviteResponse>.Failure("Роль с таким ID не найдена");
        }

        var response = new InviteResponse 
        {
            Id = invite.Id,
            Token = invite.Token,
            OrganizationName = organization.Name,
            RoleName = role.Name,
            IsRevoked = invite.IsRevoked,
            CreatedAt = invite.CreatedAt
        };

        return Result<InviteResponse>.Success(response);
    }
}
