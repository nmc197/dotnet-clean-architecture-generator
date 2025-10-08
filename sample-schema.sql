-- Sample SQL Schema for testing
-- This file contains CREATE TABLE statements that will be parsed

CREATE TABLE [Categories] (
    [Id] int IDENTITY(1,1) PRIMARY KEY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NULL,
    [IsActive] bit NOT NULL DEFAULT 1,
    [CreatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
    [UpdatedDate] datetime2 NULL
);

CREATE TABLE [Products] (
    [Id] int IDENTITY(1,1) PRIMARY KEY,
    [Name] nvarchar(200) NOT NULL,
    [Description] nvarchar(1000) NULL,
    [Price] decimal(18,2) NOT NULL,
    [CategoryId] int NOT NULL,
    [StockQuantity] int NOT NULL DEFAULT 0,
    [IsActive] bit NOT NULL DEFAULT 1,
    [CreatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
    [UpdatedDate] datetime2 NULL,
    [ImageUrl] nvarchar(500) NULL,
    CONSTRAINT [FK_Products_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [Categories]([Id])
);

CREATE TABLE [Customers] (
    [Id] int IDENTITY(1,1) PRIMARY KEY,
    [FirstName] nvarchar(100) NOT NULL,
    [LastName] nvarchar(100) NOT NULL,
    [Email] nvarchar(255) NOT NULL UNIQUE,
    [Phone] nvarchar(20) NULL,
    [Address] nvarchar(500) NULL,
    [City] nvarchar(100) NULL,
    [Country] nvarchar(100) NULL,
    [IsActive] bit NOT NULL DEFAULT 1,
    [CreatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
    [UpdatedDate] datetime2 NULL
);

CREATE TABLE [Orders] (
    [Id] int IDENTITY(1,1) PRIMARY KEY,
    [CustomerId] int NOT NULL,
    [OrderNumber] nvarchar(50) NOT NULL UNIQUE,
    [OrderDate] datetime2 NOT NULL DEFAULT GETDATE(),
    [TotalAmount] decimal(18,2) NOT NULL,
    [Status] nvarchar(50) NOT NULL DEFAULT 'Pending',
    [ShippingAddress] nvarchar(500) NULL,
    [Notes] nvarchar(1000) NULL,
    [CreatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
    [UpdatedDate] datetime2 NULL,
    CONSTRAINT [FK_Orders_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [Customers]([Id])
);

CREATE TABLE [OrderItems] (
    [Id] int IDENTITY(1,1) PRIMARY KEY,
    [OrderId] int NOT NULL,
    [ProductId] int NOT NULL,
    [Quantity] int NOT NULL,
    [UnitPrice] decimal(18,2) NOT NULL,
    [TotalPrice] decimal(18,2) NOT NULL,
    [CreatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_OrderItems_Orders] FOREIGN KEY ([OrderId]) REFERENCES [Orders]([Id]),
    CONSTRAINT [FK_OrderItems_Products] FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id])
);

CREATE TABLE [Users] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [Username] nvarchar(50) NOT NULL UNIQUE,
    [Email] nvarchar(255) NOT NULL UNIQUE,
    [PasswordHash] nvarchar(255) NOT NULL,
    [FirstName] nvarchar(100) NOT NULL,
    [LastName] nvarchar(100) NOT NULL,
    [IsActive] bit NOT NULL DEFAULT 1,
    [LastLoginDate] datetime2 NULL,
    [CreatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
    [UpdatedDate] datetime2 NULL
);
