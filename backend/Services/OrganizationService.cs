using finacc.DataAccess;
using finacc.DTOs;
using finacc.Models;
using Microsoft.EntityFrameworkCore;

namespace finacc.Services;


public interface IOrganizationService
{
    Task<Result<OrganizationResponse>> Create(int userId, OrganizationRequest request);

    Task<Result<OrganizationResponse>> GetById(int id);

    Task<Result<OrganizationResponse>> Update(int id, OrganizationRequest request);
}


public class OrganizationService : IOrganizationService
{
    private readonly ApplicationDbContext _context;

    public OrganizationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<OrganizationResponse>> Create(int userId, OrganizationRequest request)
    {
        // Проверяем что пользователь еще не состоит в организации
        var user = await _context.Users.FindAsync(userId);
        if (user is null)
        {
            return Result<OrganizationResponse>.Failure("Такого пользователя не существует");
        }
        if (user.OrganizationId is not null)
        {
            return Result<OrganizationResponse>.Failure("Пользователь уже состоит в организации.");
        }

        // Создаем новую организацию
        var org = new Organization
        {
            Name = request.Name,
            LegalEntityName = request.LegalEntityName,
            RegistrationNumber = request.RegistrationNumber,
            TaxId = request.TaxId,
            FullAddress = request.FullAddress,
            Email = request.Email,
            Phone = request.Phone,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Добавляем организацию в БД
        _context.Organizations.Add(org);
        await _context.SaveChangesAsync();

        // Назначаем пользователя администратором организации
        user.OrganizationId = org.Id;
        user.RoleId = 1;
        await _context.SaveChangesAsync();

        // Возвращаем ответ
        var response = new OrganizationResponse
        {
            Id = org.Id,
            Name = org.Name,
            LegalEntityName = org.LegalEntityName,
            RegistrationNumber = org.RegistrationNumber,
            TaxId = org.TaxId,
            FullAddress = org.FullAddress,
            Email = org.Email,
            Phone = org.Phone,
            CreatedAt = org.CreatedAt,
            UpdatedAt = org.UpdatedAt
        };

        return Result<OrganizationResponse>.Success(response);
    }

    public async Task<Result<OrganizationResponse>> GetById(int id)
    {
        var org = await _context.Organizations.FirstOrDefaultAsync(o => o.Id == id);
        if (org is null)
        {
            return Result<OrganizationResponse>.Failure("Организация не найдена");
        }

        var response = new OrganizationResponse
        {
            Id = org.Id,
            Name = org.Name,
            LegalEntityName = org.LegalEntityName,
            RegistrationNumber = org.RegistrationNumber,
            TaxId = org.TaxId,
            FullAddress = org.FullAddress,
            Email = org.Email,
            Phone = org.Phone,
            CreatedAt = org.CreatedAt,
            UpdatedAt = org.UpdatedAt
        };

        return Result<OrganizationResponse>.Success(response);
    }

    public async Task<Result<OrganizationResponse>> Update(int id, OrganizationRequest request)
    {
        var org = await _context.Organizations.FirstOrDefaultAsync(o => o.Id == id);

        if (org == null)
        {
            return Result<OrganizationResponse>.Failure("Организация не найдена");
        }

        // Обновляем поля
        org.Name = request.Name ?? org.Name;
        org.LegalEntityName = request.LegalEntityName ?? org.LegalEntityName;
        org.FullAddress = request.FullAddress ?? org.FullAddress;
        org.Email = request.Email ?? org.Email;
        org.Phone = request.Phone ?? org.Phone;
        org.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = new OrganizationResponse
        {
            Id = org.Id,
            Name = org.Name,
            LegalEntityName = org.LegalEntityName,
            RegistrationNumber = org.RegistrationNumber,
            TaxId = org.TaxId,
            FullAddress = org.FullAddress,
            Email = org.Email,
            Phone = org.Phone,
            CreatedAt = org.CreatedAt,
            UpdatedAt = org.UpdatedAt
        };

        return Result<OrganizationResponse>.Success(response);
    }
}
