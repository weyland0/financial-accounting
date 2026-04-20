using finacc.DataAccess;
using finacc.DTOs.Counterparty;
using finacc.Models;
using finacc.Utility;
using Microsoft.EntityFrameworkCore;

namespace finacc.Services;

public interface ICounterpartyService
{
    Task<Result<CounterpartyResponse>> Create(int organizationId, CreateCounterpartyRequest request);
    Task<Result<CounterpartyResponse>> Update(int id, int organizationId, UpdateCounterpartyRequest request);
    Task<Result<List<CounterpartyResponse>>> GetAllByOrganization(int organizationId);
}

public class CounterpartyService : ICounterpartyService
{
    private readonly ApplicationDbContext _context;

    public CounterpartyService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CounterpartyResponse>> Create(int organizationId, CreateCounterpartyRequest request)
    {
        var counterparty = new Counterparty
        {
            Name = request.Name,
            OrganizationId = organizationId,
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
        var items = await _context.Counterparties
            .Where(c => c.OrganizationId == organizationId)
            .OrderBy(c => c.Name)
            .ToListAsync();

        var responses = items.Select(Map).ToList();
        return Result<List<CounterpartyResponse>>.Success(responses);
    }

    public async Task<Result<CounterpartyResponse>> Update(int id, int organizationId, UpdateCounterpartyRequest request)
    {
        var counterparty = await _context.Counterparties.FirstOrDefaultAsync(crp => crp.Id == id && crp.OrganizationId == organizationId);
        if (counterparty is null)
        {
           return Result<CounterpartyResponse>.Failure("Не удалось найти контрагента в вашей организации", 404); 
        }

        counterparty.Name = request.Name ?? counterparty.Name;
        counterparty.Type = request.Type ?? counterparty.Type;
        counterparty.Category = request.Category ?? counterparty.Category;
        counterparty.Phone = request.Phone ?? counterparty.Phone;
        counterparty.Email = request.Email ?? counterparty.Email;
        counterparty.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Result<CounterpartyResponse>.Success(Map(counterparty));
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

