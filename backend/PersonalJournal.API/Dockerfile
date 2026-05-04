FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["PersonalJournal.API/PersonalJournal.API.csproj", "PersonalJournal.API/"]
RUN dotnet restore "PersonalJournal.API/PersonalJournal.API.csproj"
COPY . .
WORKDIR "/src/PersonalJournal.API"
RUN dotnet build "PersonalJournal.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PersonalJournal.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PersonalJournal.API.dll"]
