# BM Iluminación - Sistema de Gestión

Este proyecto está construido usando **Node.js + Express** para el backend y **React + Vite** para el frontend. Utiliza **MongoDB** como base de datos.

## Prerrequisitos

Para levantar el proyecto localmente, necesitas tener instalados en tu sistema:
- [Node.js](https://nodejs.org/es/) (versión 20+ recomendada)
- [MongoDB](https://www.mongodb.com/) (corriendo localmente o en la nube)

## Configuración del Entorno Local

1. Clona este repositorio.
2. Crea un archivo `.env` en la **raíz del proyecto** con las siguientes variables (este archivo no se subirá al repositorio porque ya está incluido en `.gitignore`):

```env
# Puerto en el que correrá el servidor backend
PORT=5000

# Cadena de conexión de MongoDB
# Ejemplo para desarrollo local:
MONGODB_URI=mongodb://127.0.0.1:27017/bm-iluminacion

# Secreto para la generación de tokens JWT
JWT_SECRET=tu_secreto_local_super_seguro
```

## Instalación de Dependencias

El proyecto tiene dos `package.json` separados (uno para el servidor en la raíz y otro para el frontend en `client/`). Instala ambos así:

```bash
# 1. Instala las dependencias del servidor backend
npm install

# 2. Mueve a la carpeta del cliente e instala las dependencias de React
cd client
npm install

# 3. Vuelve a la raíz del proyecto
cd ..
```

## Ejecución del Proyecto en Desarrollo

Una vez instaladas todas las dependencias y configurado el archivo `.env`, puedes levantar ambos servidores al mismo tiempo. Desde la raíz del proyecto, ejecuta:

```bash
npm run dev
```

Este comando utiliza `concurrently` para ejecutar:
- El backend en `http://localhost:5000`
- El cliente (Vite) en `http://localhost:5173`

> **Nota importante:** 
> La base de datos es inicializada automáticamente por el servidor con un usuario administrador predeterminado si es que este no existe.
> **Usuario:** `bmilumina`
> **Contraseña:** `Tortuga77710`
