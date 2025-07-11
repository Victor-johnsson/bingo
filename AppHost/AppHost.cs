using Azure.Provisioning.CognitiveServices;

var builder = DistributedApplication.CreateBuilder(args);

// var existingName = builder.AddParameter("existingOpenAIName");
// var existingAIResourceGroup = builder.AddParameter("existingOpenAIResourceGroup");

var ai = builder.AddAzureOpenAI("openai");

// var ai = builder.AddA

ai.AddDeployment(name: "preview", modelName: "gpt-4o-mini", modelVersion: "2024-07-18");

// var ai = builder.AddOllama("ollama").WithOpenWebUI().AddModel("phi4");
var api = builder
    .AddGolangApp("api", "../api")
    .WithHttpEndpoint(env: "PORT")
    .WithReference(ai)
    // .WithHealthCheck("/health")
    .WithExternalHttpEndpoints();

var vite = builder
    .AddViteApp("vite", "../bingo")
    .WithExternalHttpEndpoints()
    .WithNpmPackageInstallation();

builder.Build().Run();
