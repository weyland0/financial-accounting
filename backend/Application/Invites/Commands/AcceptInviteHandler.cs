using finacc.DataAccess;
using finacc.DTOs.Invite;
using finacc.Utility;
using finacc.Application.Invites.Domain;
using finacc.Application.Invites.Data;

namespace finacc.Application.Invites.Commands;

public class AcceptInviteHandler
{
    private readonly ApplicationDbContext _context;
    private readonly AcceptInviteDataLoader _acceptInviteDataLoader;

    public AcceptInviteHandler(ApplicationDbContext context)
    {
        _context = context;
        _acceptInviteDataLoader = new AcceptInviteDataLoader(context);
    }

    public async Task<Result<AcceptInviteResponse>> Handle(string token, AcceptInviteRequest request)
    {
        var acceptDataResult = await _acceptInviteDataLoader.Load(token, request);
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

        var response = new AcceptInviteResponse
        {
            OrganizationId = acceptData.Invite.OrganizationId,
            RoleId = acceptData.Invite.RoleId,
        };

        return Result<AcceptInviteResponse>.Success(response);
    }
}
