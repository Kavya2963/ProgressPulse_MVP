# ════════════════════════════════════════
# STAGE 1 — Build
# ════════════════════════════════════════
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# ── Copy .csproj files first (layer cache) ──
COPY Relevantz.ProgressPulse.Api/Relevantz.ProgressPulse.Api.csproj \
     Relevantz.ProgressPulse.Api/

COPY Relevantz.ProgressPulse.Common/Relevantz.ProgressPulse.Common.csproj \
     Relevantz.ProgressPulse.Common/

COPY Relevantz.ProgressPulse.Core/Relevantz.ProgressPulse.Core.csproj \
     Relevantz.ProgressPulse.Core/

COPY Relevantz.ProgressPulse.Data/Relevantz.ProgressPulse.Data.csproj \
     Relevantz.ProgressPulse.Data/

# ── Restore each project directly (bypasses .sln path issues) ──
RUN dotnet restore Relevantz.ProgressPulse.Api/Relevantz.ProgressPulse.Api.csproj
RUN dotnet restore Relevantz.ProgressPulse.Common/Relevantz.ProgressPulse.Common.csproj
RUN dotnet restore Relevantz.ProgressPulse.Core/Relevantz.ProgressPulse.Core.csproj
RUN dotnet restore Relevantz.ProgressPulse.Data/Relevantz.ProgressPulse.Data.csproj

# ── Copy all source code ──
COPY Relevantz.ProgressPulse.Api/       Relevantz.ProgressPulse.Api/
COPY Relevantz.ProgressPulse.Common/    Relevantz.ProgressPulse.Common/
COPY Relevantz.ProgressPulse.Core/      Relevantz.ProgressPulse.Core/
COPY Relevantz.ProgressPulse.Data/      Relevantz.ProgressPulse.Data/

# ── Build (restore already done above, but include it as fallback) ──
RUN dotnet build \
    Relevantz.ProgressPulse.Api/Relevantz.ProgressPulse.Api.csproj \
    -c Release \
    -o /app/build

# ════════════════════════════════════════
# STAGE 2 — Publish
# ════════════════════════════════════════
FROM build AS publish
RUN dotnet publish \
    Relevantz.ProgressPulse.Api/Relevantz.ProgressPulse.Api.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# ════════════════════════════════════════
# STAGE 3 — Runtime
# ════════════════════════════════════════
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

RUN mkdir -p /app/wwwroot/uploads

COPY --from=publish /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "Relevantz.ProgressPulse.Api.dll"]
