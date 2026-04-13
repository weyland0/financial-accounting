using finacc.DataAccess;
using finacc.DTOs.Invite;
using finacc.Utility;

namespace finacc.Application.Invites.Data;

public class CreateInviteDataLoader
{
    private readonly ApplicationDbContext _context;

    public CreateInviteDataLoader(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CreateInviteData>> Load(CreateInviteRequest request)
    {
        var organization = await _context.Organizations.FindAsync(request.OrganizationId);
        if (organization is null)
        {
            return Result<CreateInviteData>.Failure("Организация с таким ID не найдена");
        }

        var role = await _context.Roles.FindAsync(request.RoleId);
        if (role is null)
        {
            return Result<CreateInviteData>.Failure("Роль с таким ID не найдена");
        }

        return Result<CreateInviteData>.Success(new CreateInviteData
        {
            Organization = organization,
            Role = role
        });
    }
}