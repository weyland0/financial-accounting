using finacc.DTOs.Auth;
using finacc.Application.Services;
using finacc.Utility;
using finacc.Models;
using finacc.DataAccess;
using Microsoft.EntityFrameworkCore;

namespace finacc.Application.Auth.Commands;

public class RegisterHandler
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;


    public RegisterHandler(
        ApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }


    public async Task<Result<AuthResponse>> Handle(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var registerRequestCheckResult = request.Validate();
        if (!registerRequestCheckResult.IsSuccess)
        {
            return Result<AuthResponse>.Failure(
                registerRequestCheckResult.ErrorMessage, registerRequestCheckResult.ErrorCode);
        }

        if (await _context.Users.AnyAsync(u => u.Email == request.Email, cancellationToken))
        {
            return Result<AuthResponse>.Failure("Пользователь с таким email уже существует");
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            FullName = request.FullName,
            RoleId = null,
            OrganizationId = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken(user);

        var response = new AuthResponse
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            RoleId = user.RoleId,
            OrganizationId = user.OrganizationId,
            RoleName = user.Role?.Name
        };

        return Result<AuthResponse>.Success(response);
    }
}
