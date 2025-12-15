using finacc.DataAccess;
using finacc.DTOs;
using finacc.Models;
using Microsoft.EntityFrameworkCore;

namespace finacc.Services;

public interface ICounterpartyService
{
    Task<Result<CounterpartyResponse>> Create(CounterpartyRequest request);
    Task<Result<List<CounterpartyResponse>>> GetAllByOrganization(int organizationId);
}

public class CounterpartyService : ICounterpartyService
{
    private readonly ApplicationDbContext _context;

    public CounterpartyService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CounterpartyResponse>> Create(CounterpartyRequest request)
    {
        var orgExists = await _context.Organizations.AnyAsync(o => o.Id == request.OrganizationId);
        if (!orgExists)
        {
            return Result<CounterpartyResponse>.Failure("Организация не найдена", 404);
        }

        var counterparty = new Counterparty
        {
            Name = request.Name,
            OrganizationId = request.OrganizationId,
            Type = request.Type,
            Category = request.Category,
            Phone = request.Phone,
            Email = request.Email,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Counterparties.Add(counterparty);
        await _context.SaveChangesAsync();

        return Result<CounterpartyResponse>.Success(Map(counterparty));
    }

    public async Task<Result<List<CounterpartyResponse>>> GetAllByOrganization(int organizationId)
    {
        var orgExists = await _context.Organizations.AnyAsync(o => o.Id == organizationId);
        if (!orgExists)
        {
            return Result<List<CounterpartyResponse>>.Failure("Организация не найдена", 404);
        }

        var items = await _context.Counterparties
            .Where(c => c.OrganizationId == organizationId)
            .OrderBy(c => c.Name)
            .ToListAsync();

        var responses = items.Select(Map).ToList();
        return Result<List<CounterpartyResponse>>.Success(responses);
    }

    private CounterpartyResponse Map(Counterparty c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        OrganizationId = c.OrganizationId,
        Type = c.Type,
        Category = c.Category,
        Phone = c.Phone,
        Email = c.Email
    };
}

