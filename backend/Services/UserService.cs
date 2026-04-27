using finacc.DataAccess;
using finacc.DTOs;
using finacc.Models;
using finacc.Utility;
using Microsoft.EntityFrameworkCore;

namespace finacc.Services;


public interface IUserService
{
    Task<Result<UserResponse>> GetById(int id);
    Task<Result<List<UserResponse>>> GetAllByOrganizationId(int orgId);

}


public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<Result<UserResponse>> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null)
        {
            return Result<UserResponse>.Failure("Такого пользователя не существует");
        }

        var organization = _context.Organizations.Find(user.OrganizationId);
        if (organization is null)
        {
            return Result<UserResponse>.Failure("Организация не найдена или пользователь не состоит ни в одной");
        }

        var role = _context.Roles.Find(user.RoleId);
        if (role is null)
        {
            return Result<UserResponse>.Failure("Роль не найдена или пользователь не имеет роли");
        }

        var response = new UserResponse {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            RoleName = role.Name,
            OrganizationName = organization.Name
        };

        return Result<UserResponse>.Success(response);
    }    

    public async Task<Result<List<UserResponse>>> GetAllByOrganizationId(int orgId)
    {
        // Получаем орагнизацию
        Organization? org = await _context.Organizations.FindAsync(orgId);
        if (org is null)
        {
            return Result<List<UserResponse>>.Failure("Организация не найдена", 404);
        }

        var roles = await _context.Roles.ToListAsync();
        if (roles is null)
        {
            return Result<List<UserResponse>>.Failure($"В системе отсутствуют роли");
        }

        List<User> users = await _context.Users.Where(u => u.OrganizationId == orgId).ToListAsync();
        if (users.Count == 0)
        {
            return Result<List<UserResponse>>.Failure("Счета не найдены", 404);
        }

        var responses = new List<UserResponse>();
        foreach (var user in users)
        {
            string roleName = "null";
            if (user.RoleId is not null){
                roleName = roles.Find(r => r.Id == user.RoleId).Name;
            }

            var response = new UserResponse {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                RoleName = roleName,
                OrganizationName = org.Name
            };
            responses.Add(response);
        }

        return Result<List<UserResponse>>.Success(responses);
    }

}
