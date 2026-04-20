using Microsoft.EntityFrameworkCore;
using finacc.DataAccess;
using finacc.Utility;

namespace finacc.Application.Auth.Data;

public class RefreshTokenDataLoader
{
    private readonly ApplicationDbContext _context;

    public RefreshTokenDataLoader(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RefreshTokenData>> Load(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null)
        {
            return Result<RefreshTokenData>.Failure("Пользователь не найден", 404);
        }

        return Result<RefreshTokenData>.Success(new RefreshTokenData { User = user });
    }
}
