using System.Text.RegularExpressions;
using finacc.Utility;

namespace finacc.DTOs.Auth;


public class LoginRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }

    public Result Validate()
    {
        // Проверяем ввод пользователя
        if (string.IsNullOrWhiteSpace(Email) ||
            string.IsNullOrWhiteSpace(Password))
        {
            return Result.Failure("Почта и пароль обязательны");
        }

        // Проверяем корректность email
        if (!Regex.IsMatch(Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            return Result.Failure("Email имеет неверный формат");
        }

        return Result.Success();
    }
}
