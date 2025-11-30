using Microsoft.EntityFrameworkCore;
using finacc.DataAccess;
using finacc.Models;
using finacc.DTOs;
using finacc.Validators;

namespace finacc.Services;


public interface IAuthService
{
    Task<Result<AuthResponse>> Login(LoginRequest request);
    Task<Result<AuthResponse>> Register(RegisterRequest request);
}


public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly AuthDataValidator _dataValidator = new();


    public AuthService(
        ApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthResponse>> Login(LoginRequest request)
    {
        // Проверяем ввод пользователя
        var loginRequestCheckResult = _dataValidator.CheckLoginRequest(request);
        if (!loginRequestCheckResult.Success)
        {
            return Result<AuthResponse>.Failure(loginRequestCheckResult.Message!);
        }

        // Ищем пользователя в БД
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        // Проверяем совпадения пароля
        if (user == null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Result<AuthResponse>.Failure("Почта или пароль неверны!");
        }

        // Генерируем и создаем всю нужную информацию для ответа
        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            RoleId = user.RoleId,
            OrganizationId = user.OrganizationId
        };

        var response = new AuthResponse
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            UserDto = userDto
        };

        return Result<AuthResponse>.Success(response);
    }

    public async Task<Result<AuthResponse>> Register(RegisterRequest request)
    {
        var registerRequestCheckResult = _dataValidator.CheckRegisterRequest(request);
        if (!registerRequestCheckResult.Success)
        {
            return Result<AuthResponse>.Failure(registerRequestCheckResult.Message!);
        }

        // Проверяем есть ли уже пользователь с таким же email
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return Result<AuthResponse>.Failure("Пользователь с таким email уже существует");
        }

        // Создаем нового пользователя 
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

        // Сохраняем пользователя в БД
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Генерируем и создаем всю нужную информацию для ответа
        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            RoleId = user.RoleId,
            OrganizationId = user.OrganizationId
        };

        var response = new AuthResponse
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            UserDto = userDto
        };

        return Result<AuthResponse>.Success(response);
    }
}
