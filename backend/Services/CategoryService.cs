using finacc.DataAccess;
using finacc.DTOs.Category;
using finacc.Models;
using finacc.Utility;
using Microsoft.EntityFrameworkCore;

namespace finacc.Services;


public interface ICategoryService
{
    Task<Result<CategoryResponse>> Create(int organizationId, CreateCategoryRequest request);
    Task<Result<List<CategoryResponse>>> GetAllByOrganization(int organizationId);
}


public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;

    public CategoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CategoryResponse>> Create(int organizationId, CreateCategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name,
            CategoryType = request.CategoryType,
            ActivityType = request.ActivityType,
            Description = request.Description,
            OrganizationId = organizationId,
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

    private static CategoryResponse MapToResponse(Category category)
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

