namespace finacc.DTOs.User;

public class UserRoleUpdateRequest
{
    // OrganizationId убран — извлекается из JWT-токена в контроллере
    public required int RoleId { get; set; }
}

