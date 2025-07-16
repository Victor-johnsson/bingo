using Azure.Provisioning.CognitiveServices;

var builder = DistributedApplication.CreateBuilder(args);

var ai = builder.AddAzureOpenAI("openai");

ai.AddDeployment(name: "preview", modelName: "gpt-4o-mini", modelVersion: "2024-07-18");

var api = builder
    .AddGolangApp("api", "../api")
    .WithHttpEndpoint(env: "PORT")
    .WithReference(ai)
    .WithExternalHttpEndpoints();

var vite = builder
    .AddViteApp("vite", "../bingo")
    .WithExternalHttpEndpoints()
    .WithEnvironment("VITE_API_BASE_URL", api.GetEndpoint("http"))
    .WithNpmPackageInstallation();

builder.Build().Run();
