/* =========================================    ALUMNOS   ============================================ */

/*****************************************************
 * FICHA ALUMNOS
 * lo llama ficha_alumno.html
 *****************************************************/
function guardarFichaAlumno(data) {

  // =========================
  // VALIDACIONES OBLIGATORIAS
  // =========================
  const obligatorios = [
    { campo: data.apellido, msg: "Falta el apellido del alumno" },
    { campo: data.nombre, msg: "Falta el nombre del alumno" },
    { campo: data.dni, msg: "Falta el DNI del alumno" },
    { campo: data.email, msg: "Falta el email institucional" },
    { campo: data.anio, msg: "Falta el año que cursa" },
    { campo: data.div, msg: "Falta la división que cursa" },
    { campo: data.especialidad, msg: "Falta la especialidad" },
    { campo: data.turno, msg: "Falta el turno (TD o TN)" },
    { campo: data.tutor1Nombre, msg: "Falta el nombre del tutor 1" },
    { campo: data.tutor1Apellido, msg: "Falta el apellido del tutor 1" },
    { campo: data.tutor1Tel, msg: "Falta el teléfono del tutor 1" },
    { campo: data.tutor1Email, msg: "Falta el email del tutor 1" }
  ];

  for (const o of obligatorios) {
    if (!o.campo || String(o.campo).trim() === "") {
      return { ok: false, mensaje: o.msg };
    }
  }

  // =========================
  // VALIDAR TURNO
  // =========================
  if (!["TD", "TN"].includes(data.turno)) {
    return {
      ok: false,
      mensaje: "Turno inválido. Debe ser TD o TN"
    };
  }

  // =========================
  // VALIDAR AÑO
  // =========================
  const aniosValidos = ["1","2","3","4","5","6"];
  if (!aniosValidos.includes(String(data.anio))) {
    return { ok: false, mensaje: "Año inválido" };
  }

  // =========================
  // VALIDAR DIVISION
  // =========================
  const divValidas = ["1","2","3","4","5","6","7"];
  if (!divValidas.includes(String(data.div))) {
    return { ok: false, mensaje: "Division inválida " };
  }


  // =========================
  // VALIDAR ESPECIALIDAD
  // =========================
  if (!["CB", "CSC", "CSM"].includes(data.especialidad)) {
    return { ok: false, mensaje: "Especialidad inválida" };
  }

  // =========================
  // VALIDAR AÑO ↔ CICLO
  // =========================
  const anio = Number(data.anio);
  const especialidad = data.especialidad;

  // 1°, 2° o 3° → SOLO CB
  if (anio >= 1 && anio <= 3 && especialidad !== "CB") {
    return {
      ok: false,
      mensaje: "El alumno eligió mal el ciclo o el año"
    };
  }

  // 4°, 5° o 6° → SOLO CSC o CSM
  if (anio >= 4 && anio <= 6 && !["CSC", "CSM"].includes(especialidad)) {
    return {
      ok: false,
      mensaje: "El alumno eligió mal el ciclo o el año"
    };
  }

  // =========================
  // VALIDAR EMAIL INSTITUCIONAL
  // =========================
  const re = /^[a-z]+\.[a-z]+\.et21\.\d{2}@gmail\.com$/i;
  if (!re.test(data.email)) {
    return { ok: false, mensaje: "Email institucional inválido" };
  }

  // =========================
  // EVITAR DUPLICADOS
  // =========================
  const hoja = SpreadsheetApp.getActive()
    .getSheetByName("Respuesta del Formulario");

  const datos = hoja.getDataRange().getValues();
  const encabezados = datos[0];

  const colDni = encabezados.indexOf("DNI");
  const colEmail = encabezados.indexOf("Email");

  const dniNuevo = String(data.dni).trim();
  const emailNuevo = String(data.email).trim().toLowerCase();
  
  // Recorremos desde la fila 2
  for (let i = 1; i < datos.length; i++) {
    const dniExistente = String(datos[i][colDni]).trim();
    const emailExistente = String(datos[i][colEmail]).trim().toLowerCase();

    if (dniExistente === dniNuevo || emailExistente === emailNuevo) {
      return {
        ok: false,
        mensaje: "El alumno ya se encuentra inscripto"
      };
    }
  }
  
  // =========================
  // GUARDAR FICHA
  // =========================
  try {
    // Abrimos la hoja de cálculo donde se guardan los alumnos
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName("Fichas_Alumnos");

    // Se usa para saber el alumno actual en selecion_docente.html
    // y en la funcion obtenerDatosAlumnoActual()
    PropertiesService.getUserProperties()
      .setProperty("ALUMNO_ACTUAL_DNI", data.dni);

    hoja.appendRow([
      new Date(),              // A Fecha
      data.apellido,
      data.nombre,
      data.dni,
      data.nacionalidad,
      data.fechaNacimiento,
      data.email,
      data.emailALU,
      data.distrito,
      data.municipio,
      data.calle,
      data.cp,
      data.tutor1Nombre,
      data.tutor1Apellido,
      data.tutor1Tel,
      data.tutor1Email,
      data.tutor2Nombre,
      data.tutor2Apellido,
      data.tutor2Tel,
      data.tutor2Email,
      data.fichaSalud,
      data.anio,
      data.div,
      data.turno,
      data.especialidad
    ]);

    return {
      ok: true,
      page: "seleccion_docente",
      mensaje: "Ficha guardada correctamente. Continuá con la selección de docente." };
  } catch (error) {
    // Si algo falla, devolvemos un objeto con el error
    return { ok: false, mensaje: "Error al guardar la ficha: " + error.message };
  }

}

/*********************************************************
  * Busca todos los datos de un alumno
  * 
 *********************************************************/
