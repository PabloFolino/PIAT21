# SISTEMA PAT — PROYECTO DE ACOMPAÑAMIENTO DE TRAYECTORIAS

Autor: Folino Inc
Versión: 1.0
Fecha: 15/12/2025
Plataforma: Google Workspace (Drive, Sheets, Forms, Apps Script)

## Índice
## 1. Introducción
## 2. Objetivo del sistema
## 3. Archivos que componen el sistema
## 4. Estructura de Google Drive
## 5. Estructura del Google Sheet Seleccion_PAT
## 6. Google Form de inscripcin
## 7. Apps Script (automatizacin)
## 8. Dashboard para directivos
## 9. Poltica de permisos
## 10. Secuencia completa de funcionamiento
## 11. Instalacin paso a paso
## 12. Mantenimiento y operacin diaria

## 1. INTRODUCCIN

El Sistema PAT es una solucin integral desarrollada en Google Workspace
para gestionar la asignacin de docentes tutores a alumnos, garantizando:

- Cupos mximos por docente
- Restricciones segn ciclo y especialidad
- Registro automtico de alumnos
- Generacin de archivos individuales
- Control de permisos
- Visualizacin en tiempo real para directivos

El sistema est pensado para escuelas secundarias tcnicas
con modalidad de 6 aos.

## 2. OBJETIVO DEL SISTEMA

- Permitir que los alumnos se inscriban mediante un Google Form
- Asignar automticamente un docente segn reglas acadmicas
- Limitar la cantidad de alumnos por docente (configurable)
- Crear un archivo individual por alumno
- Permitir que SOLO el docente asignado pueda editar
- Brindar a directivos un dashboard en tiempo real

## 3. ARCHIVOS QUE COMPONEN EL SISTEMA

1. Google Sheet: Seleccion_PAT
? Archivo central del sistema

2. Google Sheet: Apellido_Nombre_xxx
? Plantilla base del alumno (se copia automticamente)

3. Google Form: Inscripcin PAT
? Carga de datos del alumno

4. Apps Script (Code.gs)
? Automatizacin completa del proceso

5. HTML (dashboard.html)
? Dashboard web para directivos

6. Carpeta Drive: PAT
? Almacenamiento de archivos individuales

## 4. ESTRUCTURA DE GOOGLE DRIVE

```text
PAT/
 +-- A/
     +-- Apellido_Nombre_123
     +-- Apellido_Nombre_456
 +-- B/
 +-- C/
 +-- ...
 +-- Z/

```
Reglas:
- Una carpeta por letra del apellido
- Un archivo por alumno
- Nombre del archivo:
Apellido_Nombre_ULTIMOS3DNI

## 5. GOOGLE SHEET: Seleccion_PAT

Este archivo contiene las siguientes hojas:

### 5.1 Hoja: Config

Contiene los parmetros globales del sistema.

Columnas:
A: Clave
B: Valor
C: Descripcin

Claves utilizadas:
- RUTA_RAIZ            ? ID carpeta PAT
- ID_PLANTILLA        ? ID de Apellido_Nombre_xxx
- MAX_POR_DEFECTO     ? Cupo por docente
- SISTEMA_ACTIVO      ? TRUE / FALSE

### 5.2 Hoja: Docentes

Define los docentes disponibles y sus capacidades.

Columnas:
A: Nombre
B: Email
C: Ciclos (CB, CSC, CSM o combinaciones)
D: Mx Alumnos (opcional)

Ejemplos:
- `CB`
CB,CSC
CSC,CSM

### 5.3 Hoja: Alumnos

Registro final de asignaciones.

Columnas:
A: Timestamp
B: Email Alumno
C: Apellido
D: Nombre
E: DNI
F: Ao que cursa
G: Especialidad
H: Email Docente asignado
I: URL archivo alumno
J: URL carpeta alumno

### 5.4 Hoja: Errores

Registro de incidencias.

Columnas:
Timestamp | Email Alumno | Motivo

## 6. GOOGLE FORM: INSCRIPCIN PAT

El formulario contiene los siguientes campos:

- Apellido del Estudiante
- Nombre del Estudiante
- DNI
- Nacionalidad
- Fecha de Nacimiento
- Email institucional
- Distrito
- Municipalidad
- Calle
- Cdigo Postal
- Nombre Tutor 1
- Telfono Tutor 1
- Email Tutor 1
- Nombre Tutor 2
- Telfono Tutor 2
- Email Tutor 2
- Ficha salud
- Ao que cursa en la actualidad (1 a 6)
- Especialidad:
Ciclo Bsico
Computacin
Maestro Mayor de Obras

El Form debe estar vinculado al Sheet Seleccion_PAT.

## 7. APPS SCRIPT (Code.gs)

Responsabilidades del script:

- Leer configuracin
- Filtrar docentes segn:
Ao (1 a 3 ? CB)
Especialidad (CSC / CSM)
- Verificar cupos disponibles
- Seleccionar docente con menor carga
- Crear carpeta por letra
- Copiar plantilla del alumno
- Completar datos automticamente
- Asignar permisos:
Docente: Editor
Resto: Solo lectura
- Registrar asignacin
- Registrar errores si no hay cupo

## 8. DASHBOARD PARA DIRECTIVOS

Acceso va Web App (HTML + Apps Script).

Muestra:
- Docente
- Ciclos que cubre
- Alumnos asignados
- Cupo mximo
- Cupos restantes

Acceso:
- Solo lectura
- En tiempo real
- Ideal para supervisin

## 9. POLTICA DE PERMISOS

- Archivos de alumnos:
Docente asignado ? Editor
Otros docentes ? Lectura
Directivos ? Editor
Alumnos ? Sin acceso

- Sheet Seleccion_PAT:
Directivos ? Editor
Sistema ? Editor
Docentes ? Lectura

## 10. SECUENCIA COMPLETA DE FUNCIONAMIENTO

## 1. Alumno completa Google Form
## 2. Se dispara onFormSubmit
## 3. El sistema:
- Lee ao y especialidad
- Filtra docentes vlidos
- Verifica cupos
## 4. Selecciona docente
## 5. Crea carpeta (si no existe)
## 6. Copia plantilla del alumno
## 7. Completa datos
## 8. Asigna permisos
## 9. Registra asignacin
## 10. Actualiza dashboard

## 11. INSTALACIN PASO A PASO

## 1. Crear carpeta PAT en Drive
## 2. Crear Google Sheet Seleccion_PAT
## 3. Crear hoja Config y cargar valores
## 4. Crear hoja Docentes
## 5. Crear plantilla Apellido_Nombre_xxx
## 6. Crear Google Form
## 7. Vincular Form a Seleccion_PAT
## 8. Abrir Apps Script y pegar Code.gs
## 9. Crear trigger:
- Evento: On form submit
## 10. Crear archivo dashboard.html
## 11. Publicar como Web App

## 12. MANTENIMIENTO Y OPERACIN

- Para agregar docentes ? Hoja Docentes
- Para cambiar cupos ? Hoja Docentes / Config
- Para pausar sistema ? SISTEMA_ACTIVO = FALSE
- Para auditora ? Hoja Alumnos / Errores
- El sistema es escalable y reutilizable ao a ao

FIN DEL DOCUMENTO
