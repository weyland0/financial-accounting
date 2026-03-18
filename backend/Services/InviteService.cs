using System.Net.NetworkInformation;
using System.Runtime.CompilerServices;
using finacc.DataAccess;
using finacc.DTOs;
using finacc.Models;
using Microsoft.EntityFrameworkCore;

namespace finacc.Services;

public interface IInviteService
{
    Task<Result<InviteResponse>> Create(InviteRequest request);
    Task<Result<InviteResponse>> Accept(string token, int userId);
}


public class InviteService : IInviteService
{
    private readonly ApplicationDbContext _context;

    public InviteService(ApplicationDbContext context)
    {
        _context = context;
    }
 
    public async Task<Result<InviteResponse>> Create(InviteRequest request) 
    {
        var organization = await _context.Organizations.FindAsync(request.OrganizationId);
        if (organization is null)
        {
            return Result<InviteResponse>.Failure("Организация с таким ID не найдена");
        }

        var role = await _context.Roles.FindAsync(request.RoleId);
        if (role is null)
        {
            return Result<InviteResponse>.Failure("Роль с таким ID не найдена");
        }

        var invite = new Invite
        {
            OrganizationId = request.OrganizationId,
            Token = System.Guid.NewGuid().ToString(),
            RoleId = request.RoleId,
            IsRevoked = request.IsRevoked,
            ExpireTime = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        _context.Invites.Add(invite);
        await _context.SaveChangesAsync();

        return Result<InviteResponse>.Success(InviteMapper.ToResponse(invite));
    }

    public async Task<Result<InviteResponse>> Accept(string token, int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user is null) 
        {
            return Result<InviteResponse>.Failure("Ну удалось найти пользователя");
        }

        var invite = await _context.Invites.FirstOrDefaultAsync(inv => inv.Token.Equals(token));
        if (invite is null)
        {
            return Result<InviteResponse>.Failure("Ну удалось найти приглашение по данной ссылке");
        }

        if (invite.IsRevoked) 
        {
            return Result<InviteResponse>.Failure("Приглашение было отозвано");
        }

        if (DateTime.UtcNow > invite.ExpireTime)
        {
            return Result<InviteResponse>.Failure("Срок приглашения истек");
        }

        user.OrganizationId = invite.OrganizationId;
        user.RoleId = invite.RoleId;
        user.UpdatedAt = DateTime.UtcNow;

        return Result<InviteResponse>.Success(InviteMapper.ToResponse(invite));
    }
}
