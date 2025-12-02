using Microsoft.EntityFrameworkCore;
using finacc.Models;

namespace finacc.DataAccess;


public class ApplicationDbContext : DbContext
{
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<User> Users { get; set; }


    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }
}