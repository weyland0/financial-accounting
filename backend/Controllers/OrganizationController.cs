using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using finacc.Services;
using System.Security.Claims;
using finacc.DTOs;

namespace FinanceApp.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class OrganizationController : ControllerBase
    {
        private readonly IOrganizationService _organizationService;


        public OrganizationController(IOrganizationService organizationService)
        {
            _organizationService = organizationService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] OrganizationRequest request)
        {
            // Проверка валидации модели
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            // Получаем ID текущего пользователя
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdString, out var userId))
            {
                return Result<OrganizationResponse>.Failure("Не удалось получить ID пользователя", 401).ToActionResult();
            }

            // Создаем организацию
            var result = await _organizationService.Create(userId, request);
            return result.ToActionResult();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _organizationService.GetById(id);
            return result.ToActionResult();
        }
    }
}
