using finacc.DTOs;
using System.Text.RegularExpressions;

namespace finacc.Validators;


public class DataValidatorResponse
{
    public bool Success;
    public string? Message = null;


    public DataValidatorResponse(bool success)
    {
        Success = success;
    }

    public DataValidatorResponse(bool success, string message)
    {
        Success = success;
        Message = message;
    }
}


public class AuthDataValidator
{
    public DataValidatorResponse CheckLoginRequest(LoginRequest request)
    {
        // Проверяем ввод пользователя
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return new DataValidatorResponse(false, "Почта и пароль обязательны");
        }

        return new DataValidatorResponse(true);
    }

    public DataValidatorResponse CheckRegisterRequest(RegisterRequest request)
    {
        // Проверяем ввод пользователя
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.FullName))
        {
            return new DataValidatorResponse(false, "Все поля обязательны");
        }

        // Проверяем корректность пароля (минимум 8 символов)
        if (request.Password.Length < 8)
        {
            return new DataValidatorResponse(false, "Пароль должен быть минимум 8 символов");
        }

        string pattern = @"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$";
        if (!Regex.IsMatch(request.Email, pattern, RegexOptions.IgnoreCase))
        {
            return new DataValidatorResponse(false, "Email имеет неверрный формат");
        }

        return new DataValidatorResponse(true);
    }
}