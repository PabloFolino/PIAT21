\# PIAT21 — Sistema de Acompañamiento de Trayectorias



\## Descripción



\*\*PIAT21\*\* es un sistema desarrollado para apoyar la implementación y gestión del \*\*Proyecto Institucional de Acompañamiento de Trayectorias (PIAT)\*\* de la Escuela Técnica Nº 21 DE 10.



El sistema tiene como objetivo organizar y automatizar la asignación de \*\*docentes tutores a estudiantes\*\*, teniendo en cuenta el año de cursada, el ciclo y la especialidad, y permitiendo realizar un seguimiento centralizado de las trayectorias educativas.



La solución está desarrollada utilizando herramientas de \*\*Google Workspace\*\*, principalmente \*\*Google Forms, Google Sheets, Google Drive y Google Apps Script\*\*, integradas en un flujo automatizado.



\## ¿Qué permite hacer?



El sistema permite:



\* Registrar estudiantes mediante un formulario institucional.

\* Centralizar la información en una planilla de gestión.

\* Configurar docentes tutores y los ciclos/especialidades que pueden atender.

\* Establecer cupos máximos de estudiantes por docente.

\* Asignar automáticamente un docente tutor según las reglas definidas.

\* Generar y organizar automáticamente la documentación individual de cada estudiante.

\* Administrar los permisos de acceso a la información.

\* Registrar las asignaciones realizadas y las posibles incidencias.

\* Proporcionar a los equipos directivos información actualizada para el seguimiento y supervisión.



\## Flujo general



El funcionamiento del sistema se basa en un proceso automatizado:



```text

ESTUDIANTE

&#x20;   │

&#x20;   ▼

GOOGLE FORM

&#x20;   │

&#x20;   ▼

REGISTRO EN GOOGLE SHEETS

&#x20;   │

&#x20;   ▼

APPS SCRIPT

&#x20;   │

&#x20;   ├──► Identificación de año y especialidad

&#x20;   │

&#x20;   ├──► Filtrado de docentes habilitados

&#x20;   │

&#x20;   ├──► Verificación de cupos

&#x20;   │

&#x20;   └──► Asignación del docente tutor

&#x20;            │

&#x20;            ▼

&#x20;      GOOGLE DRIVE

&#x20;            │

&#x20;            ├──► Carpeta del estudiante

&#x20;            └──► Archivo individual

&#x20;            │

&#x20;            ▼

&#x20;      CONTROL DE PERMISOS

&#x20;            │

&#x20;            ▼

&#x20;      DASHBOARD DIRECTIVO

```



El proceso se inicia cuando el estudiante completa el formulario. El evento `onFormSubmit` activa el procesamiento automático: se analiza el año y la especialidad, se determinan los docentes que cumplen las condiciones, se verifican sus cupos disponibles y se realiza la asignación correspondiente.



\## Componentes del sistema



La arquitectura actual está compuesta por los siguientes elementos:



| Componente               | Función                                                    |

| ------------------------ | ---------------------------------------------------------- |

| \*\*Google Form\*\*          | Registro de información de los estudiantes                 |

| \*\*Google Sheets\*\*        | Configuración, registro de estudiantes, docentes y errores |

| \*\*Google Drive\*\*         | Almacenamiento y organización de la documentación          |

| \*\*Apps Script\*\*          | Motor de automatización y asignación                       |

| \*\*Dashboard Web\*\*        | Visualización de información para los equipos directivos   |

| \*\*Plantilla individual\*\* | Base para la documentación de cada estudiante              |



La información central se administra mediante el archivo \*\*`Seleccion\_PAT`\*\*, que contiene las configuraciones generales, los docentes disponibles, las asignaciones de estudiantes y el registro de incidencias.



\## Organización de la información



La documentación generada se organiza en Google Drive mediante una estructura basada en la inicial del apellido del estudiante:



