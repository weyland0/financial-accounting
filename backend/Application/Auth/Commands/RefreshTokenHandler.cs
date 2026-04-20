using finacc.DTOs.Auth;
using finacc.Application.Services;
using finacc.Utility;
using finacc.Application.Auth.Data;

namespace finacc.Application.Auth.Commands;

public class RefreshTokenHandler
{
    private readonly IJwtTokenService _jwtTokenService;
    private readonly RefreshTokenDataLoader _rtDataLoader;


    public RefreshTokenHandler(
        IJwtTokenService jwtTokenService,
        RefreshTokenDataLoader rtDataLoader)
    {
        _jwtTokenService = jwtTokenService;
        _rtDataLoader = rtDataLoader;
    }


    public async Task<Result<AuthResponse>> Handle(string refreshToken, CancellationToken cancellationToken = default)
    {
        var userId = _jwtTokenService.ValidateRefreshToken(refreshToken);
        if (userId == null)
        {
            return Result<AuthResponse>.Failure("Недействительный refresh token", 401);
        }

        var rtDataResult = await _rtDataLoader.Load(userId.Value, cancellationToken);
        if (!rtDataResult.IsSuccess)
        {
            return Result<AuthResponse>.Failure(
                rtDataResult.ErrorMessage, rtDataResult.ErrorCode);
        }
        var rtData = rtDataResult.Data!;

        var accessToken = _jwtTokenService.GenerateAccessToken(rtData.User);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken(rtData.User);

        var response = new AuthResponse
        {
            Token = accessToken,
            RefreshToken = newRefreshToken,
            Id = rtData.User.Id,
            Email = rtData.User.Email,
            FullName = rtData.User.FullName,
            RoleId = rtData.User.RoleId,
            OrganizationId = rtData.User.OrganizationId,
            RoleName = rtData.User.Role?.Name
        };

        return Result<AuthResponse>.Success(response);
    }
}
