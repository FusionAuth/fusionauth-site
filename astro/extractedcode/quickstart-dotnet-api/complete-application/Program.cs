using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "http://localhost:9011";
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new()
        {
            ValidAudience = "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e",
        };
        options.Events = new()
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies["app.at"];
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
