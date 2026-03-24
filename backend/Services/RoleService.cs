using System.Reflection.Metadata;
using finacc.DataAccess;
using finacc.DTOs;
using finacc.Models;
using Microsoft.EntityFrameworkCore;

namespace finacc.Services;


public interface IRoleService
{
    Task<Result<RoleResponse>> GetById(int id);
    Task<Result<List<RoleResponse>>> GetAll();

}


public class RoleService : IRoleService
{
    private readonly ApplicationDbContext _context;

    public RoleService(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<Result<RoleResponse>> GetById(int id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role is null)
        {
            return Result<RoleResponse>.Failure("Не удалось найти роль");
        }

        var response = new RoleResponse
        {
            Id = role.Id,
            Name = role.Name
        };

        return Result<RoleResponse>.Success(response);
    }
    public async Task<Result<List<RoleResponse>>> GetAll()
    {
        var roles = await _context.Roles.ToListAsync();

        List<RoleResponse> responses = new(roles.Count);
        foreach (var role in roles)
        {
            var response = new RoleResponse
            {
                Id = role.Id,
                Name = role.Name
            };
            responses.Add(response);
        }

        return Result<List<RoleResponse>>.Success(responses);
    }
}
