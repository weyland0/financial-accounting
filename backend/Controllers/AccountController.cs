using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using finacc.Services;
using finacc.DTOs;

namespace FinanceApp.Controllers;


[ApiController]
[Route("[controller]")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;


    public AccountController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] AccountRequest request)
    {
        // Проверка валидации модели
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        // Создаем счет
        var result = await _accountService.Create(request);
        return result.ToActionResult();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var result = await _accountService.GetById(id);
        return result.ToActionResult();
    }

    [HttpGet("get-by-organization/{id}")]
    public async Task<IActionResult> GetAllByOrganization(int id)
    {
        var result = await _accountService.GetAllByOrganization(id);
        return result.ToActionResult();
    }
}
