using Microsoft.AspNetCore.Http.HttpResults;
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
    public static IActionResult ToActionResult<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return new OkObjectResult(result);
        }

        return  new ObjectResult(result) { StatusCode = result.ErrorCode };
    }
}