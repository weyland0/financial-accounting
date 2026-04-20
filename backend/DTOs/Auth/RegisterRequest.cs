using System.Text.RegularExpressions;
using finacc.Utility;

namespace finacc.DTOs.Auth;


public class RegisterRequest
{
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public required string Password { get; set; }

    public Result Validate()
    {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(FullName) || string.IsNullOrWhiteSpace(Password))
        {
            return Result.Failure("Все поля обязательны");
        }

        // Проверяем корректность email
        if (!Regex.IsMatch(Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            return Result.Failure("Email имеет неверный формат");
        }

        // Проверяем длину пароля
        if (Password.Length < 8)
        {
            return Result.Failure("Пароль должен быть минимум 8 символов");
        }

        // Проверяем пароль на сложность
        if (!Regex.IsMatch(Password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"))
        {
            return Result.Failure("Пароль должен содержать минимум 8 символов, одну заглавную букву, одну цифру и один специальный символ");
        }

        return Result.Success();
    }
}
