# PIAT21

## Sistema de Plan Institucional para el Acompañamiento de las Trayectorias

**Escuela Técnica Nº 21 DE 10 — "Fragata Escuela Libertad"**

---

## 📌 Descripción

**PIAT21** es un sistema desarrollado para acompañar la implementación y gestión del **Plan Institucional para el Acompañamiento de las Trayectorias (PIAT)** de la Escuela Técnica Nº 21 DE 10.

El proyecto integra una propuesta institucional de acompañamiento con una solución tecnológica destinada a **organizar, automatizar y centralizar la asignación de docentes tutores y el seguimiento de los estudiantes**.

La implementación tecnológica utiliza herramientas de **Google Workspace**, integrando:

* Google Forms
* Google Sheets
* Google Drive
* Google Apps Script
* HTML para el dashboard de gestión

El repositorio reúne tanto la **documentación del proyecto** como el **software desarrollado para su implementación**.

---

## 🎯 Objetivos

El sistema busca facilitar la gestión institucional de las trayectorias educativas mediante:

* Registro centralizado de estudiantes.
* Asignación de docentes tutores.
* Organización de los docentes según ciclos y especialidades.
* Administración de cupos por docente.
* Automatización de tareas administrativas.
* Generación y organización de documentación individual.
* Gestión diferenciada de permisos de acceso.
* Seguimiento de las asignaciones realizadas.
* Registro de incidencias.
* Visualización de información para los equipos directivos.

---

## 🏫 Contexto institucional

El sistema está pensado para el contexto de una **escuela secundaria técnica de seis años**, contemplando la organización por ciclos y especialidades.

La asignación de docentes tiene en cuenta, entre otros parámetros:

* Año que cursa el estudiante.
* Ciclo correspondiente.
* Especialidad.
* Docentes disponibles.
* Cupo máximo de cada docente.

De esta manera, el sistema permite automatizar parte del proceso de organización del acompañamiento de las trayectorias.

---

# ⚙️ Arquitectura del sistema

El funcionamiento general puede representarse de la siguiente manera:

```text
                         PIAT21
                           │
                           ▼
                  ┌─────────────────┐
                  │   Google Form   │
                  │   Inscripción   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Google Sheets  │
                  │ Seleccion_PAT    │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   Apps Script   │
                  │   Motor lógico  │
                  └────────┬────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        Filtrar       Verificar     Seleccionar
        docentes        cupos         docente
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   Google Drive  │
                  │ Documentación   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │    Dashboard    │
                  │   Directivos    │
                  └─────────────────┘
```

---

# 🧩 Componentes principales

## Google Form

Es el punto de entrada de información al sistema.

Permite registrar los datos necesarios del estudiante para iniciar el proceso de asignación.

Entre los datos contemplados se encuentran:

* Apellido y nombre.
* DNI.
* Nacionalidad.
* Fecha de nacimiento.
* Correo institucional.
* Datos de contacto.
* Información de los responsables.
* Año que cursa.
* Especialidad.

El formulario se encuentra vinculado al archivo central `Seleccion_PAT`.

---

## Google Sheets

El archivo **`Seleccion_PAT`** constituye el núcleo de información del sistema.

Contiene diferentes hojas destinadas a configurar y registrar el funcionamiento:

### `Config`

Contiene los parámetros generales del sistema.

Entre ellos:

| Parámetro         | Función                                       |
| ----------------- | --------------------------------------------- |
| `RUTA_RAIZ`       | Identificación de la carpeta principal de PAT |
| `ID_PLANTILLA`    | Identificación de la plantilla utilizada      |
| `MAX_POR_DEFECTO` | Cupo general por docente                      |
| `SISTEMA_ACTIVO`  | Activación o pausa del sistema                |

### `Docentes`

Contiene la información de los docentes disponibles y su capacidad de atención.

Se registran:

* Nombre.
* Correo electrónico.
* Ciclos que puede atender.
* Máximo de alumnos, cuando corresponde.

### `Alumnos`

Registra las asignaciones realizadas por el sistema.

Incluye información como:

* Fecha y hora.
* Datos del estudiante.
* Año.
* Especialidad.
* Docente asignado.
* Enlace al archivo individual.
* Enlace a la carpeta correspondiente.

### `Errores`

Permite registrar las incidencias producidas durante el procesamiento.

---

# 🤖 Automatización mediante Apps Script

El componente central de automatización es **Google Apps Script**.

El procesamiento se inicia mediante el evento:

```javascript
onFormSubmit
```

A partir de la recepción de una nueva inscripción, el sistema:

1. Lee la información del estudiante.
2. Determina el año y la especialidad.
3. Filtra los docentes compatibles.
4. Verifica los cupos disponibles.
5. Selecciona el docente correspondiente.
6. Crea la carpeta necesaria en Google Drive.
7. Copia la plantilla individual.
8. Completa automáticamente los datos.
9. Configura los permisos.
10. Registra la asignación.
11. Registra posibles errores.
12. Actualiza la información utilizada por el dashboard.

---

# 👨‍🏫 Asignación de docentes

La asignación se realiza mediante reglas configurables.

Para cada estudiante se consideran las condiciones correspondientes a su trayectoria:

```text
Año
 │
 ├── 1º
 ├── 2º
 └── 3º
       │
       ▼
   Ciclo Básico
```

y, para los años correspondientes:

```text
Especialidad
 │
 ├── Computación
 └── Maestro Mayor de Obras
```

El sistema filtra los docentes que cumplen las condiciones y posteriormente verifica la disponibilidad de cupos.

Cuando existen docentes compatibles, se contempla la selección del docente con **menor carga asignada**, de acuerdo con las reglas definidas en el sistema.

---

# 📁 Organización de Google Drive

