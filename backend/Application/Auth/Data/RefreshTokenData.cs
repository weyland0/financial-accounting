using finacc.Models;

namespace finacc.Application.Auth.Data;

public class RefreshTokenData
{
    public required User User { get; set; }
}