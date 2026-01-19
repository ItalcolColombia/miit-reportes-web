# Guia de Despliegue en AWS EC2

Esta guia detalla el proceso completo para desplegar la aplicacion MIIT Reportes Web en una instancia EC2 de AWS usando Docker.

---

## Indice

1. [Requisitos Previos](#1-requisitos-previos)
2. [Crear Instancia EC2](#2-crear-instancia-ec2)
3. [Configurar Security Groups](#3-configurar-security-groups)
4. [Conectarse a la Instancia](#4-conectarse-a-la-instancia)
5. [Instalar Docker](#5-instalar-docker)
6. [Desplegar la Aplicacion](#6-desplegar-la-aplicacion)
7. [Configurar SSL con Certbot](#7-configurar-ssl-con-certbot-opcional)
8. [Monitoreo y Mantenimiento](#8-monitoreo-y-mantenimiento)
9. [Comandos Utiles](#9-comandos-utiles)

---

## 1. Requisitos Previos

- Cuenta de AWS activa
- AWS CLI configurado (opcional, para automatizacion)
- Dominio configurado (opcional, para SSL)
- Par de claves SSH (.pem) para acceder a la instancia

---

## 2. Crear Instancia EC2

### 2.1. Acceder a la consola de AWS

1. Ir a [AWS Console](https://console.aws.amazon.com)
2. Navegar a **EC2** > **Instances** > **Launch Instance**

### 2.2. Configurar la instancia

| Configuracion | Valor Recomendado |
|---------------|-------------------|
| Nombre | `miit-reportes-web` |
| AMI | Amazon Linux 2023 o Ubuntu 22.04 LTS |
| Tipo de instancia | `t3.micro` (free tier) o `t3.small` |
| Key pair | Crear o seleccionar existente |
| Almacenamiento | 20 GB gp3 |

### 2.3. Configuracion de red

- **VPC**: Seleccionar VPC por defecto o crear una
- **Subnet**: Seleccionar subnet publica
- **Auto-assign Public IP**: Habilitar

---

## 3. Configurar Security Groups

Crear o configurar un Security Group con las siguientes reglas:

### Reglas de entrada (Inbound)

| Tipo | Protocolo | Puerto | Origen | Descripcion |
|------|-----------|--------|--------|-------------|
| SSH | TCP | 22 | Tu IP | Acceso SSH |
| HTTP | TCP | 80 | 0.0.0.0/0 | Trafico web |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Trafico web seguro |

### Reglas de salida (Outbound)

| Tipo | Protocolo | Puerto | Destino | Descripcion |
|------|-----------|--------|---------|-------------|
| All traffic | All | All | 0.0.0.0/0 | Permitir todo el trafico saliente |

---

## 4. Conectarse a la Instancia

### 4.1. Desde terminal (Linux/Mac/Windows con WSL)

```bash
# Dar permisos correctos a la clave
chmod 400 tu-clave.pem

# Conectar via SSH
ssh -i "tu-clave.pem" ec2-user@<IP-PUBLICA-EC2>

# Para Ubuntu usar:
ssh -i "tu-clave.pem" ubuntu@<IP-PUBLICA-EC2>
```

### 4.2. Desde Windows (PuTTY)

1. Convertir .pem a .ppk usando PuTTYgen
2. Configurar la conexion en PuTTY con la IP y el archivo .ppk

---

## 5. Instalar Docker

### 5.1. Amazon Linux 2023

```bash
# Actualizar sistema
sudo dnf update -y

# Instalar Docker
sudo dnf install -y docker

# Iniciar y habilitar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario al grupo docker (evita usar sudo)
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Cerrar y volver a conectar para aplicar cambios de grupo
exit
```

### 5.2. Ubuntu 22.04

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Agregar repositorio de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Cerrar y volver a conectar
exit
```

### 5.3. Verificar instalacion

```bash
# Reconectar y verificar
ssh -i "tu-clave.pem" ec2-user@<IP-PUBLICA-EC2>

docker --version
docker-compose --version
```

---

## 6. Desplegar la Aplicacion

### 6.1. Opcion A: Build en EC2 (Recomendado para pruebas)

```bash
# Crear directorio para la aplicacion
mkdir -p ~/apps/miit-reportes-web
cd ~/apps/miit-reportes-web

# Clonar repositorio (si esta en Git)
git clone https://tu-repositorio.git .

# O transferir archivos via SCP desde tu maquina local:
# scp -i "tu-clave.pem" -r ./miit-reportes-web ec2-user@<IP>:~/apps/

# Crear archivo .env con las variables de produccion
cat > .env << 'EOF'
VITE_API_BASE_URL=https://tu-api.dominio.com/api/v1
VITE_APP_NAME=MIIT Reportes
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
WEB_PORT=80
APP_VERSION=1.0.0
EOF

# Construir y ejecutar
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Verificar que esta corriendo
docker-compose ps
docker-compose logs -f
```

### 6.2. Opcion B: Usar imagen pre-construida (Recomendado para produccion)

```bash
# En tu maquina local, construir y subir la imagen a Docker Hub o ECR

# 1. Construir imagen
docker build \
  --build-arg VITE_API_BASE_URL=https://tu-api.dominio.com/api/v1 \
  --build-arg VITE_APP_NAME="MIIT Reportes" \
  --build-arg VITE_APP_VERSION=1.0.0 \
  --build-arg VITE_APP_ENV=production \
  -t tu-usuario/miit-reportes-web:1.0.0 .

# 2. Subir a Docker Hub
docker login
docker push tu-usuario/miit-reportes-web:1.0.0

# En EC2, descargar y ejecutar
docker pull tu-usuario/miit-reportes-web:1.0.0
docker run -d \
  --name miit-reportes-web \
  --restart unless-stopped \
  -p 80:80 \
  tu-usuario/miit-reportes-web:1.0.0
```

### 6.3. Opcion C: Usar Amazon ECR

```bash
# 1. Crear repositorio en ECR (desde consola AWS o CLI)
aws ecr create-repository --repository-name miit-reportes-web --region us-east-1

# 2. Autenticarse en ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT-ID>.dkr.ecr.us-east-1.amazonaws.com

# 3. Etiquetar y subir imagen
docker tag miit-reportes-web:1.0.0 <ACCOUNT-ID>.dkr.ecr.us-east-1.amazonaws.com/miit-reportes-web:1.0.0
docker push <ACCOUNT-ID>.dkr.ecr.us-east-1.amazonaws.com/miit-reportes-web:1.0.0

# 4. En EC2, descargar y ejecutar
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT-ID>.dkr.ecr.us-east-1.amazonaws.com
docker pull <ACCOUNT-ID>.dkr.ecr.us-east-1.amazonaws.com/miit-reportes-web:1.0.0
docker run -d --name miit-reportes-web --restart unless-stopped -p 80:80 <ACCOUNT-ID>.dkr.ecr.us-east-1.amazonaws.com/miit-reportes-web:1.0.0
```

---

## 7. Configurar SSL con Certbot (Opcional)

Para habilitar HTTPS, puedes usar Nginx como proxy inverso con Certbot para certificados SSL gratuitos.

### 7.1. Instalar Certbot

```bash
# Amazon Linux 2023
sudo dnf install -y certbot python3-certbot-nginx

# Ubuntu
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2. Instalar Nginx en el host (como proxy)

```bash
# Amazon Linux 2023
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Ubuntu
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7.3. Configurar Nginx como proxy

```bash
sudo tee /etc/nginx/conf.d/miit-reportes.conf << 'EOF'
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Cambiar puerto del contenedor Docker a 8080
# Editar docker-compose.yml: ports: "8080:80"

# Reiniciar nginx
sudo nginx -t
sudo systemctl restart nginx
```

### 7.4. Obtener certificado SSL

```bash
# Asegurarse de que el dominio apunte a la IP de EC2
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Verificar renovacion automatica
sudo certbot renew --dry-run
```

---

## 8. Monitoreo y Mantenimiento

### 8.1. Ver logs

```bash
# Logs del contenedor
docker-compose logs -f

# Logs de nginx (si esta como proxy)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 8.2. Monitorear recursos

```bash
# Uso de recursos del contenedor
docker stats miit-reportes-web

# Uso de disco
df -h

# Uso de memoria
free -m
```

### 8.3. Actualizar la aplicacion

```bash
cd ~/apps/miit-reportes-web

# Descargar ultimos cambios
git pull origin main

# Reconstruir y reiniciar
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# O si usas imagen pre-construida
docker pull tu-usuario/miit-reportes-web:latest
docker-compose up -d
```

### 8.4. Backup y restauracion

```bash
# Backup de configuracion
tar -czvf backup-config.tar.gz .env docker-compose.yml

# Los datos de la aplicacion frontend no requieren backup
# (son estaticos y se regeneran en cada build)
```

---

## 9. Comandos Utiles

```bash
# === Docker ===
# Ver contenedores corriendo
docker ps

# Ver todos los contenedores
docker ps -a

# Reiniciar contenedor
docker-compose restart

# Detener contenedor
docker-compose down

# Ver logs en tiempo real
docker-compose logs -f

# Entrar al contenedor
docker exec -it miit-reportes-web /bin/sh

# Limpiar imagenes no usadas
docker system prune -a

# === Sistema ===
# Ver uso de disco
df -h

# Ver uso de memoria
free -m

# Ver procesos
htop  # o top

# Ver puertos en uso
sudo netstat -tlnp

# === Nginx (si se usa como proxy) ===
# Verificar configuracion
sudo nginx -t

# Recargar configuracion
sudo systemctl reload nginx

# Ver certificados SSL
sudo certbot certificates
```

---

## Troubleshooting

### La aplicacion no carga

1. Verificar que el contenedor esta corriendo: `docker ps`
2. Revisar logs: `docker-compose logs`
3. Verificar Security Groups en AWS
4. Probar localmente: `curl http://localhost/health`

### Error de conexion a la API

1. Verificar que `VITE_API_BASE_URL` es correcto
2. Verificar que la API esta accesible desde EC2
3. Revisar CORS en el backend

### Certificado SSL no funciona

1. Verificar que el dominio apunta a la IP correcta
2. Revisar configuracion de nginx: `sudo nginx -t`
3. Verificar certificados: `sudo certbot certificates`

---

## Arquitectura de Despliegue Recomendada

```
                    +------------------+
                    |   CloudFlare     |
                    |   (CDN + SSL)    |
                    +--------+---------+
                             |
                    +--------v---------+
                    |   AWS ALB        |
                    | (Load Balancer)  |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
     +--------v---------+         +--------v---------+
     |    EC2 - AZ1     |         |    EC2 - AZ2     |
     |  (Docker)        |         |  (Docker)        |
     +------------------+         +------------------+
              |                             |
              +--------------+--------------+
                             |
                    +--------v---------+
                    |   Backend API    |
                    | (Otro servidor)  |
                    +------------------+
```

Para alta disponibilidad, considera usar:
- **Application Load Balancer (ALB)** para distribuir trafico
- **Auto Scaling Group** para escalar automaticamente
- **Amazon ECS/EKS** para orquestacion de contenedores
- **CloudFront** como CDN para assets estaticos

---

## Costos Estimados (USD/mes)

| Recurso | Tipo | Costo Aproximado |
|---------|------|------------------|
| EC2 | t3.micro (free tier) | $0 - $10 |
| EC2 | t3.small | ~$15 |
| EBS | 20 GB gp3 | ~$2 |
| Data Transfer | 10 GB | ~$1 |
| **Total basico** | | **~$15-25/mes** |

*Nota: Precios pueden variar segun region y uso.*
