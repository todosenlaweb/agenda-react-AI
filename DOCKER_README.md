# 🐳 Ejecutar Lobas VIP con Docker

Este proyecto puede ejecutarse completamente en Docker sin necesidad de instalar Node.js localmente.

## 📋 Prerrequisitos

Solo necesitas tener **Docker** y **Docker Compose** instalados en tu sistema:
- [Instalar Docker Desktop](https://www.docker.com/products/docker-desktop/)

## 🚀 Comandos para ejecutar

### Opción 1: Usar Docker Compose (Recomendado)

```bash
# Construir y ejecutar el contenedor
docker-compose up --build

# Ejecutar en segundo plano (detached mode)
docker-compose up -d --build

# Parar el contenedor
docker-compose down
```

### Opción 2: Usar Docker directamente

```bash
# Construir la imagen
docker build -t agenda-react-app .

# Ejecutar el contenedor
docker run -p 5173:5173 -v ${PWD}:/app -v /app/node_modules agenda-react-app
```

## 🌐 Acceder a la aplicación

Una vez que el contenedor esté ejecutándose, abre tu navegador y ve a:

**http://localhost:5173**

## 📁 Archivos creados

- `Dockerfile`: Configuración del contenedor
- `docker-compose.yml`: Orquestación del contenedor con volúmenes para desarrollo
- `.dockerignore`: Archivos a excluir de la imagen Docker

## 🔄 Desarrollo con Hot Reload

El contenedor está configurado con volúmenes que permiten:
- **Hot reload**: Los cambios en el código se reflejan automáticamente
- **Persistencia de node_modules**: Las dependencias se mantienen en el contenedor

## 🛠️ Comandos útiles

```bash
# Ver logs del contenedor
docker-compose logs -f

# Acceder al shell del contenedor
docker-compose exec agenda-react-app sh

# Reconstruir solo si hay cambios en dependencies
docker-compose up --build

# Limpiar todo (contenedores, volúmenes, imágenes)
docker-compose down -v --rmi all
```

## 🎯 Características del setup

- **Base**: Node.js 18 Alpine (imagen ligera)
- **Puerto**: 5173 (puerto por defecto de Vite)
- **Modo**: Desarrollo con hot reload
- **Volúmenes**: Código fuente montado para desarrollo en tiempo real