function getDatAlumnoActualFull() {
  const dni = PropertiesService.getUserProperties()
    .getProperty("ALUMNO_ACTUAL_DNI");

  if (!dni) {
    // No hay alumno activo → retornar objeto seguro
    return { anio: "", turno: "", especialidad: "" };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Fichas_Alumnos");

  if (!sheet) {
    throw new Error("No existe la hoja Fichas_Alumnos");
  }

  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  const idx = h => headers.indexOf(h);

  const fila = data.find(r => String(r[idx("DNI")]) === String(dni));

  if (!fila) {
    throw new Error("Alumno no encontrado en Fichas_Alumnos");
  }

  Logger.log("IN datos.apellido:"+  fila[idx("Apellido del Estudiante")]);

  const data_full={
    apellido: fila[idx("Apellido del Estudiante")],
    nombre: fila[idx("Nombre del Estudiante")],
    dni: fila[idx("DNI")],
    nacionalidad: fila[idx("Nacionalidad")],
    fechaNacimiento: fila[idx("Fecha Nacimiento")],
    email: fila[idx("Email Address")],
    emailALU: fila[idx("Email ALU")],
    distrito: fila[idx("Distrito")],
    municipio: fila[idx("Municipio")],
    calle: fila[idx("Calle")],
    cp: fila[idx("CP")],
    tutor1Nombre: fila[idx("Tutor1Nombre")],
    tutor1Apellido: fila[idx("Tutor1Apellido")],
    tutor1Tel: fila[idx("Tutor1Telefono")],
    tutor1Email: fila[idx("Tutor1Email")],
    tutor2Nombre: fila[idx("Tutor2Nombre")],
    tutor2Apellido: fila[idx("Tutor2Apellido")],
    tutor2Tel: fila[idx("Tutor2Telefono")],
    tutor2Email: fila[idx("Tutor2Email")],
    fichaSalud: fila[idx("Ficha Salud")],
    anio: fila[idx("Año")],
    div: fila[idx("División")],
    turno: fila[idx("Turno")],
    especialidad: fila[idx("Especialidad")]
  }
  Logger.log("IN full:"+  data_full);
  // 🔹 Objeto EXACTO para el HTML
  return data_full;
   
}

/*********************************************************
 * Busca anio, turno y especialidad 
 * Es llamada por seleccion_docente.html
 * Y busca el alumno actual en la solapa "Ficha_Alumno" 
 * del archivo Seleccion_PAT
 *********************************************************/
function obtenerDatosAlumnoActualAnioTurnoEsp() {
  const dni = PropertiesService.getUserProperties()
    .getProperty("ALUMNO_ACTUAL_DNI");

  if (!dni) {
    // No hay alumno activo → retornar objeto seguro
    return { anio: "", turno: "", especialidad: "" };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Fichas_Alumnos");

  if (!sheet) {
    throw new Error("No existe la hoja Fichas_Alumnos");
  }

  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  const idx = h => headers.indexOf(h);

  const fila = data.find(r => String(r[idx("DNI")]) === String(dni));

  if (!fila) {
    throw new Error("Alumno no encontrado en Fichas_Alumnos");
  }

  const data_aux={
    apellido: fila[idx("Apellido del Estudiante")],
    nombre: fila[idx("Nombre del Estudiante")],
    dni: fila[idx("DNI")],
    anio: fila[idx("Año")],
    turno: fila[idx("Turno")],
    especialidad: fila[idx("Especialidad")]
  }
  // 🔹 Objeto EXACTO para el HTML
  return  data_aux;
   
}

/*****************************************************
 * SETEO ALUMNO ACTIVO
 * Esta funcion lo llama la pagina ficha_alumno.html
 *****************************************************/
function setAlumnoActivo(dni) {
  PropertiesService.getUserProperties()
    .setProperty("ALUMNO_ACTUAL_DNI", String(dni));

  if (!  PropertiesService.getUserProperties().getProperty("ALUMNO_ACTUAL_DNI")) { 
    /* No se guaredo el dni */
    return false;
   } else {
    /* Se guardo el dni*/
    return true;
  }
}

/*****************************************************
 * PREGUNTA SI EL ALUMNO EXISTE
 *****************************************************/
function alumnoExiste(email, dni) {

  const re = /^[a-z]+\.[a-z]+\.et21\.\d{2}@gmail\.com$/i;
  if (!re.test(email)) {
    throw new Error("Email institucional inválido");
  }

  const sh = SpreadsheetApp.getActive()
      .getSheetByName("Respuesta del Formulario");

  if (sh.getLastRow() < 2) return false;

  const data = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn())
                 .getValues();

  const COL_EMAIL = 7; // G
  const COL_DNI   = 4; // D

  return data.some(r =>
    String(r[COL_EMAIL - 1]).trim().toLowerCase() === email.trim().toLowerCase() ||
    String(r[COL_DNI - 1]).trim() === String(dni).trim()
  );
}

/*****************************************************
 * CREA EL LEGAJO 
 *****************************************************/
function crearLegajoAlumno(data) {
  
  const drive = DriveApp;

  const idPlantilla = getConfig("ID_PLANTILLA Nombre_Apellido_xxx");
  const idCarpetaAlumnos = getConfig("ID_Directorio_Alumnos");

  if (!idPlantilla || !idCarpetaAlumnos) {
    throw new Error("Config incompleta: ID de plantilla o carpeta alumnos");
  }

  const letra = data.apellido.charAt(0).toUpperCase();
  const carpetaAlumnos = drive.getFolderById(idCarpetaAlumnos);

  let carpetaLetra;
  const carpetas = carpetaAlumnos.getFoldersByName(letra);
  carpetaLetra = carpetas.hasNext()
    ? carpetas.next()
    : carpetaAlumnos.createFolder(letra);

  const ultimos3 = data.dni.slice(-3);
  const nombreArchivo = `${data.apellido}_${data.nombre}_${ultimos3}`;

  
  // 🔎 VERIFICAR SI YA EXISTE
  const archivos = carpetaLetra.getFilesByName(nombreArchivo);
  if (archivos.hasNext()) {
    const existente = archivos.next();

    return {
      creado: false,
      mensaje: "El archivo ya existe",
      file: existente,
      urlArchivo: existente.getUrl(),
      urlCarpeta: carpetaLetra.getUrl()
    };
  }

  const plantilla = drive.getFileById(idPlantilla);
  const copia = plantilla.makeCopy(nombreArchivo, carpetaLetra);

  return {
    creado: true,
    mensaje: "Archivo creado correctamente",
    file: copia,
    urlArchivo: copia.getUrl(),
    urlCarpeta: carpetaLetra.getUrl()
  };
}

/*****************************************************
 * COMPLETAR LEGAJO escribe en DATOS GENERALES
 *****************************************************/
function completarLegajo(fileId, data) {

  const ss = SpreadsheetApp.openById(fileId);

  // Datos Generales
  const sh = ss.getSheetByName("Datos Generales");

  if (!sh) throw new Error("No existe la solapa 'Datos Generales'");

  const valores = [
    data.apellido,
    data.nombre,
    data.dni,
    data.nacionalidad,
    data.fechaNacimiento,
    data.email,
    data.emailALU,
    data.distrito,
    data.municipio,
    data.calle,
    data.cp,
    data.tutor1Nombre,
    data.tutor1Apellido,
    data.tutor1Tel,
    data.tutor1Email,
    data.tutor2Nombre,
    data.tutor2Apellido,
    data.tutor2Tel,
    data.tutor2Email,
    data.fichaSalud,
    data.anio,
    data.div,
    data.turno,
    data.especialidad,
    data.nombre_docente
  ];

  sh.getRange(2, 2, valores.length, 1).setValues(valores.map(v => [v]));

  // ================================
  // DOCENTE EN HOJA 2026
  // ================================
  const sh2026 = ss.getSheets()
    .find(s => s.getName().trim() === "2026");

  if (!sh2026) {
    throw new Error("No existe la hoja 2026 en el legajo");
  }

  sh2026.getRange("B1").setValue(data.nombre_docente);
}

/*****************************************************
 * REGISTRAR INSCRIPCIÓN escribe en RESPUESTA FORMULARIO
 *****************************************************/
function registrarInscripcion(data) {

  const sh = SpreadsheetApp.getActive()
    .getSheetByName("Respuesta del Formulario");

  sh.appendRow([
    new Date(),
    data.apellido,
    data.nombre,
    data.dni,
    data.nacionalidad,
    data.fechaNacimiento,
    data.email,
    data.emailALU,
    data.distrito,
    data.municipio,
    data.calle,
    data.cp,
    data.tutor1Nombre,
    data.tutor1Apellido,
    data.tutor1Tel,
    data.tutor1Email,
    data.tutor2Nombre,
    data.tutor2Apellido,
    data.tutor2Tel,
    data.tutor2Email,
    data.fichaSalud,
    data.anio,
    data.div,
    data.turno,
    data.especialidad,
    data.nombre_docente,
    data.urlArchivo,
    data.urlCarpeta
  ]);
}

/*****************************************************
 * BUSCA UNA ALUMNO en la solapa "Fichas_Alumnos" 
 * y elimina la fila 
 *****************************************************/
function eliminarFichaAlumno(dni) {
  if (!dni) throw new Error("Debe indicar un DNI");

  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName("Fichas_Alumnos");

  if (!sh) {
    throw new Error('No existe la solapa "Fichas_Alumos"');
  }

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return 0; // no hay datos

  const data = sh.getRange(2, 1, lastRow - 1, sh.getLastColumn()).getValues();

  // Buscar índice de la columna DNI
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const idxDni = headers.indexOf("DNI");

  if (idxDni === -1) {
    throw new Error('No existe la columna "DNI"');
  }

  // Filas a borrar (desde abajo hacia arriba)
  const filasABorrar = [];

  data.forEach((fila, i) => {
    if (String(fila[idxDni]) === String(dni)) {
      filasABorrar.push(i + 2); // +2 porque empieza en fila 2
    }
  });

  // Borrar de abajo hacia arriba
  filasABorrar.reverse().forEach(fila => {
    sh.deleteRow(fila);
  });

  return filasABorrar.length; // cantidad de filas eliminadas
}

/*****************************************************
 * BUSCA UNA ALUMNO en la solapa "Fichas_Alumnos" 
 * y me informa si existe
 *****************************************************/
function existeAlumnoFicha(dni) {
  if (!dni) return false;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Fichas_Alumnos");

  if (!sheet) {
    throw new Error('No existe la hoja "Fichas_Alumnos"');
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return false; // solo encabezados

  const headers = data.shift();
  const idxDni = headers.indexOf("DNI");

  if (idxDni === -1) {
    throw new Error('No existe la columna "DNI"');
  }

  const dniStr = String(dni).trim();

  return data.some(row => String(row[idxDni]).trim() === dniStr);
}

/*****************************************************
 * BUSCA UN ALUMNO llamada por el archivo docente.html
 * Devuelve;         
 *          apellido,nombre,anio,div,turno,
 *          url del legajo,permiso,docente PAT
 *****************************************************/
function buscarAlumnos(modo, apellido, anio, turno, especialidad) {

  const sh = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Respuesta del Formulario");

  if (!sh) {
    throw new Error("No existe la hoja Respuesta del Formulario");
  }

  const data = sh.getDataRange().getValues();
  const headers = data.shift();

  const idx = {
    apellido: headers.indexOf("Apellido del Estudiante"),
    nombre: headers.indexOf("Nombre del Estudiante"),
    especialidad: headers.indexOf("Especialidad"),
    anio: headers.indexOf("Año"),
    div: headers.indexOf("División"),
    turno: headers.indexOf("Turno"),
    url: headers.indexOf("URL Archivo"),
    docente: headers.indexOf("Nombre Docente")
  };

  // Validar columnas
  Object.entries(idx).forEach(([key, value]) => {
    if (value === -1) {
      throw new Error("No se encontró la columna: " + key);
    }
  });

  const emailDocente = Session.getActiveUser().getEmail();

  return data
    .filter(r => {

      if (turno && r[idx.turno] !== turno) return false;
      if (especialidad && r[idx.especialidad] !== especialidad) return false;

      if (modo === "apellido" && apellido) {
        if (!r[idx.apellido]
              .toString()
              .toLowerCase()
              .includes(apellido.toLowerCase())) {
          return false;
        }
      }

      if (modo === "anio" && anio) {
        if (String(r[idx.anio]) !== String(anio)) {
          return false;
        }
      }

      return true;
    })
    .map(r => {

      const docenteAsignado = r[idx.docente];
      const emailAsignado = obtenerEmailDocente(docenteAsignado);

      const permiso =
        emailAsignado && emailAsignado === emailDocente
          ? "EDIT"
          : "VIEW";

      return {
        apellido: r[idx.apellido],
        nombre: r[idx.nombre],
        anio: r[idx.anio],
        div: r[idx.div],
        turno: r[idx.turno],
        url: r[idx.url],
        permiso: permiso,
        docente: docenteAsignado
      };
    });
}


/*****************************************************
 * BUSCA UN ALUMNO llamada por el archivo directivo.html
 * Devuelve;         
 *          apellido,nombre,anio,div,turno,
 *          especialidad,docente PAT
 *****************************************************/
function buscarAlumnos2(apellido, turno) {
  const ss = SpreadsheetApp.getActive();
  const hoja = ss.getSheetByName("Respuesta del Formulario");
  const datos = hoja.getDataRange().getValues();
  const headers = datos.shift();

  const col = indexByName(headers);

  return datos
    .filter(r =>
      r[col["Apellido del Estudiante"]].toLowerCase().includes(apellido.toLowerCase()) &&
      (turno === "" || r[col["Turno"]] === turno)
    )
    .map(r => ({
      Apellido: r[col["Apellido del Estudiante"]],
      Nombre: r[col["Nombre del Estudiante"]],
      DNI: r[col["DNI"]],
      Anio: r[col["Año"]],
      Division: r[col["División"]],
      Turno: r[col["Turno"]],
      Especialidad: r[col["Especialidad"]],
      Docente: r[col["Nombre Docente"]]
    }));
}

/*****************************************************
 * ELIMINA UN ALUMNO llamada por el archivo directivo.html
 * Devuelve;         
 *          apellido,nombre,anio,div,turno,
 *          especialidad,docente PAT
 *****************************************************/
function eliminarAlumno(dni) {

  const ss = SpreadsheetApp.getActive();
  const hojaRespuestas = ss.getSheetByName("Respuesta del Formulario");
  const hojaDocentes = ss.getSheetByName("Docentes");
  const hojaConfig = ss.getSheetByName("Config");

  if (!hojaRespuestas) throw new Error("No existe la hoja 'Respuesta del Formulario'");
  if (!hojaDocentes) throw new Error("No existe la hoja 'Docentes'");
  if (!hojaConfig) throw new Error("No existe la hoja 'Config'");

  const datos = hojaRespuestas.getDataRange().getValues();
  const headers = datos.shift();

  const col = {};
  headers.forEach((h, i) => col[h] = i);

  const colDNI = col["DNI"];
  const colDocente = col["Nombre Docente"];
  const colTurno = col["Turno"];
  const colFileId = col["URL Archivo"]; // ← debe existir esta columna

  if (colDNI === undefined) throw new Error("No se encontró columna DNI");

  let filaIndex = -1;
  let docenteNombre = "";
  let turnoAlumno = "";
  let fileId = "";

  for (let i = 0; i < datos.length; i++) {
    if (String(datos[i][colDNI]) === String(dni)) {
      filaIndex = i + 2; // +2 por encabezado y base 1
      docenteNombre = datos[i][colDocente];
      turnoAlumno = datos[i][colTurno];
      fileId = extraerId(datos[i][colFileId]);
      break;
    }
  }

  if (filaIndex === -1) {
    throw new Error("Alumno no encontrado.");
  }

  // ================================
  // 1️⃣ MOVER ARCHIVO A BAJAS
  // ================================

  const configData = hojaConfig.getDataRange().getValues();
  let idCarpetaBajas = null;

  for (let i = 0; i < configData.length; i++) {
    if (configData[i][0] === "ID_Bajas") {
      idCarpetaBajas = configData[i][1];
      break;
    }
  }

  if (!idCarpetaBajas) throw new Error("No se encontró ID_CARPETA_BAJAS en Config");

  if (fileId) {

    const archivo = DriveApp.getFileById(fileId);
    const carpetaDestino = DriveApp.getFolderById(idCarpetaBajas);

    // mover
    carpetaDestino.addFile(archivo);

    const padres = archivo.getParents();
    while (padres.hasNext()) {
      const padre = padres.next();
      padre.removeFile(archivo);
    }

    // quitar permisos de edición
    const editors = archivo.getEditors();
    editors.forEach(ed => archivo.removeEditor(ed));
  }

  // ================================
  // 2️⃣ RESTAR ALUMNO EN DOCENTES
  // ================================

  const datosDoc = hojaDocentes.getDataRange().getValues();
  const headersDoc = datosDoc.shift();

  const colDoc = {};
  headersDoc.forEach((h, i) => colDoc[h] = i);

  const colNombreDoc = colDoc["Apellido y Nombre"];
  const colTurnoDoc = colDoc["Turno"];
  const colAsignados = colDoc["Alumnos asignados"];

  for (let i = 0; i < datosDoc.length; i++) {

    if (
      datosDoc[i][colNombreDoc] === docenteNombre &&
      datosDoc[i][colTurnoDoc] === turnoAlumno
    ) {

      let actuales = Number(datosDoc[i][colAsignados]) || 0;

      if (actuales > 0) {
        hojaDocentes.getRange(i + 2, colAsignados + 1)
          .setValue(actuales - 1);
      }

      break;
    }
  }

  // ================================
  // 3️⃣ ELIMINAR FILA DEL ALUMNO
  // ================================

  hojaRespuestas.deleteRow(filaIndex);

  return "Alumno eliminado correctamente.";
}

/*****************************************************
 * ABRIR LEGAJO llamada por el archivo docente.html
 *****************************************************/
function abrirLegajoAlumno(urlArchivo) {
  const emailDocente = Session.getActiveUser().getEmail();

  const ss = SpreadsheetApp.openByUrl(urlArchivo);
  const alumnoDocente = obtenerDocenteAsignadoPorURL(urlArchivo);
  const emailAsignado = obtenerEmailDocente(alumnoDocente);

  if (emailAsignado && emailAsignado === emailDocente) {
    ss.addEditor(emailDocente);
  } else {
    ss.addViewer(emailDocente);
  }

  return ss.getUrl();
}

/*****************************************************
 * OBTENER DOCENTE llamada por el archivo docente.html
 *****************************************************/
function obtenerDocenteAsignadoPorURL(url) {
  const ss = SpreadsheetApp.openById(getConfig("ID_Seleccion_PAT"));
  const sh = ss.getSheetByName("Respuesta del Formulario");

  const data = sh.getDataRange().getValues();
  const headers = data.shift();

  const idxUrl = headers.indexOf("URL Archivo");
  const idxDoc = headers.indexOf("Nombre Docente");

  const row = data.find(r => r[idxUrl] === url);
  return row ? row[idxDoc] : null;
}

/*****************************************************
 * OBTENER DOCENTE llamada por el archivo docente.html
 *****************************************************/
function obtenerEmailDocente(nombreDocente) {
  if (!nombreDocente) return null;

  const ss = SpreadsheetApp.openById(getConfig("ID_Seleccion_PAT"));
  const sh = ss.getSheetByName("Docentes");

  const data = sh.getDataRange().getValues();
  data.shift();

  const fila = data.find(r => r[0] === nombreDocente);
  return fila ? fila[1] : null;
}

/*****************************************************
 * ENVIAR LISTADO A DOCENTE DE ALUMNOS
 *  llamada por el archivo directivo.html
 *****************************************************/
function enviarListadoAlumnos(emailDestino, nombreDocente, alumnos) {

  if (!emailDestino || !nombreDocente || !alumnos || alumnos.length === 0) {
    throw new Error("Datos incompletos para enviar email.");
  }

  let cuerpo = `Estos son los alumnos que tiene al docente ${nombreDocente} como Profesor Ayudante de las Trayectorias:\n\n`;

  alumnos.forEach(a => {
    cuerpo += `- ${a.apellido}, ${a.nombre} | Año: ${a.anio} | División: ${a.division} | Turno: ${a.turno} | Especialidad: ${a.especialidad}\n`;
  });

  const asunto = `Listado de alumnos PAT - ${nombreDocente}`;

  GmailApp.sendEmail(emailDestino, asunto, cuerpo);

  return true;
}


/*****************************************************
 * ENVIAR LISTADO A TODOS LOS DOCENTE DE ALUMNOS
 *  llamada por el archivo admin.html
 *****************************************************/
function enviarListadoATodosLosDocentes() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shDocentes = ss.getSheetByName("Docentes");

  if (!shDocentes) {
    throw new Error("No existe la hoja Docentes");
  }

  const datos = shDocentes.getDataRange().getValues();
  const encabezados = datos.shift();

  const colNombre = encabezados.indexOf("Apellido y Nombre");
  const colEmail = encabezados.indexOf("Email");

  if (colNombre === -1 || colEmail === -1) {
    throw new Error("Faltan columnas Nombre Completo o Email en Docentes");
  }

  let totalDocentes = 0;
  let enviados = 0;
  let sinAlumnos = 0;

  datos.forEach(fila => {

    const nombreDocente = fila[colNombre];
    const email = fila[colEmail];

    if (!nombreDocente || !email) return;

    totalDocentes++;

    // 🔁 reutilizamos tu función existente
    const alumnos = getAlumnosDeDocente(nombreDocente);

    if (!alumnos || alumnos.length === 0) {
      sinAlumnos++;
      return;
    }

    // 🔁 reutilizamos tu función de envío
    enviarListadoAlumnos(email, nombreDocente, alumnos);

    enviados++;

  });

  return {
    totalDocentes,
    enviados,
    sinAlumnos
  };
}

/* =========================================    DOCENTES   ============================================ */

/*****************************************************
 * DOCENTES DISPONIBLES  A EVALUAR
 *****************************************************/
function actualizarContadorDocente(nombreDocente,turnoDocente) {        /* Hay que agregar el turno**************** */
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName("Docentes");
  if (!sh) throw new Error("No existe la hoja Docentes");

  const data = sh.getDataRange().getValues();
  const headers = data[0];

  const colNombre     = headers.indexOf("Apellido y Nombre");
  const colAsignados  = headers.indexOf("Alumnos asignados");
  const colVacantes   = headers.indexOf("Vacantes Disponibles");
  const colTurno   = headers.indexOf("Turno");

  if (colNombre === -1 || colAsignados === -1 || colVacantes === -1|| colTurno === -1) {
    throw new Error("Faltan columnas en Docentes");
  }

  for (let i = 1; i < data.length; i++) {

    const nombre = data[i][colNombre];
    const turnoFila=data[i][colTurno];

    const coincideNombre =
      String(nombreFila).trim().toLowerCase() ===
      String(nombreDocente).trim().toLowerCase();

    const coincideTurno =
      String(turnoFila).trim().toLowerCase() ===
      String(turnoDocente).trim().toLowerCase();

    if (coincideNombre && coincideTurno) {

      const vacantes = Number(data[i][colVacantes]) || 0;

      if (vacantes <= 0) {
        throw new Error("El docente no tiene vacantes disponibles");
      }

      let asignados = Number(data[i][colAsignados]) || 0;
      asignados++;

      sh.getRange(i + 1, colAsignados + 1).setValue(asignados);

      SpreadsheetApp.flush(); // fuerza actualización

      return true;
    }
  }

  throw new Error("No se encontró el docente");
}
/*****************************************************
 * DOCENTES POR FILA
 *****************************************************/
function getDocenteRow(nombreDocente) {

  const sh = SpreadsheetApp.getActive()
    .getSheetByName("Docentes");

  const data = sh.getRange(2, 1, sh.getLastRow() - 1, 8).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === nombreDocente) {
      return {
        row: i + 2,
        nombre: data[i][0],
        email: data[i][1],
        ciclos: data[i][2],
        turno: data[i][3],
        maxAlumnos: data[i][6],
        asignados: data[i][7]
      };
    }
  }
  throw new Error("Docente no encontrado: " + nombreDocente);
}

