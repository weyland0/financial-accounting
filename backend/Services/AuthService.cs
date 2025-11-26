using Microsoft.EntityFrameworkCore;
using finacc.DataAccess;
using finacc.Models;
using finacc.DTOs;

namespace finacc.Services;


public interface IAuthService
{
    Task<LoginResponse> Login(LoginRequest request);
    Task<RegisterResponse> Register(RegisterRequest request);
    Task<LoginResponse> RegisterAndLogin(RegisterRequest request);
}


public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(
        ApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<LoginResponse> Login(LoginRequest request)
    {
        // Проверяем ввод пользователя
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ArgumentException("Почта и пароль обязательны");
        }

        // Ищем пользователя в БД
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        // Проверяем совпадения пароля
        if (user == null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Почта или пароль неверны!");
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
            CompanyId = user.CompanyId
        };

        var response = new LoginResponse
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            UserDto = userDto
        };

        return response;
    }

    public async Task<RegisterResponse> Register(RegisterRequest request)
    {
        // Проверяем ввод пользователя
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.FullName))
        {
            throw new ArgumentException("Все поля обязательны");
        }

        // Проверяем корректность пароля (минимум 8 символов)
        if (request.Password.Length < 8)
        {
            throw new ArgumentException("Пароль должен быть минимум 8 символов");
        }

        // Проверяем есть ли уже пользователь с таким же email
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new InvalidOperationException("Пользователь с таким email уже существует");
        }

        // Создаем нового пользователя 
        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            FullName = request.FullName,
            RoleId = null,
            CompanyId = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Сохраняем пользователя в БД
        _context.Users.Add(user);
        await _context.SaveChangesAsync();



        var response = new RegisterResponse
        {
            Success = true,
            Message = "Регистрация успешна! Пожалуйста, выполните вход.",
            UserDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                RoleId = user.RoleId,
                CompanyId = user.CompanyId
            }
        };

        return response;
    }

    public async Task<LoginResponse> RegisterAndLogin(RegisterRequest request)
    {
        RegisterResponse registerResponse = await Register(request);
        LoginResponse loginResponse = await Login(new LoginRequest { Email = request.Email, Password = request.Password });
        return loginResponse;
    }
}
