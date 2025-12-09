using finacc.DataAccess;
using finacc.DTOs;
using finacc.Models;
using Microsoft.EntityFrameworkCore;

namespace finacc.Services;


public interface ICategoryService
{
    Task<Result<CategoryResponse>> Create(CategoryRequest request);
    Task<Result<List<CategoryResponse>>> GetAllByOrganization(int organizationId);
}


public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;

    public CategoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CategoryResponse>> Create(CategoryRequest request)
    {
        if (request.OrganizationId is null)
        {
            return Result<CategoryResponse>.Failure("OrganizationId обязателен");
        }

        // Проверяем что организация существует
        var orgExists = await _context.Organizations.AnyAsync(o => o.Id == request.OrganizationId);
        if (!orgExists)
        {
            return Result<CategoryResponse>.Failure("Организация не найдена", 404);
        }

        var category = new Categories
        {
            Name = request.Name,
            CategoryType = request.CategoryType,
            ActivityType = request.ActivityType,
            Description = request.Description,
            OrganizationId = request.OrganizationId,
            ParentId = request.ParentId
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var response = MapToResponse(category);
        return Result<CategoryResponse>.Success(response);
    }

    public async Task<Result<List<CategoryResponse>>> GetAllByOrganization(int organizationId)
    {
        var categories = await _context.Categories
            .Where(c => c.OrganizationId == organizationId || c.OrganizationId == null)
            .OrderBy(c => c.CategoryType)
            .ThenBy(c => c.Name)
            .ToListAsync();

        var responses = categories.Select(MapToResponse).ToList();
        return Result<List<CategoryResponse>>.Success(responses);
    }

    private static CategoryResponse MapToResponse(Categories category)
    {
        return new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            CategoryType = category.CategoryType,
            ActivityType = category.ActivityType,
            Description = category.Description,
            OrganizationId = category.OrganizationId,
            ParentId = category.ParentId
        };
    }
}

