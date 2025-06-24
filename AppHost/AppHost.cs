var builder = DistributedApplication.CreateBuilder(args);

var api = builder
    .AddGolangApp("api", "../api")
    .WithHttpEndpoint(env: "PORT")
    // .WithHealthCheck("/health")
    .WithExternalHttpEndpoints();

var vite = builder
    .AddViteApp("vite", "../bingo")
    .WithExternalHttpEndpoints()
    .WithNpmPackageInstallation();

builder.Build().Run();
