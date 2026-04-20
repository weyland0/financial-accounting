using finacc.DTOs.Auth;
using finacc.Services;
using finacc.Utility;
using finacc.Application.Auth.Data;

namespace finacc.Application.Auth.Commands;

public class LoginHandler
{
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly LoginDataLoader _loginDataLoader;


    public LoginHandler(
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        LoginDataLoader loginDataLoader)
    {
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _loginDataLoader = loginDataLoader;
    }


    public async Task<Result<AuthResponse>> Handle(LoginRequest request, CancellationToken cancellationToken)
    {
        var loginRequestCheckResult = request.Validate();
        if (!loginRequestCheckResult.IsSuccess)
        {
            return Result<AuthResponse>.Failure(
                loginRequestCheckResult.ErrorMessage, loginRequestCheckResult.ErrorCode);
        }

        var loginDataResult = await _loginDataLoader.Load(request, cancellationToken);
        if (!loginDataResult.IsSuccess)
        {
            return Result<AuthResponse>.Failure(
                loginDataResult.ErrorMessage, loginDataResult.ErrorCode);
        }
        var loginData = loginDataResult.Data!;

        // Проверяем совпадения пароля
        if (!_passwordHasher.Verify(request.Password, loginData.User.PasswordHash))
        {
            return Result<AuthResponse>.Failure("Почта или пароль неверны!");
        }

        // Генерируем и создаем всю нужную информацию для ответа
        var accessToken = _jwtTokenService.GenerateAccessToken(loginData.User);
        var refreshToken = _jwtTokenService.GenerateRefreshToken(loginData.User);

        var response = new AuthResponse
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            Id = loginData.User.Id,
            Email = loginData.User.Email,
            FullName = loginData.User.FullName,
            RoleId = loginData.User.RoleId,
            OrganizationId = loginData.User.OrganizationId,
            RoleName = loginData.User.Role?.Name
        };

        return Result<AuthResponse>.Success(response);
    }
}