/*****************************************************
 * SUMA +1 A UN DOCENTE
 *****************************************************/
function incrementarAsignados(row) {
  const sh = SpreadsheetApp.getActive()
    .getSheetByName("Docentes");

  const celda = sh.getRange(row, 8);
  celda.setValue(celda.getValue() + 1);
}

/*****************************************************
 * SETEO DOCENTE ACTIVO
 * Esta funcion lo llama la pagina seleccion_docente.html
 *****************************************************/
function setDocenteActivo(datDocente) {
  PropertiesService.getUserProperties()
    .setProperty("DOCENTE_ACTUAL_NOMBRE", String(datDocente.nombre));
  PropertiesService.getUserProperties()
    .setProperty("DOCENTE_ACTUAL_TURNO", String(datDocente.turno));

  if (!  PropertiesService.getUserProperties().getProperty("DOCENTE_ACTUAL_NOMBRE")) { 
    /* No se guardo el Nombre del Docente activo */
    return false;
   } else {
    /* Se guardo el Nombre del Docente activo*/
    return true;
  }


}

/*****************************************************
 * DOCENTES DISPONIBLES NEW
 *****************************************************/
function getDocentesDisponibles(turno, especialidad) {
  const ss = SpreadsheetApp.getActive()
  const sh = ss.getSheetByName("Docentes");

  if (!sh) {
    throw new Error("No existe la hoja Docentes en Seleccion_PAT");
  }

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  // Leer todo
  const data = sh.getRange(1, 1, lastRow, sh.getLastColumn()).getValues();

  const headers = data.shift();

  // Normalizar encabezados
  const headersNorm = headers.map(h =>
    String(h).trim().toLowerCase()
  );

  // Función para obtener índice por encabezado
  const idx = h => headersNorm.indexOf(h.toLowerCase());

  // Validar columnas obligatorias
  [
    "apellido y nombre",
    "turno",
    "vacantes disponibles",
    "ciclos"
  ].forEach(col => {
    if (idx(col) === -1) {
      throw new Error(`Falta la columna "${col}" en la hoja Docentes`);
    }
  });

  return data
    .filter(r => {
      const turnoDoc = String(r[idx("turno")]).trim();
      const ciclos = String(r[idx("ciclos")]).toLowerCase();
      const vacantes = Number(r[idx("vacantes disponibles")]);

      return (
        turnoDoc === turno &&
        ciclos.includes(especialidad.toLowerCase()) &&
        vacantes > 0
      );
    })
    .map(r => ({
      nombre: r[idx("apellido y nombre")],
      vacantes_disponibles: r[idx("vacantes disponibles")]
    }));
}

/*****************************************************
 * DOCENTES DISPONIBLES  esta funcion la usa                             1b)
 * getDocentesDisponiblesPorAlumno(dni) 
 *****************************************************/
function getDocentesDisponibles2(turno, especialidadEntrada) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shDocentes = ss.getSheetByName("Docentes");

  if (!shDocentes) throw new Error("No existe la hoja 'Docentes'.");

  const data = shDocentes.getDataRange().getValues();
  const headers = data[0];

  const colNombre = headers.indexOf("Apellido y Nombre");
  const colTurno = headers.indexOf("Turno");
  const colEspecialidad = headers.indexOf("Ciclos");
  const colVacantes = headers.indexOf("Vacantes Disponibles");

  if (colNombre === -1 || colTurno === -1 || colEspecialidad === -1 || colVacantes === -1) {
    throw new Error("Faltan columnas en la hoja Docentes.");
  }

  // ✅ Limpiar especialidades irrelevantes de la entrada
  const ignoradas = ["AA", "DD"];
  let especialidadesAlumno = especialidadEntrada
    .split(",")
    .map(e => e.trim())
    .filter(e => !ignoradas.includes(e));

  const resultado = [];

  for (let i = 1; i < data.length; i++) {

    const turnoDoc = data[i][colTurno];
    const especialidadesDoc = data[i][colEspecialidad]
      .split(",")
      .map(e => e.trim());
    const vacantes = Number(data[i][colVacantes]);

    // ✅ Ver si hay **al menos una coincidencia** entre entrada y docente
    const coincidencia = especialidadesAlumno.some(e => especialidadesDoc.includes(e));

    if (turnoDoc === turno && coincidencia && vacantes > 0) {
      resultado.push({
        nombre: data[i][colNombre],
        turno: turnoDoc,
        especialidad: data[i][colEspecialidad],
        vacantes: vacantes
      });
    }
  }

  return resultado;
}
/*****************************************************
 * DOCENTES DISPONIBLES  esta funcion la usa                             1a)
 * directivo_reasignarPAT.html
 *****************************************************/
function getDocentesDisponiblesPorAlumno(dni) {

  if (!dni) {
    throw new Error("DNI inválido.");
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shAlumnos = ss.getSheetByName("Respuesta del Formulario");

  if (!shAlumnos) {
    throw new Error("No existe la hoja 'Respuesta del Formulario'.");
  }

  const dataAlumnos = shAlumnos.getDataRange().getValues();
  const headersAlumnos = dataAlumnos[0];

  const colDni = headersAlumnos.indexOf("DNI");
  const colTurno = headersAlumnos.indexOf("Turno");
  const colEspecialidad = headersAlumnos.indexOf("Especialidad");

  if (colDni === -1 || colTurno === -1 || colEspecialidad === -1) {
    throw new Error("Columnas obligatorias no encontradas.");
  }

  let turnoAlumno = null;
  let especialidadAlumno = null;

  for (let i = 1; i < dataAlumnos.length; i++) {
    if (String(dataAlumnos[i][colDni]) === String(dni)) {
      turnoAlumno = dataAlumnos[i][colTurno];
      especialidadAlumno = dataAlumnos[i][colEspecialidad];
      break;
    }
  }

  if (!turnoAlumno || !especialidadAlumno) {
    throw new Error("No se encontró el alumno o sus datos están incompletos.");
  }

  // Ahora usamos tu función existente
  return getDocentesDisponibles2(turnoAlumno, especialidadAlumno);
}

/*****************************************************
 * GUARDAR SELECCIÓN DOCENTE
 *****************************************************/
function guardarSeleccionDocente(datDocente) {

  const email = Session.getEffectiveUser().getEmail();

  if (!email) {
    return { ok: false, mensaje: "Usuario no autenticado" };
  }

  // Bloqueo selección duplicada
  const estado = getEstadoSeleccionActual();
  if (estado.seleccionado) {
    return {
      ok: false,
      mensaje: "Ya tenés un docente asignado"
    };
  }

  setDocenteActivo(datDocente);
  
  // Acá más adelante llamás a submitInscripcion(...)
  return {
    ok: true,
    mensaje: "Docente seleccionado correctamente"
  };
}

/*****************************************************
 * BUSCA DOCENTE POR APELLIDO (SIN DUPLICADOS)
 *****************************************************/
function buscarDocentesPorApellido(apellidoBuscado) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("Docentes");

  if (!sh) throw new Error("No existe la hoja Docentes");

  const data = sh.getDataRange().getValues();
  const headers = data[0];

  const idxApellido = headers.indexOf("Apellido y Nombre");

  if (idxApellido === -1) {
    throw new Error("Columna 'Apellido y Nombre' no encontrada");
  }

  const docentesUnicos = new Set();

  for (let i = 1; i < data.length; i++) {

    const nombreCompleto = data[i][idxApellido];

    if (!nombreCompleto) continue;

    if (
      nombreCompleto
        .toString()
        .toLowerCase()
        .includes(apellidoBuscado.toLowerCase())
    ) {
      docentesUnicos.add(nombreCompleto.trim());
    }
  }

  // Convertimos el Set en array de objetos (formato que espera el frontend)
  return Array.from(docentesUnicos).map(nombre => ({
    nombreCompleto: nombre
  }));
}

/*****************************************************
 * BUSCA ALUMNO QUE SELECCIONO A UN DETERMINADO "DOCENTES"
 * Esta funcion lo llama la pagina seleccion_docente.html
 *****************************************************/
function getAlumnosDeDocente(nombreDocente) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("Respuesta del Formulario");

  if (!sh) throw new Error("No existe la hoja Respuesta del Formulario");

  const data = sh.getDataRange().getValues();
  const headers = data[0];

  const idxDocente = headers.indexOf("Nombre Docente");
  const idxNombre = headers.indexOf("Nombre del Estudiante");
  const idxApellido = headers.indexOf("Apellido del Estudiante");
  const idxAnio = headers.indexOf("Año");
  const idxDivision = headers.indexOf("División");
  const idxTurno = headers.indexOf("Turno");
  const idxEspecialidad = headers.indexOf("Especialidad");

  const alumnos = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][idxDocente] === nombreDocente) {
      alumnos.push({
        nombre: data[i][idxNombre],
        apellido: data[i][idxApellido],
        anio: data[i][idxAnio],
        division: data[i][idxDivision],
        turno: data[i][idxTurno],
        especialidad: data[i][idxEspecialidad]
      });
    }
  }

  return alumnos;
}


/* =========================================    PRINCIPAL   ============================================ */
/*****************************************************
 * FUNCIÓN PRINCIPAL
 *****************************************************/
function submitInscripcion() {

  let legajo = null;
  let cupoDescontado = false;
  let dat_new = null; 

  try {

    // Levanto datos del Alumno activo
    const dni = PropertiesService.getUserProperties()
    .getProperty("ALUMNO_ACTUAL_DNI");

    if (!dni) {
      // No hay alumno activo → retornar objeto seguro
      throw new Error("Falta DNI del Alumno ACTIVO");
    }
    // Levanto datos del nombre del Docente activo
    const nombreDoc = PropertiesService.getUserProperties()
    .getProperty("DOCENTE_ACTUAL_NOMBRE");

    if (!nombreDoc) {
      // No hay docente activo → retornar objeto seguro
      throw new Error("Falta nombre del Docente ACTIVO");
    }

    // Levanto datos del Turno del Docente activo
    const turnoDoc = PropertiesService.getUserProperties()
    .getProperty("DOCENTE_ACTUAL_TURNO");

    if (!turnoDoc) {
      // No hay docente activo → retornar objeto seguro
      throw new Error("Falta turno del Docente ACTIVO");
    }



    // Obtengo datos de la solapa ""Fichas_Alumnos"
    const dat_old=getDatAlumnoActualFull();

    // Copio datos dat_old -> dat_new
    dat_new = {
      apellido: dat_old.apellido,
      nombre: dat_old.nombre,
      dni: String(dat_old.dni),
      nacionalidad: dat_old.nacionalidad,
      fechaNacimiento: dat_old.fechaNacimiento,
      email: dat_old.email,
      emailALU: dat_old.emailALU,
      distrito: dat_old.distrito,
      municipio: dat_old.municipio,
      calle: dat_old.calle,
      cp: dat_old.cp,
      tutor1Nombre: dat_old.tutor1Nombre,
      tutor1Apellido: dat_old.tutor1Apellido,
      tutor1Tel: dat_old.tutor1Tel,
      tutor1Email: dat_old.tutor1Email,
      tutor2Nombre: dat_old.tutor2Nombre,
      tutor2Apellido: dat_old.tutor2Apellido,
      tutor2Tel: dat_old.tutor2Tel,
      tutor2Email: dat_old.tutor2Email,
      fichaSalud: dat_old.fichaSalud,
      anio: dat_old.anio,
      div: dat_old.div,
      turno: dat_old.turno,
      especialidad: dat_old.especialidad,

      // 🆕 campos nuevos
      nombre_docente: nombreDoc,
      urlArchivo:"",
      urlCarpeta: ""
    };


    // =========================
    // VALIDACIONES BÁSICAS
    // =========================
    if (!dat_new.email || !dat_new.dni) {
      throw new Error("Faltan datos obligatorios (email o DNI)");
    }

    if (!dat_new.nombre_docente || dat_new.nombre_docente.trim() === "") {
      throw new Error("No se recibió el docente");
    }

    if (alumnoExiste(dat_new.email, dat_new.dni)) {
      throw new Error("El alumno ya está inscripto (email o DNI)");
    }

    // =========================
    // DESCONTAR CUPO DOCENTE
    // =========================
    actualizarContadorDocente(dat_new.nombre_docente,turnoDoc);
    cupoDescontado = true;

    // =========================
    // CREAR LEGAJO
    // Esta funcion devuelve:
    //                  legajo.cresado,
    //                  legajo.mensaje,
    //                  legajo.file,
    //                  legajo.urlArchivo,
    //                  legajo.urlCarpeta
    // =========================
    legajo = crearLegajoAlumno(dat_new);
    
    // Cargo datos faltantes en dat_new
    dat_new.urlArchivo=legajo.urlArchivo
    dat_new.urlCarpeta=legajo.urlCarpeta

    // =========================
    // ASIGNAR PERMIDO DE EDITOR
    // AL DOCENTE
    // =========================
    const emailDocente=obtenerEmailDocente(dat_new.nombre_docente);
    Drive.Permissions.create(
      {
        role: "writer",
        type: "user",
        emailAddress: emailDocente
      },
      extraerId(dat_new.urlArchivo),
      { sendNotificationEmail: false }
    )

    // =========================
    // COMPLETAR LEGAJO
    // =========================
    completarLegajo(legajo.file.getId(), dat_new);

    // =========================
    // REGISTRAR INSCRIPCIÓN
    // =========================
    registrarInscripcion(dat_new);

    // =========================
    // ELIMINA ALUMNO DE FICHAS_ALUMNOS
    // =========================
    eliminarFichaAlumno(dni);

    // =========================
    // OK FINAL
    // =========================
    return { ok: true, mensaje: "Inscripción realizada correctamente" };

  } catch (e) {

    // =========================
    // 🔄 ROLLBACK
    // =========================
    try {

      // Devolver cupo docente
      if (cupoDescontado) {
        devolverCupoDocente(dat_new.nombre_docente);
      }

      // Borrar legajo creado
      if (legajo && legajo.file) {
        legajo.file.setTrashed(true);
      }

      // Borrar alumno de Fichas_Alumnos /*  <---- Terminar */
      if (existeAlumnoFicha(dat_new.dni)) {
        eliminarFichaAlumno(dat_new.dni);
      }
      

    } catch (rbError) {
      // Si el rollback falla, lo registramos pero no tapamos el error original
      logError(
        dat_new?.email || "N/A",
        `${dat_new?.apellido || ""} ${dat_new?.nombre || ""}`,
        "FALLO ROLLBACK: " + rbError.message
      );
    }

    // Registrar error original
    logError(
      dat_new?.email || "N/A",
      `${dat_new?.apellido || ""} ${dat_new?.nombre || ""}`,
      e.message
    );

    return { ok: false, mensaje: e.message };
  }
}

/*****************************************************
 * ERRORES
 *****************************************************/
function logError(email, alumno, motivo) {

  const sh = SpreadsheetApp.getActive()
    .getSheetByName("Errores");

  sh.appendRow([new Date(), email, alumno, motivo]);
}

