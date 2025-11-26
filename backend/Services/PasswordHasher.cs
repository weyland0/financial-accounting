using System.Security.Cryptography;
using System.Text;

namespace finacc.Services;


public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}


public class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    public bool Verify(string password, string hash)
    {
        var hashOfInput = Hash(password);
        return hashOfInput.Equals(hash);
    }
}
