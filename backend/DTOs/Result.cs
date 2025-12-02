using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace finacc.DTOs;


public class Result<T>
{
    public bool IsSuccess { get; set; }
    public T? Data { get; set; }
    public string? ErrorMessage { get; set; }
    public int? ErrorCode { get; set; }


    public static Result<T> Success(T data)
    {
        return new Result<T> { IsSuccess = true, Data = data };
    }

    public static Result<T> Failure(string errorMessage, int errorCode = 400)
    {
        return new Result<T>
        {
            IsSuccess = false,
            ErrorMessage = errorMessage,
            ErrorCode = errorCode
        };
    }
}


public static class ResultExtensions
{
    /// <summary>
    /// Преобразует Result в IActionResult.
    /// При успехе возвращает чистый DTO (200 OK).
    /// При ошибке возвращает ProblemDetails с соответствующим статус-кодом.
    /// </summary>
    public static IActionResult ToActionResult<T>(this Result<T> result)
    {
        if (result.IsSuccess && result.Data != null)
        {
            // При успехе возвращаем чистый DTO
            return new OkObjectResult(result.Data);
        }

        // При ошибке возвращаем ProblemDetails (стандартный формат ASP.NET Core)
        var statusCode = result.ErrorCode ?? StatusCodes.Status400BadRequest;
        var problemDetails = new ProblemDetails
        {
            Title = "Ошибка обработки запроса",
            Detail = result.ErrorMessage ?? "Произошла ошибка",
            Status = statusCode,
            Type = GetProblemType(statusCode)
        };

        return new ObjectResult(problemDetails) { StatusCode = statusCode };
    }

    private static string GetProblemType(int statusCode)
    {
        return statusCode switch
        {
            400 => "https://tools.ietf.org/html/rfc7231#section-6.5.1", // Bad Request
            401 => "https://tools.ietf.org/html/rfc7235#section-3.1", // Unauthorized
            403 => "https://tools.ietf.org/html/rfc7231#section-6.5.3", // Forbidden
            404 => "https://tools.ietf.org/html/rfc7231#section-6.5.4", // Not Found
            409 => "https://tools.ietf.org/html/rfc7231#section-6.5.8", // Conflict
            500 => "https://tools.ietf.org/html/rfc7231#section-6.6.1", // Internal Server Error
            _ => "https://tools.ietf.org/html/rfc7231#section-6.5.1" // Default to Bad Request
        };
    }
}