/*****************************************************
 * ESTADO ACTUAL DEL USUARIO
 *****************************************************/
function getEstadoSeleccionActual() {

  const email = Session.getEffectiveUser().getEmail();

  if (!email) {
    return { seleccionado: false };
  }

  const sh = SpreadsheetApp.getActive()
    .getSheetByName("Respuesta del Formulario");

  if (sh.getLastRow() < 2) {
    return { seleccionado: false };
  }

  const data = sh.getRange(2, 1, sh.getLastRow() - 1, 9).getValues();

  for (const r of data) {
    if (r[1] === email) {
      return {
        seleccionado: true,
        docente: r[8]
      };
    }
  }

  return { seleccionado: false };
}


/*****************************************************
 * DEVUELVE ESTADO BOTON SELECCION DOCENTE
 *****************************************************/
function getEstadoBotonSeleccion() { const ss = SpreadsheetApp.openById(
    getConfig("ID_Seleccion_PAT")
  );

  const sh = ss.getSheetByName("Config");
  if (!sh) {
    throw new Error("No existe la hoja Config en Seleccion_PAT");
  }

  const data = sh.getDataRange().getValues();

  const fila = data.find(r =>
    String(r[0]).trim().toUpperCase() === "BOTON_INSCRIPCION"
  );

  if (!fila) {
    throw new Error("No existe la clave BOTON_INSCRIPCION en la hoja Config");
  }

  const valor = fila[1];

  return String(valor).trim().toUpperCase() === "TRUE";
}


/*****************************************************
 * SETEA ESTADO BOTON SELECCION DOCENTE
 *****************************************************/
function setEstadoBotonSeleccion(estado) {
  const ss = SpreadsheetApp.openById(getConfig("ID_Seleccion_PAT"));
  const sh = ss.getSheetByName("Config");

  const data = sh.getDataRange().getValues();

  const fila = data.findIndex(r =>
    String(r[0]).trim().toUpperCase() === "BOTON_INSCRIPCION"
  );

  if (fila === -1) {
    throw new Error("No existe la clave BOTON_INSCRIPCION en la hoja Config");
  }

  sh.getRange(fila + 1, 2).setValue(estado ? "TRUE" : "FALSE");
  return true;
}

/*****************************************************
 * Funcion de ESTADISTICA usada por docente.html
 *****************************************************/
function getEstadisticasDirectivo() {

  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName("Estadisticas");

  if (!sh) {
    throw new Error("No existe la hoja 'Estadisticas'");
  }

  const data = sh.getDataRange().getValues();

  // Estructura base que espera el HTML
  const resultado = {
    diurno: {},
    nocturno: {}
  };

  // Helpers
  const isEsp = v => ["CB", "CSC", "CSM", "MIXTO"].includes(String(v).toUpperCase());
  const num = v => isNaN(v) || v === "" ? 0 : Number(v);

  let turnoActual = null;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const colTurno = row[0]; // Col A
    const colEsp   = row[1]; // Col B

    // Detectar cambio de turno
    if (colTurno === "Diurno") {
      turnoActual = "diurno";
      continue;
    }

    if (colTurno === "Nocturno") {
      turnoActual = "nocturno";
      continue;
    }

    // Si no estamos dentro de un turno, ignorar
    if (!turnoActual) continue;

    // Validar especialidad
    if (!isEsp(colEsp)) continue;

    const esp = colEsp.toUpperCase();

    /*
      Según tu hoja:
      C  -> PAT Parcial
      D  -> PAT Total
      E  -> No-PAT Total
      G  -> Cant. alumnos Parcial
      H  -> Cant. alumnos Total
      J  -> Cupo Esp.
      K  -> Cupo Total
      M  -> % ocupación Parcial
      N  -> % ocupación Total
    */

    resultado[turnoActual][esp] = {
      pat:        num(row[2]),   // C
      noPat:      num(row[4]),   // E
      alumnos:    num(row[6]),   // G
      cupo:       num(row[9]),   // J
      ocupacion:  num(row[12])   // M
    };
  }

  // Asegurar que existan todas las especialidades
  const especialidades = ["CB", "CSC", "CSM", "MIXTO"];

  ["diurno", "nocturno"].forEach(turno => {
    especialidades.forEach(esp => {
      if (!resultado[turno][esp]) {
        resultado[turno][esp] = {
          pat: 0,
          noPat: 0,
          alumnos: 0,
          cupo: 0,
          ocupacion: 0
        };
      }
    });
  });

  return resultado;
}

/********************************************************************************
 * Actualiza permisos de legajos o devuelve listado detallado de permisos.
 * Si `detalle === true` devuelve un array con:
 *   { id, nombreArchivo, editors: [nombresDocentes], viewers: [nombresDocentes] }
 * Si `detalle === false` (por defecto) mantiene el comportamiento original:
 *   { docentes: <nroDocentes>, legajos: <totalLegajos> }
**********************************************************************************/
/********************************************************************************
 * Actualiza permisos de legajos usando herencia por carpeta.
 *
 * @param {boolean} detalle
 *   true  → MODO AUDITORÍA (NO modifica permisos)
 *   false → MODO ACTIVO (aplica permisos reales)
 *   testMode → activa logs de tiempo
 *
 * COMPORTAMIENTO:
 * - Carpeta Alumnos:
 *     Todos los docentes → LECTORES (una sola vez)
 * - Cada legajo:
 *     Docente asignado → EDITOR
 *     Otros docentes → NO editores
 * 
 ********************************************************************************/
function actualizarPermisosLegajos(detalle = false, testMode = false) {

  const t0 = Date.now();

  const resultado = {
    ok: false,
    detalleModo: detalle,
    testMode: testMode,
    docentesProcesados: 0,
    legajosProcesados: 0,
    cambiosRealizados: 0,
    errores: [],
    auditoria: [],
    tiempoMs: 0,
    mensaje: ""
  };

  const ss = SpreadsheetApp.getActive();
  const shDoc  = ss.getSheetByName("Docentes");
  const shResp = ss.getSheetByName("Respuesta del Formulario");

  if (!shDoc || !shResp) {
    throw new Error("No se encontraron las hojas requeridas");
  }

  /* ======================================================
     UTIL – VALIDAR EMAIL
     ====================================================== */
  function esEmailValido(email) {
    return (
      typeof email === "string" &&
      email.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
  }

  /* ======================================================
     1. DOCENTES
     ====================================================== */
  const docData = shDoc.getDataRange().getValues();
  const headDoc = docData.shift();

  const idxNombreDoc = headDoc.indexOf("Apellido y Nombre");
  const idxEmailDoc  = headDoc.indexOf("Email");

  if (idxNombreDoc === -1 || idxEmailDoc === -1) {
    throw new Error("Columnas de Docentes mal definidas");
  }

  const docentesPorNombre = {};
  const emailsDocentes = [];

  docData.forEach(r => {

    const nombre = r[idxNombreDoc];
    const email  = r[idxEmailDoc];

    if (nombre && esEmailValido(email)) {
      const clean = email.trim();
      docentesPorNombre[nombre] = clean;
      emailsDocentes.push(clean);
      resultado.docentesProcesados++;
    }

  });

  /* ======================================================
     2. RESPUESTA DEL FORMULARIO
     ====================================================== */
  const respData = shResp.getDataRange().getValues();
  const headResp = respData.shift();

  const idxNombreDocResp = headResp.indexOf("Nombre Docente");
  const idxUrl           = headResp.indexOf("URL Archivo");

  if (idxNombreDocResp === -1 || idxUrl === -1) {
    throw new Error("Columnas de Respuesta del Formulario mal definidas");
  }

  /* ======================================================
     3. RECORRIDO DE LEGAJOS
     ====================================================== */
  respData.forEach((r, i) => {

    const nombreDocenteAsignado = r[idxNombreDocResp];
    const url = r[idxUrl];

    if (!url) return;

    const id = url.match(/[-\w]{25,}/)?.[0];
    if (!id) return;

    resultado.legajosProcesados++;

    try {

      const emailEditorCorrecto =
        docentesPorNombre[nombreDocenteAsignado];

      const file = DriveApp.getFileById(id);

      /* ======================================================
         MODO AUDITORÍA
         ====================================================== */
      if (detalle === true) {

        resultado.auditoria.push({
          fila: i + 2,
          archivo: file.getName(),
          url: file.getUrl(),
          docenteAsignado: nombreDocenteAsignado,
          editorEsperado: emailEditorCorrecto || null,
          editorsActuales: file.getEditors().map(u => u.getEmail()),
          viewersActuales: file.getViewers().map(u => u.getEmail())
        });

        return;
      }

      /* ======================================================
         VALIDACIÓN EMAIL
         ====================================================== */
      if (!esEmailValido(emailEditorCorrecto)) {
        resultado.errores.push(
          "Docente sin email válido: " + nombreDocenteAsignado
        );
        return;
      }

      /* ======================================================
         MODO ACTIVO / TEST
         ====================================================== */
      const permisos = Drive.Permissions.list(id).items || [];

      // 1️⃣ Quitar editores docentes incorrectos
      permisos.forEach(p => {

        if (
          p.role === "writer" &&
          p.emailAddress &&
          emailsDocentes.includes(p.emailAddress) &&
          p.emailAddress !== emailEditorCorrecto
        ) {

          if (testMode) {

            Logger.log(
              `[TEST] Quitar editor ${p.emailAddress} de ${file.getName()}`
            );

          } else {

            try {
              Drive.Permissions.remove(id, p.id);
              resultado.cambiosRealizados++;
            } catch (e) {
              resultado.errores.push(e.message);
            }

          }
        }

      });

      // 2️⃣ Verificar si ya tiene el editor correcto
      const yaTieneEditor = permisos.some(p =>
        p.role === "writer" &&
        p.emailAddress === emailEditorCorrecto
      );

      if (!yaTieneEditor) {

        if (testMode) {

          Logger.log(
            `[TEST] Agregar editor ${emailEditorCorrecto} a ${file.getName()}`
          );

        } else {

          try {
            Drive.Permissions.create(
              {
                role: "writer",
                type: "user",
                emailAddress: emailEditorCorrecto
              },
              id,
              { sendNotificationEmail: false }
            );

            resultado.cambiosRealizados++;

          } catch (e) {
            resultado.errores.push(e.message);
          }

        }
      }

    } catch (errorInterno) {

      resultado.errores.push(
        "Fila " + (i + 2) + ": " + errorInterno.message
      );

    }

  });

  /* ======================================================
     SALIDA
     ====================================================== */
  resultado.ok = true;
  resultado.tiempoMs = Date.now() - t0;

  resultado.mensaje = testMode
    ? "Modo TEST: no se aplicaron cambios"
    : "Permisos actualizados correctamente";

  return resultado;
}

/*****************************************************
 * Funcion que da permiso de lectura a todos los archivos
 * (que generalmente son legajos) que se encuentran en la
 * carpeta Alumnos, ---> por ahora no se usa <----
 *****************************************************/
function asegurarPermisosLecturaCarpetaAlumnos() {

  const carpetaId = getConfig("ID_Directorio_Alumnos");
  const carpeta = DriveApp.getFolderById(carpetaId);

  const ss = SpreadsheetApp.getActive();
  const shDoc = ss.getSheetByName("Docentes");

  const data = shDoc.getDataRange().getValues();
  const head = data.shift();

  const idxEmail = head.indexOf("Email");
  if (idxEmail === -1) throw new Error("Columna Email no encontrada");

  const lectoresActuales = carpeta.getViewers().map(u => u.getEmail());

  data.forEach(r => {
    const email = r[idxEmail];
    if (!email) return;

    if (!lectoresActuales.includes(email)) {
      carpeta.addViewer(email);
    }
  });
}

/********************************************************************************
 * Rastrea Permisos de los archivos que hay en el directorio Alumnos y los guarda
 * en un archivo llamado "listados_permisos_dd_mm_aa_hhmm" en la carpeta BackpUp
 **********************************************************************************/
 /****************************************************
  *  🔧 Paso previo OBLIGATORIO (una sola vez)
  *     En el editor de Apps Script:
  *     Servicios (barra izquierda, parte inferior)
  *     + Agregar servicio
  *     Activar Drive API
  *     Guardar 
  **************************************************/
function generarListadoPermisos() {

  try {

    // === Leer Config ===
    const ID_CARPETA_ALUMNOS = getConfig("ID_Directorio_Alumnos");
    const ID_CARPETA_BACKUP = getConfig("ID_DirectorioBackUp");

    if (!ID_CARPETA_ALUMNOS || !ID_CARPETA_BACKUP) {
      throw new Error("Faltan IDs de carpetas en Config");
    }

    const carpetaAlumnos = DriveApp.getFolderById(ID_CARPETA_ALUMNOS);
    const carpetaBackUp = DriveApp.getFolderById(ID_CARPETA_BACKUP);

    // === Fecha dd_mm_aa_hhmm ===
    const ahora = new Date();
    const dd = String(ahora.getDate()).padStart(2, "0");
    const mm = String(ahora.getMonth() + 1).padStart(2, "0");
    const aa = String(ahora.getFullYear()).slice(-2);
    const hh = String(ahora.getHours()).padStart(2, "0");
    const min = String(ahora.getMinutes()).padStart(2, "0");

    const nombreArchivo = `listado_permisos_${dd}_${mm}_${aa}_${hh}${min}`;

    // === Crear Spreadsheet ===
    const ss = SpreadsheetApp.create(nombreArchivo);
    const sheet = ss.getActiveSheet();
    sheet.setName("Permisos");

    sheet.getRange(1, 1, 1, 5).setValues([[
      "Archivo",
      "ID Archivo",
      "Editores",
      "Lectores",
      "Permisos heredados"
    ]]);

    // === Listar archivos recursivamente ===
    const listaArchivos = [];
    listarArchivosRecursivo(carpetaAlumnos, listaArchivos);

    // === NUEVO: acumular datos en array ===
    const datos = [];

    listaArchivos.forEach(archivo => {

      const editores = archivo.getEditors()
        .map(u => u.getName() || u.getEmail())
        .join(", ");

      const lectores = archivo.getViewers()
        .map(u => u.getName() || u.getEmail())
        .join(", ");

      const permisos = Drive.Permissions.list(archivo.getId()).items || [];
      const tieneHeredados = permisos.some(p => p.inherited === true);

      datos.push([
        archivo.getName(),
        archivo.getId(),
        editores,
        lectores,
        tieneHeredados ? "SI" : "NO"
      ]);
    });

    // === Escritura masiva (UNA sola operación) ===
    if (datos.length > 0) {
      sheet.getRange(2, 1, datos.length, 5).setValues(datos);
    }

    // === Mover a BackUp ===
    const file = DriveApp.getFileById(ss.getId());
    carpetaBackUp.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    SpreadsheetApp.flush();

    // === RETORNO OK ===
    return {
      ok: true,
      archivosEncontrados: listaArchivos.length,
      nombreArchivo: nombreArchivo,
      spreadsheetId: ss.getId()
    };

  } catch (error) {

    Logger.log("ERROR generarListadoPermisos: " + error.message);

    return {
      ok: false,
      error: error.message
    };
  }
}
/********************************************************************************
 * Rastrea Legajos del directorio Alumnos que no tienen explicito de ningun docente
 * ni como EDITOR ni como LECTOR, guarda el resultado en un archivo llamado 
 * "legajos_huerfanos_dd_mm_aa_hhmm" en la carpeta BackpUp
 **********************************************************************************/
function generarAuditoriaLegajos() {

  try {

    const start = new Date();

    const ID_PLANILLA = getConfig("ID_Seleccion_PAT");
    const ID_BACKUP = getConfig("ID_DirectorioBackUp");
    const ID_CARPETA_LEGAJOS = getConfig("ID_Directorio_Alumnos");

    const ssOrigen = SpreadsheetApp.openById(ID_PLANILLA);
    const hoja = ssOrigen.getSheetByName("Respuesta del Formulario");

    const datos = hoja.getDataRange().getValues();
    const encabezados = datos[0];

    const colApellido = encabezados.indexOf("Apellido del Estudiante");
    const colNombre = encabezados.indexOf("Nombre del Estudiante");
    const colDni = encabezados.indexOf("DNI");
    const colDocente = encabezados.indexOf("Nombre Docente");

    if (colApellido === -1 || colNombre === -1 || colDni === -1 || colDocente === -1) {
      throw new Error("Columnas requeridas no encontradas.");
    }

    // ==========================================================
    // FUNCION NORMALIZADORA
    // ==========================================================

    function normalizarTexto(texto) {
      return texto
        ?.toString()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .toLowerCase();
    }

    // ==========================================================
    // MAP PLANILLA (clave normalizada)
    // ==========================================================

    const mapPlanilla = new Map();

    for (let i = 1; i < datos.length; i++) {

      const apellidoRaw = datos[i][colApellido];
      const nombreRaw = datos[i][colNombre];
      const dniCompleto = datos[i][colDni]?.toString().trim();

      if (!apellidoRaw || !nombreRaw || !dniCompleto) continue;

      const dni3 = dniCompleto.slice(-3);

      const apellido = normalizarTexto(apellidoRaw);
      const nombre = normalizarTexto(nombreRaw);

      const clave = `${apellido}_${nombre}_${dni3}`;

      mapPlanilla.set(clave, {
        nombreCompleto: `${apellidoRaw}, ${nombreRaw}`,
        docente: datos[i][colDocente]
      });
    }

    // ==========================================================
    // MAP DRIVE (RECURSIVO)
    // ==========================================================

    const carpetaLegajos = DriveApp.getFolderById(ID_CARPETA_LEGAJOS);

    const listaArchivos = [];
    listarArchivosRecursivo(carpetaLegajos, listaArchivos);

    const mapDrive = new Map();
    const duplicados = new Set();

    for (let archivo of listaArchivos) {

      const nombreOriginal = archivo.getName().trim();
      const nombreNormalizado = normalizarTexto(nombreOriginal);

      if (mapDrive.has(nombreNormalizado)) {
        duplicados.add(nombreNormalizado);
      } else {
        mapDrive.set(nombreNormalizado, archivo.getUrl());
      }
    }

    // ==========================================================
    // RESULTADO
    // ==========================================================

    const resultado = [];
    resultado.push(["TIPO", "Alumno / Archivo", "Docente", "URL"]);

    let countFuncional = 0;
    let countDrive = 0;
    let countInconsistencia = 0;

    // 1) HUERFANO FUNCIONAL
    // 3) INCONSISTENCIA

    for (let [clave, info] of mapPlanilla.entries()) {

      const existeEnDrive = mapDrive.has(clave);
      const urlDrive = existeEnDrive ? mapDrive.get(clave) : "NO EXISTE EN DRIVE";

      if (!info.docente || info.docente.toString().trim() === "") {

        resultado.push([
          "HUERFANO FUNCIONAL",
          info.nombreCompleto,
          "SIN DOCENTE",
          urlDrive
        ]);

        countFuncional++;
      }

      if (info.docente && info.docente.toString().trim() !== "" && !existeEnDrive) {

        resultado.push([
          "INCONSISTENCIA",
          info.nombreCompleto,
          info.docente,
          "ARCHIVO NO EXISTE"
        ]);

        countInconsistencia++;
      }
    }

    // 2) HUERFANO DRIVE

    for (let [clave, url] of mapDrive.entries()) {

      if (!mapPlanilla.has(clave)) {

        resultado.push([
          "HUERFANO DRIVE",
          clave,
          "-",
          url
        ]);

        countDrive++;
      }
    }

    // 4) DUPLICADOS

    for (let clave of duplicados) {

      resultado.push([
        "DUPLICADO DRIVE",
        clave,
        "-",
        "MULTIPLES ARCHIVOS CON MISMO NOMBRE"
      ]);
    }

    // ==========================================================
    // CREAR ARCHIVO
    // ==========================================================

    const fechaHora = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "dd_MM_yy_HHmm"
    );

    const nombreArchivo = `auditoria_legajos_${fechaHora}`;

    const ssNuevo = SpreadsheetApp.create(nombreArchivo);
    const hojaNueva = ssNuevo.getActiveSheet();

    hojaNueva.getRange(1, 1, resultado.length, resultado[0].length)
             .setValues(resultado);

    hojaNueva.autoResizeColumns(1, resultado[0].length);

    const carpetaBackup = DriveApp.getFolderById(ID_BACKUP);
    const archivoCreado = DriveApp.getFileById(ssNuevo.getId());

    carpetaBackup.addFile(archivoCreado);
    DriveApp.getRootFolder().removeFile(archivoCreado);

    const tiempoMs = new Date() - start;

    return {
      ok: true,
      funcionales: countFuncional,
      huerfanosDrive: countDrive,
      inconsistencias: countInconsistencia,
      totalDetectados: countFuncional + countDrive + countInconsistencia,
      nombreArchivo: nombreArchivo,
      url: ssNuevo.getUrl(),
      tiempoMs: tiempoMs
    };

  } catch (error) {

    return {
      ok: false,
      error: error.toString()
    };
  }
}