```text

PAT/

├── A/

│   ├── Apellido\_Nombre\_123

│   └── Apellido\_Nombre\_456

├── B/

├── C/

├── ...

└── Z/

```



Cada estudiante dispone de un archivo individual, identificado mediante su apellido, nombre y los últimos tres dígitos de su DNI.



\## Asignación de docentes



La asignación se realiza considerando:



\* Año que cursa el estudiante.

\* Ciclo correspondiente.

\* Especialidad.

\* Docentes habilitados para cada ciclo/especialidad.

\* Cupo disponible de cada docente.



El sistema contempla la posibilidad de definir un cupo general y, opcionalmente, un cupo específico para cada docente. Cuando existen varios docentes que cumplen las condiciones, el sistema selecciona aquel que presenta menor carga asignada.



\## Gestión y seguimiento



El sistema mantiene un registro centralizado de las asignaciones realizadas, incluyendo información del estudiante, docente asignado y enlaces a la documentación correspondiente.



También dispone de un registro de errores o incidencias para identificar situaciones en las que, por ejemplo, no exista un docente disponible o no haya cupo suficiente.



El \*\*dashboard para directivos\*\* permite consultar en tiempo real información como:



\* Docentes.

\* Ciclos que atiende cada docente.

\* Cantidad de estudiantes asignados.

\* Cupo máximo.

\* Cupos disponibles.



El acceso al dashboard está planteado en modalidad de \*\*solo lectura\*\*, facilitando las tareas de supervisión y seguimiento.



\## Gestión de permisos



El sistema contempla diferentes niveles de acceso según el rol:



\* \*\*Docente asignado:\*\* edición del archivo del estudiante.

\* \*\*Otros docentes:\*\* acceso de lectura.

\* \*\*Directivos:\*\* acceso de gestión según corresponda.

\* \*\*Estudiantes:\*\* sin acceso directo al archivo administrativo.



De esta manera, se busca mantener organizada la información y limitar la edición de los registros a los usuarios correspondientes.



\## Automatización



Uno de los principales componentes del proyecto es \*\*Google Apps Script\*\*, que funciona como núcleo de automatización.



Entre sus responsabilidades se encuentran:



1\. Leer la configuración del sistema.

2\. Procesar la información recibida desde el formulario.

3\. Determinar los docentes compatibles.

4\. Verificar los cupos disponibles.

5\. Seleccionar el docente correspondiente.

6\. Crear las carpetas necesarias en Drive.

7\. Copiar la plantilla individual.

8\. Completar automáticamente la información.

9\. Aplicar los permisos correspondientes.

10\. Registrar la asignación.

11\. Registrar posibles errores.

12\. Actualizar la información utilizada por el dashboard.



\## Estructura del repositorio



El repositorio se organiza, entre otros elementos, en las siguientes áreas:



```text

PIAT21/

├── Documentación/

├── Software/

│   └── PAT/

└── README.md

```



La carpeta \*\*Documentación\*\* concentra los materiales documentales del proyecto, mientras que \*\*Software/PAT\*\* contiene los componentes correspondientes a la implementación del sistema.



\## Características principales



En conjunto, PIAT21 busca proporcionar una herramienta:



\* \*\*Centralizada\*\*, al concentrar la información en un sistema común.

\* \*\*Automatizada\*\*, reduciendo tareas administrativas repetitivas.

\* \*\*Configurable\*\*, permitiendo modificar docentes, ciclos y cupos.

\* \*\*Trazable\*\*, mediante el registro de asignaciones e incidencias.

\* \*\*Escalable\*\*, permitiendo reutilizar la estructura en nuevos ciclos lectivos.

\* \*\*Orientada al seguimiento\*\*, facilitando a los equipos directivos la supervisión de las trayectorias.



\## Estado del proyecto



PIAT21 se encuentra organizado como un proyecto compuesto por documentación y software, con una implementación basada en servicios de Google Workspace. El diseño contempla la posibilidad de adaptar la configuración del sistema año a año sin modificar necesariamente su estructura general.



