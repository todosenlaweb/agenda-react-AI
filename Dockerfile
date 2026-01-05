# Usar la imagen oficial de Node.js como base
FROM node:18-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto 5173 (puerto por defecto de Vite)
EXPOSE 5173

# Comando para ejecutar la aplicación en modo desarrollo
# Usando --host 0.0.0.0 para que sea accesible desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