/********************************************************************************
 * Borra TODOS los permisos del sistema en orden controlado
 * 1) Carpetas (raíz, alumnos, backup)
 * 2) Legajos
 **********************************************************************************/
function limpiarPermisosSistemaCompleto() {

  const resultado = {
    carpetas: null,
    legajos: null
  };

  // 1️⃣ Limpieza de carpetas
  resultado.carpetas = limpiarPermisosCarpeta();

  // 2️⃣ Limpieza de legajos
  resultado.legajos = limpiarPermisosLegajos();

  return {
    ok: true,
    mensaje: "Permisos eliminados correctamente de Carpetas y Legajos",
    detalle: resultado
  };
}

/*****************************************************
 * 🔐 LIMPIA PERMISOS DE TODOS LOS LEGAJOS
 * Mantiene SOLO al Email_ADMINISTRADOR
 * Devuelve mensaje para HTML
 *
 * Requiere:
 *  - Drive API habilitada
 *  - getConfig()
 *  - listarArchivosRecursivo()
 *****************************************************/
function limpiarPermisosLegajos() {

  const ID_CARPETA_ALUMNOS = getConfig("ID_Directorio_Alumnos");
  const EMAIL_ADMIN = getConfig("Email_ADMINISTRADOR");

  if (!ID_CARPETA_ALUMNOS || !EMAIL_ADMIN) {
    throw new Error("Falta configuración");
  }

  const carpeta = DriveApp.getFolderById(ID_CARPETA_ALUMNOS);

  const archivos = [];
  listarArchivosRecursivo(carpeta, archivos);

  let permisosEliminados = 0;

  archivos.forEach(file => {

    const permisos = obtenerPermisosSeguro(file.getId());

    permisos.forEach(p => {
      if (p.role === "owner") return;
      if (p.emailAddress &&
          p.emailAddress.toLowerCase() === EMAIL_ADMIN.toLowerCase()) return;

      if (p.role === "reader" || p.role === "writer") {
        Drive.Permissions.remove(file.getId(), p.id);
        permisosEliminados++;
      }
    });
  });

  return {
    ok: true,
    archivosProcesados: archivos.length,
    permisosEliminados
  };
}

/**********************************************************************************
 * Limpia permisos de Carpetas o directorios
 * Esta funcion es usada por la funciones:
 *                    1- limpiarPermisosLegajos() 
 *                    2- 
 **********************************************************************************/
function limpiarPermisosCarpeta() {

  const EMAIL_ADMIN = getConfig("Email_ADMINISTRADOR");
  const ID_RAIZ = getConfig("RUTA_RAIZ");
  const ID_ALUMNOS = getConfig("ID_Directorio_Alumnos");
  const ID_BACKUP = getConfig("ID_DirectorioBackUp");

  if (!EMAIL_ADMIN || !ID_RAIZ || !ID_ALUMNOS || !ID_BACKUP) {
    throw new Error("Configuración incompleta en solapa Config");
  }

  const limpiar = (id, nombre) => {
    let eliminados = 0;
    const permisos = obtenerPermisosSeguro(id);

    permisos.forEach(p => {
      if (p.role === "owner") return;
      if (p.emailAddress &&
          p.emailAddress.toLowerCase() === EMAIL_ADMIN.toLowerCase()) return;

      if (p.role === "reader" || p.role === "writer") {
        Drive.Permissions.remove(id, p.id);
        eliminados++;
      }
    });

    return eliminados;
  };

  return {
    ok: true,
    resumen: {
      raiz:    { eliminados: limpiar(ID_RAIZ, "RAIZ") },
      alumnos: { eliminados: limpiar(ID_ALUMNOS, "ALUMNOS") },
      backup:  { eliminados: limpiar(ID_BACKUP, "BACKUP") }
    }
  };
}

/**********************************************************************************
 * Genera backUp del archivo Seleccion_PAT con el formato Seleccion_PAT_dd_mm_aa_hhmm
 * ********************************************************************************/
function backupSeleccionPAT() {

  try {

    const start = new Date();

    const ID_PLANILLA = getConfig("ID_Seleccion_PAT");
    const ID_BACKUP = getConfig("ID_DirectorioBackUp");

    const archivoOriginal = DriveApp.getFileById(ID_PLANILLA);
    const carpetaBackup = DriveApp.getFolderById(ID_BACKUP);

    const fechaHora = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "dd_MM_yy_HHmm"
    );

    const nombreBackup = `Seleccion_PAT_${fechaHora}`;

    // Crear copia DIRECTAMENTE en la carpeta Backup
    const copia = archivoOriginal.makeCopy(nombreBackup, carpetaBackup);

    const tiempoMs = new Date() - start;

    return {
      ok: true,
      nombreArchivo: nombreBackup,
      url: copia.getUrl(),
      tiempoMs: tiempoMs
    };

  } catch (error) {

    return {
      ok: false,
      error: error.toString()
    };
  }
}


/**********************************************************************************
 * Genera backUp del directorio ALUMNOS con el formato Alumnos_PAT_dd_mm_aa_hhmm
 * ********************************************************************************/
function backupDirectorioAlumnos() {

  try {

    const start = new Date();

    const LIMITE_MB = 30;
    const LIMITE_BYTES = LIMITE_MB * 1024 * 1024;

    const ID_CARPETA_ALUMNOS = getConfig("ID_Directorio_Alumnos");
    const ID_BACKUP = getConfig("ID_DirectorioBackUp");

    const carpetaAlumnos = DriveApp.getFolderById(ID_CARPETA_ALUMNOS);
    const carpetaBackup = DriveApp.getFolderById(ID_BACKUP);

    const fechaHora = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "dd_MM_yy_HHmm"
    );

    let blobs = [];
    let totalBytesActual = 0;
    let totalArchivos = 0;
    let numeroZip = 1;
    let archivosGenerados = [];

    function guardarZipParte() {

      if (blobs.length === 0) return;

      const nombreZip = `Alumnos_${fechaHora}_${numeroZip}.zip`;
      const zipBlob = Utilities.zip(blobs, nombreZip);
      const archivoZip = carpetaBackup.createFile(zipBlob);

      const sizeBytes = zipBlob.getBytes().length;
      const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

      archivosGenerados.push({
        nombre: nombreZip,
        url: archivoZip.getUrl(),
        tamañoMB: sizeMB
      });

      numeroZip++;
      blobs = [];
      totalBytesActual = 0;
    }

    function recorrerCarpeta(carpeta, rutaActual) {

      const archivos = carpeta.getFiles();
      while (archivos.hasNext()) {

        const archivo = archivos.next();
        const blob = archivo.getBlob();
        const size = blob.getBytes().length;

        // Si el archivo individual supera el límite
        if (size > LIMITE_BYTES) {
          throw new Error(
            `El archivo ${archivo.getName()} supera los ${LIMITE_MB} MB y no puede ser comprimido.`
          );
        }

        // Si agregarlo supera el límite actual → guardar parte
        if (totalBytesActual + size > LIMITE_BYTES) {
          guardarZipParte();
        }

        blob.setName(rutaActual + archivo.getName());
        blobs.push(blob);

        totalBytesActual += size;
        totalArchivos++;
      }

      const subcarpetas = carpeta.getFolders();
      while (subcarpetas.hasNext()) {

        const sub = subcarpetas.next();
        recorrerCarpeta(
          sub,
          rutaActual + sub.getName() + "/"
        );
      }
    }

    recorrerCarpeta(carpetaAlumnos, "");

    // Guardar última parte
    guardarZipParte();

    if (archivosGenerados.length === 0) {
      return {
        ok: false,
        error: "La carpeta Alumnos está vacía."
      };
    }

    const tiempoMs = new Date() - start;

    return {
      ok: true,
      totalArchivos: totalArchivos,
      totalZips: archivosGenerados.length,
      archivos: archivosGenerados,
      tiempoMs: tiempoMs
    };

  } catch (error) {

    return {
      ok: false,
      error: error.toString()
    };
  }
}

/**********************************************************************************
 * Es para evitar el bug de .items
 **********************************************************************************/
function obtenerPermisosSeguro(id) {
  const res = Drive.Permissions.list(id);
  return res.items || res.permissions || [];
}

/**********************************************************************************
 * Busca archivos y carpetas en forma recursiva
 * Esta funcion es usada por la funciones:
 *                    1- limpiarPermisosLegajos() 
 *                    2- generarListadoPermisos()
 **********************************************************************************/
function listarArchivosRecursivo(carpeta, lista) {

  const archivos = carpeta.getFiles();
  while (archivos.hasNext()) {
    lista.push(archivos.next());
  }

  const subcarpetas = carpeta.getFolders();
  while (subcarpetas.hasNext()) {
    listarArchivosRecursivo(subcarpetas.next(), lista);
  }
}

