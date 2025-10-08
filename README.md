# .NET Clean Architecture Generator

Generator này giúp tạo ra một solution .NET Clean Architecture hoàn chỉnh với tất cả các layer và cấu trúc cần thiết.

## Cấu trúc Solution

Solution được tạo sẽ bao gồm các project sau:

### Core Projects
- **{{projectName}}.Shared** - Chứa các class, enum, extension và helper dùng chung
- **{{projectName}}.Domain** - Chứa entities, interfaces, aggregates và business logic
- **{{projectName}}.Application** - Chứa DTOs, services, validators và application logic
- **{{projectName}}.Infrastructure** - Chứa repositories, persistence và external services

### Web Projects
- **{{projectName}}.API** - Web API với Swagger, JWT authentication và API versioning
- **{{projectName}}.Storage** - Static file storage service
- **{{projectName}}.WebAdmin** - MVC web application cho admin panel

## Cấu trúc Folder

### Shared Layer
```
{{projectName}}.Shared/
├── Entities/
├── Enums/
├── Extensions/
├── Helpers/
├── Services/
└── Constants/
```

### Domain Layer
```
{{projectName}}.Domain/
├── Entities/
├── Interfaces/
├── Aggregates/
├── DTParamters/
├── Enums/
├── Abstractions/
└── Settings/
```

### Application Layer
```
{{projectName}}.Application/
├── DTOs/
├── Interfaces/
├── Implements/
├── Mappings/
├── Validators/
├── Constants/
├── EmailTemplates/
├── StaticFiles/
└── DependencyInjection/
```

### Infrastructure Layer
```
{{projectName}}.Infrastructure/
├── Repositories/
├── Persistence/
├── Services/
├── Constants/
└── DependencyInjection/
```

### API Layer
```
{{projectName}}.API/
├── Controllers/
├── Middlewares/
├── Utilities/
├── Properties/
└── Logs/
```

### Storage Layer
```
{{projectName}}.Storage/
├── Controllers/
├── Services/
├── Interfaces/
├── Models/
├── Enums/
├── Constants/
├── Helpers/
├── Utilities/
├── Logs/
└── wwwroot/
```

### WebAdmin Layer
```
{{projectName}}.WebAdmin/
├── Controllers/
├── Models/
├── Views/
├── Logs/
├── wwwroot/
└── Properties/
```

## Cách sử dụng

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy generator:
```bash
node test-generator.js
```

3. Hoặc sử dụng CLI:
```bash
node src/index.js generate-project --name YourProjectName
```

## Features

- ✅ Tạo đầy đủ cấu trúc Clean Architecture
- ✅ Tự động tạo các file .csproj với dependencies
- ✅ Tạo solution file (.sln) với tất cả projects
- ✅ Tạo Program.cs cho từng web project
- ✅ Tạo appsettings.json và appsettings.Development.json
- ✅ Tạo launchSettings.json cho development
- ✅ Cấu hình Serilog cho logging
- ✅ Cấu hình JWT authentication cho API
- ✅ Cấu hình API versioning
- ✅ Cấu hình Swagger cho API documentation

## Templates

Generator sử dụng Handlebars templates để tạo code. Các template được lưu trong thư mục `templates/`:

- `entity.hbs` - Template cho Entity classes
- `controller.hbs` - Template cho Controller classes
- `service.hbs` - Template cho Service classes
- `repository.hbs` - Template cho Repository classes
- `dto-*.hbs` - Templates cho các DTO classes
- `program-*.hbs` - Templates cho Program.cs files
- `appsettings*.hbs` - Templates cho configuration files
- `launch-settings.hbs` - Template cho launchSettings.json

## Customization

Bạn có thể customize generator bằng cách:

1. Chỉnh sửa `src/config/project-config.js` để thay đổi cấu trúc project
2. Chỉnh sửa các template trong thư mục `templates/`
3. Thêm các layer mới trong project generator

## Dependencies

- Node.js
- Handlebars
- Chalk (cho colored output)
- UUID (cho generate GUIDs)# dotnet-clean-architecture-generator
