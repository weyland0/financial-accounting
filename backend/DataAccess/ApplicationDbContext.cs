using Microsoft.EntityFrameworkCore;
using finacc.Models;

namespace finacc.DataAccess;


public class ApplicationDbContext : DbContext
{
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Categories> Categories { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Counterparty> Counterparties { get; set; }
    public DbSet<Invoice> Invoices { get; set; }


    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }
}