/********************************************************************************
 * Extrae el ID de un archivo o carpeta de Google Drive
 * Esta funcion es usada por la funciones:
 *                    1- actualizarPermisosLegajos(detalle)
 *                    2- 
 **********************************************************************************/
function extraerId(url) {
  if (!url) {
    throw new Error("URL vacía o inválida");
  }

  const match = url.match(/[-\w]{25,}/);
  if (!match) {
    throw new Error("No se pudo extraer el ID de la URL: " + url);
  }

  return match[0];
}

/********************************************************************************
 * Reasigna un alumno a un nuevo Docente, es usada por directivo_reasignarPAT.html                2)
 * Y devuelve:
 **********************************************************************************/
function reasignarAlumno(dni, nuevoDocente) {

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {

    if (!dni || !nuevoDocente ) {
      throw new Error("Parámetros inválidos para la reasignación.");
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const shAlumnos = ss.getSheetByName("Respuesta del Formulario");
    const shDocentes = ss.getSheetByName("Docentes");

    if (!shAlumnos || !shDocentes) {
      throw new Error("No existen hojas obligatorias.");
    }

    const dataAlumnos = shAlumnos.getDataRange().getValues();
    const headersAlumnos = dataAlumnos[0];

    const colDni = headersAlumnos.indexOf("DNI");
    const colDocenteAlumno = headersAlumnos.indexOf("Nombre Docente");
    const colTurnoAlumno = headersAlumnos.indexOf("Turno");
    const colEspecialidadAlumno = headersAlumnos.indexOf("Especialidad");
    const colUrlArchivo = headersAlumnos.indexOf("URL Archivo");

    if ([colDni, colDocenteAlumno, colTurnoAlumno, colEspecialidadAlumno].includes(-1)) {
      throw new Error("Faltan columnas en hoja Respuesta del Formulario.");
    }

    // ==============================
    // BUSCAR ALUMNO
    // ==============================

    let filaAlumno = -1;

    for (let i = 1; i < dataAlumnos.length; i++) {
      if (String(dataAlumnos[i][colDni]).trim() === String(dni).trim()) {
        filaAlumno = i;
        break;
      }
    }

    if (filaAlumno === -1) {
      throw new Error("El alumno no existe.");
    }

    const docenteActual = dataAlumnos[filaAlumno][colDocenteAlumno];
    const turnoActual = dataAlumnos[filaAlumno][colTurnoAlumno];
    const especialidadActual = dataAlumnos[filaAlumno][colEspecialidadAlumno];

    if (
      String(docenteActual).trim().toLowerCase() ===
      String(nuevoDocente.nombre).trim().toLowerCase() &&
      String(turnoActual).trim().toUpperCase() ===
      String(nuevoDocente.turno).trim().toUpperCase() &&
      String(especialidadActual).trim().toUpperCase() ===
      String(nuevoDocente.especialidad).trim().toUpperCase()
    ) {
      throw new Error("El alumno ya está asignado a ese docente.");
    }

    // ==============================
    // VALIDAR DOCENTES
    // ==============================

    const dataDocentes = shDocentes.getDataRange().getValues();
    const headersDocentes = dataDocentes[0];

    const colNombreDoc = headersDocentes.indexOf("Apellido y Nombre");
    const colAsignados = headersDocentes.indexOf("Alumnos asignados");
    const colVacantes = headersDocentes.indexOf("Vacantes Disponibles");
    const colTurno = headersDocentes.indexOf("Turno");
    const colEspecialidad = headersDocentes.indexOf("Ciclos");

    if ([colNombreDoc, colAsignados, colVacantes, colTurno, colEspecialidad].includes(-1)) {
      throw new Error("Faltan columnas en hoja Docentes.");
    }

    let filaDocenteActual = -1;
    let filaNuevoDocente = -1;

    for (let i = 1; i < dataDocentes.length; i++) {

      const nombre = dataDocentes[i][colNombreDoc];
      const turno = dataDocentes[i][colTurno];
      const especialidad = dataDocentes[i][colEspecialidad];

      if (
        String(nombre).trim().toLowerCase() === String(docenteActual).trim().toLowerCase() &&
        String(turno).trim().toUpperCase() === String(turnoActual).trim().toUpperCase() /*&&
        String(especialidad).trim().toUpperCase() === String(especialidadActual).trim().toUpperCase()*/
      ) {
        filaDocenteActual = i;
      }

      if (
        String(nombre).trim().toLowerCase() === String(nuevoDocente.nombre).trim().toLowerCase() &&
        String(turno).trim().toUpperCase() === String(nuevoDocente.turno).trim().toUpperCase() /* &&
        String(especialidad).trim().toUpperCase() === String(nuevoDocente.especialidad).trim().toUpperCase()*/
      ) {
        filaNuevoDocente = i;
      }
    }

    if (filaDocenteActual === -1 || filaNuevoDocente === -1) {
      throw new Error("Docente no encontrado correctamente.");
    }

    const vacantesNuevo = Number(dataDocentes[filaNuevoDocente][colVacantes]) || 0;

    if (vacantesNuevo <= 0) {
      throw new Error("El nuevo docente no tiene vacantes.");
    }

    // ==============================
    // ACTUALIZAR SOLO ALUMNOS ASIGNADOS
    // ==============================

    let asignadosActual = Number(dataDocentes[filaDocenteActual][colAsignados]) || 0;
    let asignadosNuevo = Number(dataDocentes[filaNuevoDocente][colAsignados]) || 0;

    if (asignadosActual <= 0) {
      throw new Error("Inconsistencia: el docente actual no tiene alumnos.");
    }

    shDocentes.getRange(filaDocenteActual + 1, colAsignados + 1)
      .setValue(asignadosActual - 1);

    shDocentes.getRange(filaNuevoDocente + 1, colAsignados + 1)
      .setValue(asignadosNuevo + 1);

    // ==============================
    // ACTUALIZAR ALUMNO
    // ==============================

    shAlumnos.getRange(filaAlumno + 1, colDocenteAlumno + 1)
      .setValue(nuevoDocente.nombre);

    SpreadsheetApp.flush();

    // ==============================
    // ACTUALIZAR LEGAJO
    // ==============================

    if (colUrlArchivo !== -1) {

      const urlLegajo = dataAlumnos[filaAlumno][colUrlArchivo];

      if (urlLegajo) {

        const match = urlLegajo.match(/[-\w]{25,}/);
        if (match) {

          const fileId = match[0];
          const ssLegajo = SpreadsheetApp.openById(fileId);

          const shConfig = ss.getSheetByName("Config");
          const dataConfig = shConfig.getDataRange().getValues();

          let anioActual = null;

          for (let i = 0; i < dataConfig.length; i++) {
            if (String(dataConfig[i][0]).trim() === "Año actual") {
              anioActual = dataConfig[i][1];
              break;
            }
          }

          if (anioActual) {
            const shAnio = ssLegajo.getSheetByName(String(anioActual));
            if (shAnio) {
              shAnio.getRange("B1").setValue(nuevoDocente.nombre);
            }
          }
        }
      }
    }

    return "Reasignación completada correctamente.";

  } catch (err) {
    throw new Error(err.message);
  } finally {
    lock.releaseLock();
  }
}


function esEmailValido(email) {
  if (!email) return false;
  if (typeof email !== "string") return false;

  email = email.trim();
  if (email === "") return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAniosConfig() {

  const ID_PLANILLA = getConfig("ID_Seleccion_PAT");
  const ss = SpreadsheetApp.openById(ID_PLANILLA);
  const hoja = ss.getSheetByName("Config");

  const datos = hoja.getDataRange().getValues();
  const encabezados = datos[0];

  const colAnios = encabezados.indexOf("Años");
  const colAnioActual = encabezados.indexOf("Año actual");

  const anios = [];

  for (let i = 1; i < datos.length; i++) {
    if (datos[i][colAnios]) {
      anios.push(datos[i][colAnios]);
    }
  }

  const anioActual = datos[1][colAnioActual];

  return {
    anios: anios,
    anioActual: anioActual
  };
}

function setEstadoYAnio(estado, nuevoAnio) {

  const ID_PLANILLA = getConfig("ID_Seleccion_PAT");
  const ss = SpreadsheetApp.openById(ID_PLANILLA);
  const hoja = ss.getSheetByName("Config");

  const datos = hoja.getDataRange().getValues();

  let filaAnioActual = -1;

  // Buscar en columna A
  for (let i = 0; i < datos.length; i++) {
    if (datos[i][0] === "Año actual") {
      filaAnioActual = i + 1; // +1 porque getRange es 1-based
      break;
    }
  }

  if (filaAnioActual === -1) {
    throw new Error("No se encontró la fila 'Año actual'");
  }

  // Escribir el nuevo año en columna B
  hoja.getRange(filaAnioActual, 2).setValue(nuevoAnio);

  // Mantener tu lógica existente
  setEstadoBotonSeleccion(estado);

  return true;
}

function verificarDocentesYGenerarBackup() {

  const inicio = new Date();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const shDoc = ss.getSheetByName("Docentes");
  const shConfig = ss.getSheetByName("Config");

  if (!shDoc) throw new Error("No existe la hoja Docentes");
  if (!shConfig) throw new Error("No existe la hoja Config");

  // =====================================================
  // 1) Obtener ID Directorio Backup desde Config
  // =====================================================
  const configData = shConfig.getRange(1,1,shConfig.getLastRow(),2).getValues();
  let idBackup = null;

  configData.forEach(r => {
    if (r[0] === "ID_DirectorioBackUp") {
      idBackup = r[1];
    }
  });

  if (!idBackup) throw new Error("No se encontró ID_DirectorioBackUp en Config");

  const carpetaBackup = DriveApp.getFolderById(idBackup);

  // =====================================================
  // 2) Leer datos Docentes
  // =====================================================
  const data = shDoc.getDataRange().getValues();
  const headers = data[0];

  const errores = [];
  const resumenErrores = {};

  const index = {};
  headers.forEach((h,i)=> index[h.trim()] = i);

  const requeridas = [
    "Apellido y Nombre","Email","Ciclos","Turno",
    "Horas","Maximo teórico","Máx Alumnos",
    "Alumnos asignados","Vacantes Disponibles"
  ];

  requeridas.forEach(c=>{
    if(index[c] === undefined){
      throw new Error("Falta la columna: " + c);
    }
  });

  const clavesUnicas = new Set();
  const ciclosValidos = ["CB","CSC","CSM","DD","AA"];

  // =====================================================
  // Función auxiliar registrar error
  // =====================================================
  function registrarError(fila, apellidoNombre, tipoError) {
    errores.push([fila, apellidoNombre, tipoError]);
    resumenErrores[tipoError] = (resumenErrores[tipoError] || 0) + 1;
  }

  // =====================================================
  // 3) Validaciones
  // =====================================================
  for (let i = 1; i < data.length; i++) {

    const fila = data[i];
    const nroFila = i + 1;

    const apellido = fila[index["Apellido y Nombre"]];
    const email = fila[index["Email"]];
    const ciclos = fila[index["Ciclos"]];
    const turno = fila[index["Turno"]];

    const horas = fila[index["Horas"]];
    const maxTeo = fila[index["Maximo teórico"]];
    const maxAl = fila[index["Máx Alumnos"]];
    const asig = fila[index["Alumnos asignados"]];
    const vac = fila[index["Vacantes Disponibles"]];

    // --- Duplicado Apellido+Turno
    const clave = apellido + "_" + turno;
    if (clavesUnicas.has(clave)) {
      registrarError(nroFila, apellido, "Duplicado Apellido y Nombre + Turno");
    } else {
      clavesUnicas.add(clave);
    }

    // --- Email
    if (!email) {
      registrarError(nroFila, apellido, "Emails vacíos");
    } else if (!/^[a-zA-Z0-9._%+-]+@bue\.edu\.ar$/.test(email)) {
      registrarError(nroFila, apellido, "Emails inválidos (@bue.edu.ar requerido)");
    }

    // --- Turno
    if (!turno || !["TD","TN"].includes(turno)) {
      registrarError(nroFila, apellido, "Turnos inválidos (TD o TN)");
    }

    // --- Ciclos
    if (!ciclos) {
      registrarError(nroFila, apellido, "Ciclos vacíos");
    } else {
      const lista = ciclos.toString().split(",");
      lista.forEach(c=>{
        if (!ciclosValidos.includes(c.trim())) {
          registrarError(nroFila, apellido, "Ciclo inválido");
        }
      });
    }

    // --- Numéricos
    const camposNumericos = [
      {valor:horas, nombre:"Horas"},
      {valor:maxTeo, nombre:"Maximo teórico"},
      {valor:maxAl, nombre:"Máx Alumnos"},
      {valor:asig, nombre:"Alumnos asignados"},
      {valor:vac, nombre:"Vacantes Disponibles"}
    ];

    camposNumericos.forEach(c=>{
      if (c.valor === "" || c.valor === null) {
        registrarError(nroFila, apellido, c.nombre + " vacío");
      } else if (isNaN(c.valor) || Number(c.valor) < 0) {
        registrarError(nroFila, apellido, c.nombre + " inválidas (>=0 requerido)");
      }
    });

  }

  // =====================================================
  // 4) Crear archivo resultado
  // =====================================================
  const ahora = new Date();
  const nombreArchivo = "Docentes_" +
    Utilities.formatDate(ahora, Session.getScriptTimeZone(), "dd_MM_yy_HHmm");

  const nuevoSS = SpreadsheetApp.create(nombreArchivo);
  const shErrores = nuevoSS.getActiveSheet();
  shErrores.setName("Errores");

  if (errores.length === 0) {

    shErrores.getRange(1,1).setValue("No se encontraron errores");

  } else {

    // Encabezados
    shErrores.getRange(1,1,1,3)
      .setValues([["Fila","Apellido y Nombre","Tipo de Error"]]);

    // Detalle
    shErrores.getRange(2,1,errores.length,3)
      .setValues(errores);

    // Resumen
    const filaResumen = errores.length + 3;
    shErrores.getRange(filaResumen,1)
      .setValue("Resumen por Tipo de Error");

    const resumenArray = Object.keys(resumenErrores)
      .map(k => [k, resumenErrores[k]]);

    shErrores.getRange(filaResumen+1,1,1,2)
      .setValues([["Tipo de Error","Cantidad"]]);

    shErrores.getRange(filaResumen+2,1,resumenArray.length,2)
      .setValues(resumenArray);
  }

  // =====================================================
  // 5) Mover archivo a carpeta Backup
  // =====================================================
  const archivo = DriveApp.getFileById(nuevoSS.getId());
  carpetaBackup.addFile(archivo);
  DriveApp.getRootFolder().removeFile(archivo);

  // =====================================================
  // 6) Retorno final
  // =====================================================
  const fin = new Date();
  const tiempo = (fin - inicio) / 1000;

  return {
    archivo_generado: nombreArchivo,
    total_errores: errores.length,
    resumen_por_tipo: resumenErrores,
    tiempo_segundos: tiempo
  };
}


function indexByName(headers) {
  const map = {};
  headers.forEach((h, i) => map[h] = i);
  return map;
}

/********************************************************************************
 * Reasigna un grupo de alumnos a un nuevo Docente, es usada por 
 * directivo_reasignarGrupoPAT
 * Y devuelve:
 **********************************************************************************/
 function reasignarGrupoPAT(docenteOrigen, docenteDestino){

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try{

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const shDoc = ss.getSheetByName("Docentes");
    const shAlum = ss.getSheetByName("Respuesta del Formulario");
    const shConfig = ss.getSheetByName("Config");
    const shErrores = ss.getSheetByName("Errores");

    const dataDoc = shDoc.getDataRange().getValues();
    const headers = dataDoc[0];

    const colNombre = headers.indexOf("Apellido y Nombre");
    const colAsign = headers.indexOf("Alumnos asignados");
    const colVac = headers.indexOf("Vacantes Disponibles");
    const colEmail = headers.indexOf("Email");

    let filaOrigen=-1,filaDestino=-1;

    for(let i=1;i<dataDoc.length;i++){
      if(dataDoc[i][colNombre]===docenteOrigen) filaOrigen=i;
      if(dataDoc[i][colNombre]===docenteDestino) filaDestino=i;
    }

    if(filaOrigen===-1 || filaDestino===-1)
      throw new Error("Docente no encontrado.");

    const cantidad = Number(dataDoc[filaOrigen][colAsign]);
    const vacantesDestino = Number(dataDoc[filaDestino][colVac]);

    if(vacantesDestino < cantidad)
      throw new Error("El docente destino no posee vacantes suficientes.");

    // 1) actualizar conteos
    shDoc.getRange(filaDestino+1,colAsign+1)
      .setValue(Number(dataDoc[filaDestino][colAsign]) + cantidad);

    shDoc.getRange(filaDestino+1,colVac+1)
      .setValue(vacantesDestino - cantidad);

    shDoc.getRange(filaOrigen+1,colAsign+1)
      .setValue(0);

    shDoc.getRange(filaOrigen+1,colVac+1)
      .setValue(Number(dataDoc[filaOrigen][colVac]) + cantidad);

    // 2) actualizar alumnos y contar
    const dataAlum = shAlum.getDataRange().getValues();
    const headersAlum = dataAlum[0];

    const colDocAlum = headersAlum.indexOf("Nombre Docente");
    const colUrl = headersAlum.indexOf("URL Archivo");

    let reemplazos=0;

    const anioActual = shConfig.getDataRange().getValues()
      .find(r=>String(r[0]).trim()==="Año actual")[1];

    for(let i=1;i<dataAlum.length;i++){

      if(dataAlum[i][colDocAlum]===docenteOrigen){

        reemplazos++;

        shAlum.getRange(i+1,colDocAlum+1)
          .setValue(docenteDestino);

        // actualizar legajo
        const url = dataAlum[i][colUrl];
        const id = url.match(/[-\w]{25,}/)[0];

        const ssLegajo = SpreadsheetApp.openById(id);
        const shAnio = ssLegajo.getSheetByName(String(anioActual));
        shAnio.getRange("B1").setValue(docenteDestino);

        // permisos
        const file = DriveApp.getFileById(id);
        file.removeEditor(dataDoc[filaOrigen][colEmail]);
        file.addEditor(dataDoc[filaDestino][colEmail]);
      }
    }

    if(reemplazos !== cantidad)
      throw new Error("Cantidad de reemplazos inconsistente.");

    return "Reasignación masiva completada correctamente.";

  }catch(e){

    const shErrores = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName("Errores");

    shErrores.appendRow([new Date(), e.message]);

    throw new Error(e.message);

  }finally{
    lock.releaseLock();
  }
}


function getDocentesConAlumnosPorFiltro(filtro) {

  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("Docentes");
  if (!sheet) throw new Error("No existe la solapa 'Docentes'");

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const colNombre = headers.indexOf("Apellido y Nombre");
  const colTurno = headers.indexOf("Turno");
  const colCiclos = headers.indexOf("Ciclos");
  const colAsignados = headers.indexOf("Alumnos asignados");
  const colVacantes = headers.indexOf("Vacantes Disponibles");

  if (colNombre === -1 || colTurno === -1 || colCiclos === -1 ||
      colAsignados === -1 || colVacantes === -1) {
    throw new Error("Faltan columnas en la hoja Docentes.");
  }

  const resultado = [];

  for (let i = 1; i < data.length; i++) {

    const nombre = data[i][colNombre];
    const turno = data[i][colTurno];
    const ciclos = data[i][colCiclos];
    const asignados = Number(data[i][colAsignados]) || 0;
    const vacantes = Number(data[i][colVacantes]) || 0;

    if (asignados <= 0) continue;

    // Filtro por string
    if (filtro && filtro.trim() !== "") {
      const f = filtro.toLowerCase();
      const coincideNombre = nombre.toLowerCase().includes(f);
      const coincideTurno = turno.toLowerCase().includes(f);

      if (!coincideNombre && !coincideTurno) continue;
    }

    resultado.push({
      nombre,
      turno,
      ciclos,
      asignados,
      vacantes
    });
  }

  return resultado;
}


/********************************************************************************
 * Busca s docentes en la solapa "Docentes", y se fija en la columna 
 * "Apellido y Nombre" y "DNI",esta funcion la llama directivo_ingresarDocente.html                
 * Y devuelve:
 **********************************************************************************/
function findDocentes(filtro) {

  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("Docentes");
  if (!sheet) throw new Error("No existe la solapa 'Docentes'");

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const colNombre = headers.indexOf("Apellido y Nombre");
  const colDNI = headers.indexOf("DNI");
  const colTurno = headers.indexOf("Turno");
  const colCiclos = headers.indexOf("Ciclos");
  const colAsignados = headers.indexOf("Alumnos asignados");
  const colVacantes = headers.indexOf("Vacantes Disponibles");

  if (colNombre === -1 || colTurno === -1 || colCiclos === -1 ||
      colAsignados === -1 || colVacantes === -1 || colDNI===-1) {
    throw new Error("Faltan columnas en la hoja Docentes.");
  }

  const resultado = [];

  for (let i = 1; i < data.length; i++) {

    const nombre = data[i][colNombre];
    const dni= data[i][colDNI].toString();
    const turno = data[i][colTurno];
    const ciclos = data[i][colCiclos];
    const asignados = Number(data[i][colAsignados]) || 0;
    const vacantes = Number(data[i][colVacantes]) || 0;

    // Filtro por string
    if (filtro && filtro.trim() !== "") {
      const f = filtro.toLowerCase();
      const coincideNombre = nombre.toLowerCase().includes(f);
      const coincideTurno = turno.toLowerCase().includes(f);
      const coincideDNI = dni.toString().includes(f);

      if (!coincideNombre && !coincideTurno && !coincideDNI) continue;
    }

    resultado.push({
      nombre,
      dni,
      turno,
      ciclos,
      asignados,
      vacantes
    });
  }

  return resultado;
}


function getDocentesCompatibles(nombre, asignados, turno, ciclos) {

  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("Docentes");
  if (!sheet) throw new Error("No existe la solapa 'Docentes'");

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const colNombre = headers.indexOf("Apellido y Nombre");
  const colTurno = headers.indexOf("Turno");
  const colCiclos = headers.indexOf("Ciclos");
  const colAsignados = headers.indexOf("Alumnos asignados");
  const colVacantes = headers.indexOf("Vacantes Disponibles");

  if (colNombre === -1 || colTurno === -1 || colCiclos === -1 ||
      colAsignados === -1 || colVacantes === -1) {
    throw new Error("Faltan columnas en la hoja Docentes.");
  }

  const resultado = [];

  for (let i = 1; i < data.length; i++) {

    const nombre2 = data[i][colNombre];
    const turno2 = data[i][colTurno];
    const ciclos2 = data[i][colCiclos];
    const vacantes2 = Number(data[i][colVacantes]) || 0;

    // No puede ser el mismo docente
    if (nombre2 === nombre) continue;

    // Debe coincidir turno
    if (turno2 !== turno) continue;

    // Debe tener vacantes suficientes
    if (vacantes2 < asignados) continue;

    // ===== VALIDACION DE CICLOS =====

    let cumpleCiclo = true;

    if (ciclos && ciclos !== "AA" && ciclos !== "DD") {

      if (ciclos.includes(",")) {
        // Caso CB,CSC → debe coincidir string completo
        if (!ciclos2.includes(ciclos)) {
          cumpleCiclo = false;
        }
      } else {
        // Caso CB solo → debe existir dentro del string
        if (!ciclos2.includes(ciclos)) {
          cumpleCiclo = false;
        }
      }
    }

    if (!cumpleCiclo) continue;

    resultado.push({
      nombre: nombre2,
      turno: turno2,
      ciclos: ciclos2,
      vacantes: vacantes2
    });
  }

  return resultado;
}


/********************************************************************************
 * Guarda docentes en la solapa "Docentes", y se fija en la columna 
 *  "DNI" no este duplicada ,esta funcion la llama directivo_ingresarDocente.html                
 * Y devuelve:
 **********************************************************************************/
function guardarDocente(docente) {
  try {

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName("Docentes");
    if (!hoja) throw new Error("No existe la hoja 'Docentes'.");

    const data = hoja.getDataRange().getValues();
    const headers = data[0];

    const colApellidoNombre = headers.indexOf("Apellido y Nombre");
    const colEmail = headers.indexOf("Email");
    const colDNI = headers.indexOf("DNI");
    const colCiclos = headers.indexOf("Ciclos");
    const colTurno = headers.indexOf("Turno");
    const colHoras = headers.indexOf("Horas");
    const colHorasSin = headers.indexOf("Horas sin Alumnos");
    const colMaxAlumnos = headers.indexOf("Máx Alumnos");
    const colMaxTeorico = headers.indexOf("Maximo teórico");
    const colAlumsignados = headers.indexOf("Alumnos asignados");
    const colVacantes = headers.indexOf("Vacantes Disponibles");

    if ([colApellidoNombre, colEmail, colDNI, colCiclos, colTurno, colHoras, colHorasSin, colMaxAlumnos, colMaxTeorico, colAlumsignados, colVacantes].some(c => c === -1)) {
      throw new Error("Faltan columnas necesarias en la hoja Docentes.");
    }

    // ===================== LIMPIEZA Y NORMALIZACIÓN =====================

    const apellidoNombreLimpio = (docente.apellidoNombre || "")
      .toString()
      .trim()
      .replace(/\s+/g, " ");

    const emailLimpio = (docente.email || "")
      .toString()
      .trim()
      .toLowerCase();

    const dniLimpio = (docente.dni || "")
      .toString()
      .trim();

    const turnoLimpio = (docente.turno || "")
      .toString()
      .trim()
      .toUpperCase();

    // ===================== VALIDACIÓN EMAIL =====================

    if (!emailLimpio) {
      throw new Error("El Email es obligatorio.");
    }

    const regexEmail = /^[a-z]+(\.[a-z]+)+@bue\.edu\.ar$/;

    if (!regexEmail.test(emailLimpio)) {
      throw new Error("El email debe tener formato nombre.apellido@bue.edu.ar");
    }

    // ===================== VALIDACIÓN DNI + TURNO =====================

    if (!dniLimpio) {
      throw new Error("El DNI es obligatorio.");
    }

    if (!/^\d+$/.test(dniLimpio)) {
      throw new Error("El DNI debe contener solo números.");
    }

    if (!["TD", "TN"].includes(turnoLimpio)) {
      throw new Error("El Turno debe ser TD o TN.");
    }

    // Validar clave compuesta DNI + Turno
    const existeCombinacion = data.slice(1).some(row => {
      const dniHoja = row[colDNI].toString().trim();
      const turnoHoja = row[colTurno].toString().trim().toUpperCase();
      return dniHoja === dniLimpio && turnoHoja === turnoLimpio;
    });

    if (existeCombinacion) {
      throw new Error("Ya existe un docente con ese DNI en ese Turno.");
    }


    // ===================== VALIDACIÓN TURNO =====================

    if (!["TD", "TN"].includes(turnoLimpio)) {
      throw new Error("El Turno debe ser TD o TN.");
    }

    // ===================== VALIDACIÓN CICLOS =====================

    const ciclosPermitidos = ["CB", "CSC", "CSM", "AA", "DD"];

    if (!docente.ciclos) {
      throw new Error("El campo Ciclos es obligatorio.");
    }

    const ciclosNormalizado = docente.ciclos
      .toString()
      .toUpperCase()
      .replace(/\s+/g, "");

    const listaCiclos = ciclosNormalizado.split(",");

    const invalido = listaCiclos.some(c => !ciclosPermitidos.includes(c));

    if (invalido) {
      throw new Error("Ciclos inválidos. Solo se permite: CB, CSC, CSM, AA, DD.");
    }

    // ===================== INSERTAR FILA =====================

    const nuevaFila = hoja.getLastRow() + 1;

    hoja.getRange(nuevaFila, colApellidoNombre + 1).setValue(apellidoNombreLimpio);
    hoja.getRange(nuevaFila, colEmail + 1).setValue(emailLimpio);
    hoja.getRange(nuevaFila, colDNI + 1).setValue(dniLimpio);
    hoja.getRange(nuevaFila, colCiclos + 1).setValue(ciclosNormalizado);
    hoja.getRange(nuevaFila, colTurno + 1).setValue(turnoLimpio);
    hoja.getRange(nuevaFila, colHoras + 1).setValue(docente.horas);
    hoja.getRange(nuevaFila, colHorasSin + 1).setValue(docente.horasSin);
    hoja.getRange(nuevaFila, colMaxAlumnos + 1).setValue(docente.maxAlumnos);
    hoja.getRange(nuevaFila, colAlumsignados + 1).setValue(0);

    // Copiar fórmulas
    if (nuevaFila > 2) {
      hoja.getRange(nuevaFila - 1, colMaxTeorico + 1)
        .copyTo(hoja.getRange(nuevaFila, colMaxTeorico + 1), { contentsOnly: false });

      hoja.getRange(nuevaFila - 1, colVacantes + 1)
        .copyTo(hoja.getRange(nuevaFila, colVacantes + 1), { contentsOnly: false });
    }

    return "Docente guardado correctamente.";

  } catch (err) {
    throw new Error(err.message);
  }
}


function eliminarDocente(dni, turno) {

  const ss = SpreadsheetApp.getActive();
  const hojaDocentes = ss.getSheetByName("Docentes");
  const hojaHistorial = ss.getSheetByName("Historial docente");

  if (!hojaDocentes) {
    throw new Error("No existe la hoja 'Docentes'.");
  }

  if (!hojaHistorial) {
    throw new Error("No existe la hoja 'Historial docente'.");
  }

  const datos = hojaDocentes.getDataRange().getValues();

  if (datos.length < 2) {
    throw new Error("No hay docentes cargados.");
  }

  const encabezados = datos[0];

  const colDni = encabezados.indexOf("DNI");
  const colTurno = encabezados.indexOf("Turno");
  const colAsignados = encabezados.indexOf("Alumnos asignados");

  if (colDni === -1 || colTurno === -1 || colAsignados === -1) {
    throw new Error("No se encontraron las columnas necesarias.");
  }

  for (let i = 1; i < datos.length; i++) {

    const filaDni = String(datos[i][colDni]).trim();
    const filaTurno = String(datos[i][colTurno]).trim();
    const alumnosAsignados = Number(datos[i][colAsignados]);

    if (filaDni === String(dni).trim() &&
        filaTurno === String(turno).trim()) {

      if (alumnosAsignados !== 0) {
        throw new Error("No se puede eliminar el docente porque tiene alumnos asignados.");
      }

      // 📌 Copiar fila al historial
      const filaCompleta = datos[i];
      const fechaEliminacion = new Date();

      hojaHistorial.appendRow([
        ...filaCompleta,
        fechaEliminacion
      ]);

      // 🗑 Eliminar fila original
      hojaDocentes.deleteRow(i + 1);

      return "Docente eliminado y movido al historial correctamente.";
    }
  }

  throw new Error("No se encontró el docente.");
}


function obtenerDocente(dni, turno){

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName("Docentes");
  if (!hoja) throw new Error("No existe la hoja 'Docentes'.");

  const data = hoja.getDataRange().getValues();
  const headers = data[0];

  const col = nombre => headers.indexOf(nombre);

  for(let i=1;i<data.length;i++){

    const dniHoja = data[i][col("DNI")].toString().trim();
    const turnoHoja = data[i][col("Turno")].toString().trim().toUpperCase();

    if(dniHoja === dni && turnoHoja === turno){

      return {
        apellidoNombre: data[i][col("Apellido y Nombre")],
        email: data[i][col("Email")],
        dni: data[i][col("DNI")],
        ciclos: data[i][col("Ciclos")],
        turno: data[i][col("Turno")],
        horas: data[i][col("Horas")],
        horasSin: data[i][col("Horas sin Alumnos")],
        maxAlumnos: data[i][col("Máx Alumnos")],
        maxTeorico: data[i][col("Maximo teórico")],
        alumnosAsignados: data[i][col("Alumnos asignados")],
        vacantes: data[i][col("Vacantes Disponibles")]
      };
    }
  }

  return null;
}

function actualizarDocente(docente) {
  try {

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName("Docentes");
    if (!hoja) throw new Error("No existe la hoja 'Docentes'.");

    const data = hoja.getDataRange().getValues();
    const headers = data[0];

    const col = nombre => headers.indexOf(nombre);

    // ==== LIMPIEZA ====

    const apellidoNombreLimpio = (docente.apellidoNombre || "")
      .toString().trim().replace(/\s+/g," ");

    const emailLimpio = (docente.email || "")
      .toString().trim().toLowerCase();

    const dniLimpio = (docente.dni || "")
      .toString().trim();

    const turnoLimpio = (docente.turno || "")
      .toString().trim().toUpperCase();

    // ==== VALIDACIONES ====

    if(!/^\d+$/.test(dniLimpio))
      throw new Error("El DNI debe contener solo números.");

    if(!["TD","TN"].includes(turnoLimpio))
      throw new Error("El Turno debe ser TD o TN.");

    const regexEmail = /^[a-z]+(\.[a-z]+)+@bue\.edu\.ar$/;
    if(!regexEmail.test(emailLimpio))
      throw new Error("El email debe tener formato nombre.apellido@bue.edu.ar");

    const ciclosPermitidos = ["CB","CSC","CSM","AA","DD"];

    const ciclosNormalizado = docente.ciclos
      .toString().toUpperCase().replace(/\s+/g,"");

    const listaCiclos = ciclosNormalizado.split(",");

    if(listaCiclos.some(c=>!ciclosPermitidos.includes(c)))
      throw new Error("Ciclos inválidos.");

    // ==== BUSCAR FILA ====

    let filaEncontrada = -1;

    for(let i=1;i<data.length;i++){
      const dniHoja = data[i][col("DNI")].toString().trim();
      const turnoHoja = data[i][col("Turno")].toString().trim().toUpperCase();

      if(dniHoja === dniLimpio && turnoHoja === turnoLimpio){
        filaEncontrada = i+1;
        break;
      }
    }

    if(filaEncontrada === -1)
      throw new Error("Docente no encontrado.");

    // ==== ACTUALIZAR CAMPOS EDITABLES ====

    hoja.getRange(filaEncontrada, col("Apellido y Nombre")+1).setValue(apellidoNombreLimpio);
    hoja.getRange(filaEncontrada, col("Email")+1).setValue(emailLimpio);
    hoja.getRange(filaEncontrada, col("Ciclos")+1).setValue(ciclosNormalizado);
    hoja.getRange(filaEncontrada, col("Horas")+1).setValue(docente.horas);
    hoja.getRange(filaEncontrada, col("Horas sin Alumnos")+1).setValue(docente.horasSin);
    hoja.getRange(filaEncontrada, col("Máx Alumnos")+1).setValue(docente.maxAlumnos);

    return "Docente actualizado correctamente.";

  } catch (err) {
    throw new Error(err.message);
  }
}

/********************************************************************************
 *  funciones directivo_editarAlumno 
 **********************************************************************************/

function findAlumnos(filtro) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("Respuesta del Formulario");

  if (!sh) throw new Error("No existe la hoja 'Respuesta del Formulario'.");

  const data = sh.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data.shift();
  const idx = getColumnIndexes_(headers);

  const texto = (filtro || "").toString().toLowerCase().trim();

  return data
    .filter(r => {
      const apellido = (r[idx.apellido] || "").toString().toLowerCase();
      const nombre = (r[idx.nombre] || "").toString().toLowerCase();
      const dni = (r[idx.dni] || "").toString().toLowerCase();

      return (
        apellido.includes(texto) ||
        nombre.includes(texto) ||
        dni.includes(texto)
      );
    })
    .map(r => ({
      apellido: r[idx.apellido],
      nombre: r[idx.nombre],
      dni: r[idx.dni],
      anio: r[idx.anio],
      turno: r[idx.turno],
      especialidad: r[idx.especialidad]
    }));
}

function obtenerAlumno(dni) {

  if (!dni) {
    throw new Error("DNI inválido.");
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("Respuesta del Formulario");

  if (!sh) {
    throw new Error("No existe la hoja 'Respuesta del Formulario'.");
  }

  const data = sh.getDataRange().getValues();
  if (data.length < 2) {
    throw new Error("No hay datos cargados.");
  }

  const headers = data.shift();
  const idx = getColumnIndexes_(headers);

  if (idx.dni === undefined) {
    throw new Error("La columna DNI no está configurada correctamente.");
  }

  // Buscar alumno con comparación segura
  const fila = data.find(r => {
    const dniHoja = r[idx.dni];
    if (dniHoja === null || dniHoja === "") return false;
    return String(dniHoja).trim() === String(dni).trim();
  });

  if (!fila) {
    throw new Error("Alumno no encontrado.");
  }

  // Función segura para leer columnas
  const val = (campo) =>
    idx[campo] !== undefined && fila[idx[campo]] !== undefined
      ? fila[idx[campo]]
      : "";

  // Formateo seguro de fecha para input type="date"
  let fechaFormateada = "";
  const fechaRaw = val("fechaNacimiento");

  if (fechaRaw instanceof Date) {
    fechaFormateada = Utilities.formatDate(
      fechaRaw,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd"
    );
  } else if (fechaRaw) {
    fechaFormateada = fechaRaw;
  }

  return {
    apellido: val("apellido"),
    nombre: val("nombre"),
    dni: val("dni"),
    nacionalidad: val("nacionalidad"),
    fechaNacimiento: fechaFormateada,
    emailAddress: val("emailAddress"),
    alu: val("alu"),
    distrito: val("distrito"),
    municipio: val("municipio"),
    call: val("call"),
    cp: val("cp"),
    tutor1Nombre: val("tutor1Nombre"),
    tutor1Apellido: val("tutor1Apellido"),
    tutor1Telefono: val("tutor1Telefono"),
    tutor1Email: val("tutor1Email"),
    tutor2Nombre: val("tutor2Nombre"),
    tutor2Apellido: val("tutor2Apellido"),
    tutor2Telefono: val("tutor2Telefono"),
    tutor2Email: val("tutor2Email"),
    fichaSalud: val("fichaSalud"),
    anio: val("anio"),
    division: val("division"),
    turno: val("turno"),
    especialidad: val("especialidad"),
    nombreDocente: val("nombreDocente"),
    urlArchivo: val("urlArchivo"),
    urlCarpeta: val("urlCarpeta")
  };
}

function actualizarAlumno(data) {

  if (!data || !data.dni) {
    throw new Error("Datos inválidos para actualizar.");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName("Respuesta del Formulario");
    if (!sh) throw new Error("No existe la hoja 'Respuesta del Formulario'.");

    const values = sh.getDataRange().getValues();
    if (values.length < 2) throw new Error("No hay datos para actualizar.");

    const headers = values.shift();
    const idx = getColumnIndexes_(headers);

    const rowIndex = values.findIndex(r =>
      r[idx.dni] && r[idx.dni].toString() === data.dni.toString()
    );

    if (rowIndex === -1) throw new Error("Alumno no encontrado.");

    const realRow = rowIndex + 2;

    const columnasPermitidas = [
      "apellido","nombre","dni","nacionalidad","fechaNacimiento",
      "emailAddress","alu",
      "distrito","municipio","call","cp",
      "tutor1Nombre","tutor1Apellido","tutor1Telefono","tutor1Email",
      "tutor2Nombre","tutor2Apellido","tutor2Telefono","tutor2Email",
      "fichaSalud","anio","division","turno","especialidad"
    ];

    columnasPermitidas.forEach(campo => {
      if (idx[campo] !== -1 && idx[campo] !== undefined) {
        sh.getRange(realRow, idx[campo] + 1).setValue(data[campo] || "");
      }
    });

    // ===============================
    // === ACTUALIZAR LEGAJO DINÁMICO
    // ===============================

    const urlArchivo = values[rowIndex][idx.urlArchivo];
    if (!urlArchivo) throw new Error("El alumno no posee URL de archivo.");

    const fileId = extraerIdDeUrl_(urlArchivo);
    if (!fileId) throw new Error("No se pudo extraer ID del archivo.");

    const legajo = SpreadsheetApp.openById(fileId);
    const hojaDatos = legajo.getSheetByName("Datos Generales");
    if (!hojaDatos) throw new Error("No existe la hoja 'Datos Generales' en el legajo.");

    const mapaCampos = {
      "Apellido del Estudiante": data.apellido,
      "Nombre del Estudiante": data.nombre,
      "DNI": data.dni,
      "Nacionalidad": data.nacionalidad,
      "Fecha de Nacimiento": data.fechaNacimiento,
      "Email institucional": data.emailAddress,
      "Email ALU": data.alu,
      "Distrito (Ej; Pcia de BsAs, CABA)": data.distrito,
      "Municipalidad(Ej: San Isidro,CGP12)": data.municipio,
      "Calle": data.call,
      "Código Postal": data.cp,
      "Nombre de (Padre/Madre/Tutor)1": data.tutor1Nombre,
      "Apellido de (Padre/Madre/Tutor)1": data.tutor1Apellido,
      "Teléfono del  (Padre/Madre/Tutor) 1": data.tutor1Telefono,
      "Email del  (Padre/Madre/Tutor) 1": data.tutor1Email,
      "Nombre de (Padre/Madre/Tutor) 2": data.tutor2Nombre,
      "Apellido de (Padre/Madre/Tutor)2": data.tutor2Apellido,
      "Teléfono del (Padre/Madre/Tutor) 2": data.tutor2Telefono,
      "Email del  (Padre/Madre/Tutor) 2": data.tutor2Email,
      "Ficha salud (detalle de importancia)": data.fichaSalud,
      "Año que cursa en la actualidad": data.anio,
      "División que cursa en la actualidad": data.division,
      "Turno actual": data.turno,
      "Especialidad": data.especialidad
    };

    const etiquetas = hojaDatos.getRange("A1:A100").getValues().flat();

    Object.keys(mapaCampos).forEach(etiqueta => {

      const fila = etiquetas.findIndex(e =>
        e && e.toString().trim().toLowerCase() === etiqueta.toLowerCase()
      );

      if (fila !== -1) {
        hojaDatos.getRange(fila + 1, 2).setValue(mapaCampos[etiqueta] || "");
      }

    });

    // ===============================
    // === RENOMBRAR ARCHIVO
    // ===============================

    const nuevoNombre = generarNombreArchivo_(data.apellido, data.nombre, data.dni);
    const file = DriveApp.getFileById(fileId);
    file.setName(nuevoNombre);

    return "Alumno actualizado correctamente.";

  } finally {
    lock.releaseLock();
  }
}

function getColumnIndexes_(headers) {

  return {
    apellido: headers.indexOf("Apellido del Estudiante"),
    nombre: headers.indexOf("Nombre del Estudiante"),
    dni: headers.indexOf("DNI"),
    nacionalidad: headers.indexOf("Nacionalidad"),
    fechaNacimiento: headers.indexOf("Fecha Nacimiento"),
    emailAddress: headers.indexOf("Email Address"),
    alu: headers.indexOf("ALU"),
    distrito: headers.indexOf("Distrito"),
    municipio: headers.indexOf("Municipio"),
    call: headers.indexOf("Call"),
    cp: headers.indexOf("CP"),
    tutor1Nombre: headers.indexOf("Tutor1Nombre"),
    tutor1Apellido: headers.indexOf("Tutor1Apellido"),
    tutor1Telefono: headers.indexOf("Tutor1Telefono"),
    tutor1Email: headers.indexOf("Tutor1Email"),
    tutor2Nombre: headers.indexOf("Tutor2Nombre"),
    tutor2Apellido: headers.indexOf("Tutor2Apellido"),
    tutor2Telefono: headers.indexOf("Tutor2Telefono"),
    tutor2Email: headers.indexOf("Tutor2Email"),
    fichaSalud: headers.indexOf("Ficha Salud"),
    anio: headers.indexOf("Año"),
    division: headers.indexOf("División"),
    turno: headers.indexOf("Turno"),
    especialidad: headers.indexOf("Especialidad"),
    nombreDocente: headers.indexOf("Nombre Docente"),
    urlArchivo: headers.indexOf("URL Archivo"),
    urlCarpeta: headers.indexOf("URL Carpeta")
  };
}

function extraerIdDeUrl_(url) {
  if (!url) return null;
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

function generarNombreArchivo_(apellido, nombre, dni) {

  if (!apellido || !nombre || !dni) {
    throw new Error("Datos insuficientes para generar nombre de archivo.");
  }

  const ultimos3 = dni.toString().slice(-3);

  return `${apellido}_${nombre}_(${ultimos3})`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}