La documentación individual se organiza dentro de una carpeta principal:

```text
PAT/
│
├── A/
│   ├── Apellido_Nombre_123
│   └── Apellido_Nombre_456
│
├── B/
├── C/
├── ...
└── Z/
```

La organización contempla:

* Una carpeta asociada a cada inicial del apellido.
* Un archivo individual por estudiante.
* Una nomenclatura basada en apellido, nombre y los últimos tres dígitos del DNI.

Ejemplo:

```text
Apellido_Nombre_123
```

---

# 📊 Dashboard para equipos directivos

El sistema incorpora un **dashboard web** desarrollado mediante HTML y Apps Script.

Su finalidad es facilitar la supervisión del estado de las asignaciones.

La información contempla:

* Docentes.
* Ciclos atendidos.
* Cantidad de alumnos asignados.
* Cupo máximo.
* Cupos disponibles.

El dashboard está planteado para consulta y supervisión en tiempo real.

---

# 🔐 Gestión de permisos

El sistema contempla diferentes niveles de acceso según el rol de cada usuario.

### Archivos de estudiantes

| Usuario          | Permiso    |
| ---------------- | ---------- |
| Docente asignado | Editor     |
| Otros docentes   | Lectura    |
| Directivos       | Editor     |
| Estudiantes      | Sin acceso |

### Archivo `Seleccion_PAT`

| Usuario    | Permiso |
| ---------- | ------- |
| Directivos | Editor  |
| Sistema    | Editor  |
| Docentes   | Lectura |

Esta estructura busca mantener diferenciados los permisos de gestión, edición y consulta.

---

# 🔄 Flujo completo

El proceso general puede resumirse de la siguiente manera:

```text
1. El estudiante completa el formulario
                │
                ▼
2. Se registra la información
                │
                ▼
3. Se ejecuta onFormSubmit
                │
                ▼
4. Se analiza año y especialidad
                │
                ▼
5. Se filtran docentes compatibles
                │
                ▼
6. Se verifican los cupos
                │
                ▼
7. Se asigna el docente
                │
                ▼
8. Se crea la estructura en Drive
                │
                ▼
9. Se copia la plantilla
                │
                ▼
10. Se completan los datos
                │
                ▼
11. Se asignan permisos
                │
                ▼
12. Se registra la asignación
                │
                ▼
13. Se actualiza el dashboard
```

---

# 📚 Estructura del repositorio

El repositorio está organizado en dos áreas principales:

```text
PIAT21/
│
├── Documentación/
│
├── Software/
│   └── PAT/
│
└── README.md
```

### `Documentación/`

Contiene la documentación relacionada con el proyecto y su funcionamiento.

### `Software/PAT/`

Contiene los componentes correspondientes a la implementación del Sistema PAT.

### `README.md`

Documento principal del repositorio y punto de entrada para comprender el proyecto.

---

# 🛠️ Tecnologías utilizadas

| Tecnología             | Utilización                          |
| ---------------------- | ------------------------------------ |
| **Google Forms**       | Registro de estudiantes              |
| **Google Sheets**      | Base de datos y configuración        |
| **Google Drive**       | Organización de documentación        |
| **Google Apps Script** | Automatización y lógica del sistema  |
| **HTML**               | Interfaz del dashboard               |
| **GitHub**             | Control y documentación del proyecto |

---

# 🔧 Instalación y configuración

La implementación requiere configurar inicialmente el entorno de Google Workspace.

El proceso general comprende:

1. Crear la carpeta principal `PAT` en Google Drive.
2. Crear el archivo `Seleccion_PAT`.
3. Configurar la hoja `Config`.
4. Configurar la hoja `Docentes`.
5. Crear la plantilla individual.
6. Crear el Google Form.
7. Vincular el formulario con `Seleccion_PAT`.
8. Configurar Apps Script.
9. Crear el disparador `On form submit`.
10. Configurar el dashboard.
11. Publicar el dashboard como Web App.

La documentación detallada de instalación y operación se encuentra dentro del repositorio.

---

# 🔄 Mantenimiento

La configuración del sistema permite realizar modificaciones sin alterar su estructura general.

Entre las tareas habituales se encuentran:

* Agregar o modificar docentes.
* Modificar cupos.
* Cambiar parámetros generales.
* Activar o pausar el sistema.
* Consultar asignaciones.
* Revisar incidencias.
* Realizar tareas de auditoría.

Por ejemplo, para pausar el sistema se puede utilizar:

```text
SISTEMA_ACTIVO = FALSE
```

---

# 📈 Características del sistema

PIAT21 está diseñado con los siguientes principios:

* **Centralización** de la información.
* **Automatización** de tareas administrativas.
* **Configurabilidad** de docentes y cupos.
* **Trazabilidad** de las asignaciones.
* **Control de acceso** a la información.
* **Supervisión institucional** mediante dashboard.
* **Escalabilidad** para su reutilización en distintos ciclos lectivos.

---

# 📖 Documentación

La documentación del proyecto se encuentra organizada dentro del repositorio.

Se recomienda comenzar por:

* 📁 [`Documentación/`](Documentación/)
* 📁 [`Software/PAT/`](Software/PAT/)
* 📄 [`README.md`](README.md)

---

# 👤 Autor

**Folino Inc**

**PIAT21 — Escuela Técnica Nº 21 DE 10**

---

## 📌 Estado del proyecto

**Versión:** 1.0
**Fecha:** 15/12/2025
**Plataforma:** Google Workspace
**Repositorio:** [PabloFolino/PIAT21](https://github.com/PabloFolino/PIAT21)

---

> **PIAT21** integra organización institucional y automatización tecnológica para facilitar el acompañamiento y seguimiento de las trayectorias educativas.
