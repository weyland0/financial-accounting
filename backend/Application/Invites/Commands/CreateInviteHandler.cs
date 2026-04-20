using finacc.DataAccess;
using finacc.DTOs.Invite;
using finacc.Models;
using finacc.Utility;
using finacc.Application.Invites.Data;

namespace finacc.Application.Invites.Commands;

public class CreateInviteHandler
{
    private readonly ApplicationDbContext _context;
    private readonly CreateInviteDataLoader _inviteCreationDataLoader;

    public CreateInviteHandler(ApplicationDbContext context, CreateInviteDataLoader inviteCreationDataLoader)
    {
        _context = context;
        _inviteCreationDataLoader = inviteCreationDataLoader;
    }

    public async Task<Result<InviteResponse>> Handle(CreateInviteRequest request)
    {
        var creationDataResult = await _inviteCreationDataLoader.Load(request);
        if (!creationDataResult.IsSuccess)
        {
            return Result<InviteResponse>.Failure(creationDataResult.ErrorMessage, creationDataResult.ErrorCode);
        }
        var creationData = creationDataResult.Data!;

        var invite = new Invite
        {
            OrganizationId = request.OrganizationId,
            Token = Guid.NewGuid().ToString(),
            RoleId = request.RoleId,
            IsRevoked = false,
            ExpireTime = DateTime.UtcNow.AddDays(request.DaysToExpired),
            CreatedAt = DateTime.UtcNow
        };

        _context.Invites.Add(invite);
        await _context.SaveChangesAsync();

        var response = new InviteResponse 
        {
            Id = invite.Id,
            Token = invite.Token,
            OrganizationName = creationData.Organization.Name,
            RoleName = creationData.Role.Name,
            IsRevoked = invite.IsRevoked,
            CreatedAt = invite.CreatedAt
        };

        return Result<InviteResponse>.Success(response);
    }
}
