using Microsoft.EntityFrameworkCore;
using finacc.DataAccess;
using finacc.DTOs.Auth;
using finacc.Utility;

namespace finacc.Application.Auth.Data;

public class LoginDataLoader
{
    private readonly ApplicationDbContext _context;

    public LoginDataLoader(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LoginData>> Load(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (user == null)
        {
            return Result<LoginData>.Failure("Почта или пароль неверны!");
        }

        return Result<LoginData>.Success(new LoginData { User = user });
    }
}
