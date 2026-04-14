using finacc.DataAccess;
using finacc.DTOs.Invite;
using finacc.Utility;
using finacc.Application.Invites.Domain;
using finacc.Application.Invites.Data;
using finacc.Services;
using Microsoft.EntityFrameworkCore;

namespace finacc.Application.Invites.Commands;

public class AcceptInviteHandler
{
    private readonly ApplicationDbContext _context;
    private readonly AcceptInviteDataLoader _acceptInviteDataLoader;
    private readonly IJwtTokenService _jwtTokenService;

    public AcceptInviteHandler(ApplicationDbContext context, IJwtTokenService jwtTokenService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _acceptInviteDataLoader = new AcceptInviteDataLoader(context);
    }

    public async Task<Result<AcceptInviteResponse>> Handle(string token, int userId)
    {
        var acceptDataResult = await _acceptInviteDataLoader.Load(token, userId);
        if (!acceptDataResult.IsSuccess)
        {
            return Result<AcceptInviteResponse>.Failure(acceptDataResult.ErrorMessage, acceptDataResult.ErrorCode);
        }
        var acceptData = acceptDataResult.Data!;

        var canAcceptResult = AcceptInvitePolicy.CanAccept(acceptData.Invite);
        if (!canAcceptResult.IsSuccess)
        {
            return Result<AcceptInviteResponse>.Failure(canAcceptResult.ErrorMessage, canAcceptResult.ErrorCode);
        }

        acceptData.User.JoinOrganization(acceptData.Invite.OrganizationId, acceptData.Invite.RoleId);
        acceptData.Invite.MarkAsUsed();
        await _context.SaveChangesAsync();

        // Перечитываем пользователя с ролью — нужно для корректного JWT с новым organizationId
        var updatedUser = await _context.Users
            .Include(u => u.Role)
            .FirstAsync(u => u.Id == acceptData.User.Id);

        return Result<AcceptInviteResponse>.Success(new AcceptInviteResponse
        {
            OrganizationId = acceptData.Invite.OrganizationId,
            RoleId = acceptData.Invite.RoleId,
            AccessToken = _jwtTokenService.GenerateAccessToken(updatedUser),
            RefreshToken = _jwtTokenService.GenerateRefreshToken(updatedUser)
        });
    }
}
